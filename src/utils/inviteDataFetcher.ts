
import { supabase } from "@/integrations/supabase/client"
import { ProjectInviteData } from "@/types/projectInvite"

export const fetchInviteByToken = async (token: string) => {
  const { data: inviteArray, error: arrayError } = await supabase
    .from('project_invites')
    .select('*')
    .eq('token', token)

  console.log('Invite array response:', inviteArray)
  console.log('Array error:', arrayError)

  return { inviteArray, arrayError }
}

export const fetchRelatedData = async (projectId: string, clientId: string) => {
  const [projectResponse, clientResponse] = await Promise.all([
    supabase
      .from('projects')
      .select('name, description, value, status, priority, start_date, due_date')
      .eq('id', projectId),
    supabase
      .from('clients')
      .select('name, company')
      .eq('id', clientId)
  ])

  console.log('Project response:', projectResponse)
  console.log('Client response:', clientResponse)

  return { projectResponse, clientResponse }
}

export const buildCompleteInvite = (basicInvite: any, projectData: any, clientData: any): ProjectInviteData => {
  return {
    id: basicInvite.id,
    project: projectData,
    client: clientData,
    recipient_name: basicInvite.recipient_name,
    contact_type: basicInvite.contact_type,
    expires_at: basicInvite.expires_at,
    used_at: basicInvite.used_at
  }
}
