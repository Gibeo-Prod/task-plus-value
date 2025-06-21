
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ProjectInviteData } from "@/types/projectInvite"
import { debugTokenSearch, searchSimilarTokens } from "@/utils/inviteTokenDebugger"
import { fetchInviteByToken, fetchRelatedData, buildCompleteInvite } from "@/utils/inviteDataFetcher"
import { validateInvite } from "@/utils/inviteValidation"

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

      console.log('Attempt:', retryCount + 1)

      try {
        // Debug token search
        await debugTokenSearch(token)

        // Fetch invite by token
        const { inviteArray, arrayError } = await fetchInviteByToken(token)

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
          
          // Search for similar tokens
          await searchSimilarTokens(token)
          
          setError("Convite não encontrado")
          setLoading(false)
          return
        }

        const basicInvite = inviteArray[0]
        console.log('Found invite:', basicInvite)

        // Validate invite
        const validation = validateInvite(basicInvite)
        if (!validation.isValid) {
          setError(validation.error!)
          setLoading(false)
          return
        }

        // Fetch related data
        const { projectResponse, clientResponse } = await fetchRelatedData(
          basicInvite.project_id, 
          basicInvite.client_id
        )

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

        // Build complete invite object
        const completeInvite = buildCompleteInvite(
          basicInvite,
          projectResponse.data[0],
          clientResponse.data[0]
        )

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
