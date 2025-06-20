
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Project } from '@/types/tasks'
import { mapProjectFromSupabase, mapStatusToDb } from '@/utils/supabaseDataMappers'

export const useProjects = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(mapProjectFromSupabase) as Project[]
    },
    enabled: !!user
  })

  const addProjectMutation = useMutation({
    mutationFn: async (projectData: {
      clientId: string
      name: string
      description?: string
      value: number
      status: string
      priority: 'low' | 'medium' | 'high'
      startDate?: string
      dueDate?: string
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      console.log('Adding project with data:', projectData)
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          client_id: projectData.clientId,
          name: projectData.name,
          description: projectData.description,
          value: projectData.value,
          status: mapStatusToDb(projectData.status),
          priority: projectData.priority,
          start_date: projectData.startDate || new Date().toISOString().split('T')[0],
          due_date: projectData.dueDate,
          category: 'other',
          assigned_to: user.email || 'Usuário'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating project:', error)
        throw error
      }
      
      console.log('Project created successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Projeto criado",
        description: "Novo projeto criado com sucesso!",
      })
    },
    onError: (error) => {
      console.error('Project mutation error:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar projeto: " + error.message,
        variant: "destructive"
      })
    }
  })

  return {
    projects,
    projectsLoading,
    addProject: addProjectMutation.mutate
  }
}
