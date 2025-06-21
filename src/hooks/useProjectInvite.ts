
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ProjectInviteData {
  id: string
  project: {
    name: string
    description: string
    value: number
    status: string
    priority: string
    start_date: string
    due_date: string
  }
  client: {
    name: string
    company: string
  }
  recipient_name: string
  contact_type: string
  expires_at: string
  used_at: string | null
}

export const useProjectInvite = (token: string | undefined) => {
  const { toast } = useToast()
  const [invite, setInvite] = useState<ProjectInviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInviteWithRetry = async (retryCount = 0) => {
      if (!token) {
        console.log('No token provided')
        setError("Token de convite inválido")
        setLoading(false)
        return
      }

      console.log('Fetching invite with token:', token, 'Attempt:', retryCount + 1)
      console.log('Token length:', token.length)
      console.log('Token type:', typeof token)

      try {
        // Primeiro, vamos fazer uma busca geral para ver quantos convites existem
        const { data: allInvites, error: countError } = await supabase
          .from('project_invites')
          .select('token, id, recipient_name, created_at')
          .limit(10)

        console.log('Total invites in database (sample):', allInvites?.length || 0)
        console.log('All invite details:', allInvites)
        
        if (allInvites && allInvites.length > 0) {
          console.log('Exact token comparison:')
          allInvites.forEach((inv, index) => {
            const matches = inv.token === token
            console.log(`${index + 1}. DB Token: "${inv.token}" (length: ${inv.token?.length || 0}) | Matches: ${matches}`)
            if (inv.token && token) {
              // Check character by character for debugging
              let diffFound = false
              for (let i = 0; i < Math.max(inv.token.length, token.length); i++) {
                if (inv.token[i] !== token[i]) {
                  console.log(`   Diff at position ${i}: DB="${inv.token[i] || 'undefined'}" vs Input="${token[i] || 'undefined'}"`)
                  diffFound = true
                  break
                }
              }
              if (!diffFound && inv.token.length === token.length) {
                console.log('   Tokens are identical character by character')
              }
            }
          })
        }

        // Agora buscar especificamente pelo token
        const { data: inviteArray, error: arrayError } = await supabase
          .from('project_invites')
          .select('*')
          .eq('token', token)

        console.log('Invite array response:', inviteArray)
        console.log('Array error:', arrayError)

        if (arrayError) {
          console.error('Error fetching invite array:', arrayError)
          
          // Se for erro de rede ou temporário, tentar novamente
          if (retryCount < 2 && (arrayError.code === 'PGRST301' || arrayError.message.includes('network'))) {
            console.log('Retrying in 1 second...')
            setTimeout(() => fetchInviteWithRetry(retryCount + 1), 1000)
            return
          }
          
          setError("Erro ao carregar convite: " + arrayError.message)
          setLoading(false)
          return
        }

        // Verificar se encontrou o convite
        if (!inviteArray || inviteArray.length === 0) {
          console.log('No invite found with token:', token)
          
          // Try direct SQL approach as fallback
          console.log('Trying alternative query approaches...')
          
          // Try with ilike (case insensitive)
          const { data: ilikeResult } = await supabase
            .from('project_invites')
            .select('token, id')
            .ilike('token', token)
          
          console.log('Case-insensitive search result:', ilikeResult)
          
          // Try to find partial matches
          const { data: similarTokens } = await supabase
            .from('project_invites')
            .select('token, id, recipient_name')
            .or(`token.like.%${token.substring(0, 8)}%,token.like.%${token.substring(-8)}%`)
            .limit(5)
          
          console.log('Similar tokens found:', similarTokens)
          setError("Convite não encontrado")
          setLoading(false)
          return
        }

        const basicInvite = inviteArray[0]
        console.log('Found invite:', basicInvite)

        // Check if invite has expired
        const now = new Date()
        const expiresAt = new Date(basicInvite.expires_at)
        if (now > expiresAt) {
          setError("Este convite expirou")
          setLoading(false)
          return
        }

        // Agora vamos buscar os dados relacionados separadamente usando array
        const [projectResponse, clientResponse] = await Promise.all([
          supabase
            .from('projects')
            .select('name, description, value, status, priority, start_date, due_date')
            .eq('id', basicInvite.project_id),
          supabase
            .from('clients')
            .select('name, company')
            .eq('id', basicInvite.client_id)
        ])

        console.log('Project response:', projectResponse)
        console.log('Client response:', clientResponse)

        if (projectResponse.error) {
          console.error('Error fetching project:', projectResponse.error)
          setError("Erro ao carregar dados do projeto")
          setLoading(false)
          return
        }

        if (clientResponse.error) {
          console.error('Error fetching client:', clientResponse.error)
          setError("Erro ao carregar dados do cliente")
          setLoading(false)
          return
        }

        if (!projectResponse.data || projectResponse.data.length === 0) {
          setError("Projeto não encontrado")
          setLoading(false)
          return
        }

        if (!clientResponse.data || clientResponse.data.length === 0) {
          setError("Cliente não encontrado")
          setLoading(false)
          return
        }

        // Construir o objeto de dados completo
        const completeInvite: ProjectInviteData = {
          id: basicInvite.id,
          project: projectResponse.data[0],
          client: clientResponse.data[0],
          recipient_name: basicInvite.recipient_name,
          contact_type: basicInvite.contact_type,
          expires_at: basicInvite.expires_at,
          used_at: basicInvite.used_at
        }

        console.log('Complete invite data:', completeInvite)
        setInvite(completeInvite)
      } catch (err) {
        console.error('Unexpected error:', err)
        
        // Tentar novamente se for erro temporário
        if (retryCount < 2) {
          console.log('Retrying due to unexpected error...')
          setTimeout(() => fetchInviteWithRetry(retryCount + 1), 1000)
          return
        }
        
        setError("Erro inesperado ao carregar convite")
      } finally {
        setLoading(false)
      }
    }

    fetchInviteWithRetry()
  }, [token])

  const markAsUsed = async () => {
    if (!invite) return

    try {
      const { error } = await supabase
        .from('project_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id)

      if (error) throw error

      setInvite(prev => prev ? { ...prev, used_at: new Date().toISOString() } : null)
      
      toast({
        title: "Convite aceito!",
        description: "Você agora tem acesso ao projeto.",
      })
    } catch (err) {
      console.error('Error marking invite as used:', err)
      toast({
        title: "Erro",
        description: "Erro ao aceitar convite",
        variant: "destructive"
      })
    }
  }

  return {
    invite,
    loading,
    error,
    markAsUsed
  }
}
