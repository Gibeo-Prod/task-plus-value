
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
      company?: string
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          email: clientData.email,
          company: clientData.company
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

  return {
    clients,
    clientsLoading,
    addClient: addClientMutation.mutate
  }
}
