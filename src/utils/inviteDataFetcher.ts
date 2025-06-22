
import { supabase } from "@/integrations/supabase/client"
import { ProjectInviteData } from "@/types/projectInvite"
import { getTokenSearchPatterns } from "./tokenHandler"

export const fetchInviteByToken = async (token: string) => {
  console.log('Searching for invite with token:', token)
  
  const searchPatterns = getTokenSearchPatterns(token)
  console.log('Token search patterns:', searchPatterns)

  // Try exact match first
  const { data: inviteArray, error: arrayError } = await supabase
    .from('project_invites')
    .select('*')
    .eq('token', searchPatterns.exact)

  console.log('Exact match result:', inviteArray)
  console.log('Exact match error:', arrayError)

  // If exact match found, return it
  if (inviteArray && inviteArray.length > 0) {
    return { inviteArray, arrayError }
  }

  // If no exact match and it's a short token, try case-insensitive search
  if (!searchPatterns.isUUID) {
    console.log('Trying case-insensitive search for short token')
    const { data: ilikeArray, error: ilikeError } = await supabase
      .from('project_invites')
      .select('*')
      .ilike('token', token)

    console.log('Case-insensitive result:', ilikeArray)
    
    if (ilikeArray && ilikeArray.length > 0) {
      return { inviteArray: ilikeArray, arrayError: ilikeError }
    }
  }

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
