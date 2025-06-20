import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Client, Project } from '@/types/tasks'
import { mapClientFromSupabase } from '@/utils/supabaseDataMappers'

export const useClients = (projects: Project[]) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', user?.id, projects],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(client => mapClientFromSupabase(client, projects)) as Client[]
    },
    enabled: !!user && projects !== undefined
  })

  const addClientMutation = useMutation({
    mutationFn: async (clientData: {
      name: string
      email: string
      phone?: string
      company?: string
      contactPersonName?: string
      contactPersonEmail?: string
      contactPersonPhone?: string
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          company: clientData.company,
          contact_person_name: clientData.contactPersonName,
          contact_person_email: clientData.contactPersonEmail,
          contact_person_phone: clientData.contactPersonPhone
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Cliente adicionado",
        description: "Novo cliente criado com sucesso!",
      })
    }
  })

  const archiveClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (!user) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('clients')
        .update({ archived: true })
        .eq('id', clientId)
        .eq('user_id', user.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Cliente arquivado",
        description: "Cliente foi arquivado com sucesso!",
      })
    }
  })

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (!user) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído permanentemente!",
      })
    }
  })

  return {
    clients,
    clientsLoading,
    addClient: addClientMutation.mutate,
    archiveClient: archiveClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate
  }
}
