import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user client to verify the current user
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      console.error('User verification failed:', userError)
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (rolesError) {
      console.error('Error checking user roles:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isAdmin = userRoles?.some(role => role.role === 'admin') || false
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start cleanup process with detailed logging
    console.log(`Starting deletion process for user: ${userId}`)

    try {
      // Step 1: Delete chat-related data
      console.log('Deleting chat participants...')
      await supabaseAdmin.from('chat_participants').delete().eq('user_id', userId)
      
      console.log('Deleting chat invitations...')
      await supabaseAdmin.from('chat_invitations').delete().eq('invited_by', userId)
      
      // Step 2: Delete task-related data
      console.log('Deleting task reminders...')
      await supabaseAdmin.from('task_reminders').delete().eq('user_id', userId)
      
      console.log('Deleting task tag assignments...')
      const { data: userTasks } = await supabaseAdmin.from('tasks').select('id').eq('user_id', userId)
      if (userTasks?.length) {
        const taskIds = userTasks.map(task => task.id)
        await supabaseAdmin.from('task_tag_assignments').delete().in('task_id', taskIds)
      }
      
      console.log('Deleting tasks...')
      await supabaseAdmin.from('tasks').delete().eq('user_id', userId)
      
      console.log('Deleting task categories...')
      await supabaseAdmin.from('task_categories').delete().eq('user_id', userId)
      
      console.log('Deleting task tags...')
      await supabaseAdmin.from('task_tags').delete().eq('user_id', userId)
      
      console.log('Deleting task statuses...')
      await supabaseAdmin.from('task_statuses').delete().eq('user_id', userId)
      
      // Step 3: Delete project-related data
      console.log('Deleting project invites...')
      await supabaseAdmin.from('project_invites').delete().eq('invited_by', userId)
      
      console.log('Deleting projects...')
      await supabaseAdmin.from('projects').delete().eq('user_id', userId)
      
      console.log('Deleting project statuses...')
      await supabaseAdmin.from('project_statuses').delete().eq('user_id', userId)
      
      // Step 4: Delete clients
      console.log('Deleting clients...')
      await supabaseAdmin.from('clients').delete().eq('user_id', userId)
      
      // Step 5: Delete checklist templates and items
      console.log('Deleting checklist template items...')
      const { data: userTemplates } = await supabaseAdmin.from('checklist_templates').select('id').eq('user_id', userId)
      if (userTemplates?.length) {
        const templateIds = userTemplates.map(template => template.id)
        await supabaseAdmin.from('checklist_template_items').delete().in('template_id', templateIds)
      }
      
      console.log('Deleting checklist templates...')
      await supabaseAdmin.from('checklist_templates').delete().eq('user_id', userId)
      
      // Step 6: Delete user roles
      console.log('Deleting user roles...')
      await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)
      
      // Step 7: Delete user profile (this should cascade or be handled last)
      console.log('Deleting user profile...')
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      
      // Step 8: Finally delete the auth user
      console.log('Deleting auth user...')
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (deleteError) {
        console.error('Error deleting auth user:', deleteError)
        return new Response(
          JSON.stringify({ error: `Failed to delete auth user: ${deleteError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`User and all related data deleted successfully: ${userId}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User and all related data deleted successfully' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (cleanupError) {
      console.error('Error during cleanup process:', cleanupError)
      return new Response(
        JSON.stringify({ error: `Failed during cleanup: ${cleanupError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})