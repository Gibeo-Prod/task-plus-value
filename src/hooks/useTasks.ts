
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Task, TaskTag } from '@/types/tasks'
import { mapTaskFromSupabase } from '@/utils/supabaseDataMappers'

export const useTasks = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(mapTaskFromSupabase) as Task[]
    },
    enabled: !!user
  })

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: {
      text: string
      dueDate?: string
      categoryId?: string
      priority?: 'low' | 'medium' | 'high'
      notes?: string
      reminderDate?: string
      tags?: TaskTag[]
      projectId?: string
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      console.log('Adding task with data:', taskData)
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.text,
          description: taskData.notes || null,
          due_date: taskData.dueDate || null,
          priority: taskData.priority || 'medium',
          project_id: taskData.projectId || null,
          assigned_to: user.email || 'Usuário',
          status: 'Pendente',
          completed: false
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating task:', error)
        throw error
      }
      
      console.log('Task created successfully:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast({
        title: "Tarefa adicionada",
        description: "Nova tarefa criada com sucesso!",
      })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa: " + error.message,
        variant: "destructive"
      })
    }
  })

  return {
    tasks,
    tasksLoading,
    addTask: addTaskMutation.mutate
  }
}
