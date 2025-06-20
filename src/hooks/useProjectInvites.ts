
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ProjectInvite, Client, Project } from '@/types/tasks'

export const useProjectInvites = (projectId?: string) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['project-invites', projectId],
    queryFn: async () => {
      if (!projectId || !user) return []
      
      const { data, error } = await supabase
        .from('project_invites')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Map the database fields to match our ProjectInvite interface
      return data.map(invite => ({
        id: invite.id,
        projectId: invite.project_id,
        clientId: invite.client_id,
        invitedBy: invite.invited_by,
        token: invite.token,
        contactType: invite.contact_type as 'client' | 'contact_person',
        recipientName: invite.recipient_name,
        recipientPhone: invite.recipient_phone,
        recipientEmail: invite.recipient_email,
        expiresAt: invite.expires_at,
        usedAt: invite.used_at,
        createdAt: invite.created_at,
        updatedAt: invite.updated_at
      } as ProjectInvite))
    },
    enabled: !!projectId && !!user
  })

  const createInviteMutation = useMutation({
    mutationFn: async (inviteData: {
      projectId: string
      clientId: string
      contactType: 'client' | 'contact_person'
      recipientName: string
      recipientPhone: string
      recipientEmail?: string
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      // Generate unique token
      const token = crypto.randomUUID()
      
      const { data, error } = await supabase
        .from('project_invites')
        .insert({
          project_id: inviteData.projectId,
          client_id: inviteData.clientId,
          invited_by: user.id,
          token,
          contact_type: inviteData.contactType,
          recipient_name: inviteData.recipientName,
          recipient_phone: inviteData.recipientPhone,
          recipient_email: inviteData.recipientEmail
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-invites'] })
      toast({
        title: "Convite criado",
        description: "Link de convite gerado com sucesso!",
      })
    },
    onError: (error) => {
      console.error('Error creating invite:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar convite: " + error.message,
        variant: "destructive"
      })
    }
  })

  const generateWhatsAppMessage = (
    invite: ProjectInvite, 
    project: Project, 
    client: Client
  ) => {
    const inviteUrl = `${window.location.origin}/projeto-convite/${invite.token}`
    
    const message = `Olá ${invite.recipientName}! 👋

Você foi convidado(a) para acompanhar o projeto "${project.name}" da ${client.company || client.name}.

🔗 Acesse agora: ${inviteUrl}

Através deste link você poderá:
✅ Visualizar detalhes do projeto
✅ Conversar sobre o projeto no chat
✅ Acompanhar o andamento das tarefas

O link é válido por 30 dias.

Atenciosamente,
Equipe do Projeto`

    return encodeURIComponent(message)
  }

  const sendWhatsAppInvite = (
    invite: ProjectInvite, 
    project: Project, 
    client: Client
  ) => {
    const message = generateWhatsAppMessage(invite, project, client)
    const whatsappUrl = `https://wa.me/55${invite.recipientPhone.replace(/\D/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return {
    invites,
    isLoading,
    createInvite: createInviteMutation.mutate,
    sendWhatsAppInvite,
    generateWhatsAppMessage
  }
}
