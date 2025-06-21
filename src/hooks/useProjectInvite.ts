
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
    const fetchInvite = async () => {
      if (!token) {
        setError("Token de convite inválido")
        setLoading(false)
        return
      }

      console.log('Fetching invite with token:', token)

      try {
        // Primeiro, vamos buscar o convite básico para verificar se existe
        const { data: basicInvite, error: basicError } = await supabase
          .from('project_invites')
          .select('*')
          .eq('token', token)
          .single()

        console.log('Basic invite data:', basicInvite)
        console.log('Basic invite error:', basicError)

        if (basicError) {
          console.error('Error fetching basic invite:', basicError)
          if (basicError.code === 'PGRST116') {
            setError("Convite não encontrado")
          } else {
            setError("Erro ao carregar convite: " + basicError.message)
          }
          setLoading(false)
          return
        }

        // Check if invite has expired
        const now = new Date()
        const expiresAt = new Date(basicInvite.expires_at)
        if (now > expiresAt) {
          setError("Este convite expirou")
          setLoading(false)
          return
        }

        // Agora vamos buscar os dados relacionados separadamente
        const [projectResponse, clientResponse] = await Promise.all([
          supabase
            .from('projects')
            .select('name, description, value, status, priority, start_date, due_date')
            .eq('id', basicInvite.project_id)
            .single(),
          supabase
            .from('clients')
            .select('name, company')
            .eq('id', basicInvite.client_id)
            .single()
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

        // Construir o objeto de dados completo
        const completeInvite: ProjectInviteData = {
          id: basicInvite.id,
          project: projectResponse.data,
          client: clientResponse.data,
          recipient_name: basicInvite.recipient_name,
          contact_type: basicInvite.contact_type,
          expires_at: basicInvite.expires_at,
          used_at: basicInvite.used_at
        }

        console.log('Complete invite data:', completeInvite)
        setInvite(completeInvite)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError("Erro inesperado ao carregar convite")
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
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
