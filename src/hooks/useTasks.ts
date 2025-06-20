
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Task, TaskTag } from '@/types/tasks'
import { mapTaskFromSupabase, mapStatusToDb } from '@/utils/supabaseDataMappers'

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
          status: 'new', // Use database-compatible status
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

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !task.completed,
          status: !task.completed ? 'completed' : 'new'
        })
        .eq('id', taskId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast({
        title: "Tarefa removida",
        description: "Tarefa deletada com sucesso!",
      })
    }
  })

  const toggleImportantMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          priority: task.important ? 'medium' : 'high'
        })
        .eq('id', taskId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
      const dbUpdates: any = {}
      
      if (updates.title) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
      if (updates.priority) dbUpdates.priority = updates.priority
      if (updates.completed !== undefined) {
        dbUpdates.completed = updates.completed
        dbUpdates.status = updates.completed ? 'completed' : 'new'
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  return {
    tasks,
    tasksLoading,
    addTask: addTaskMutation.mutate,
    toggleTask: toggleTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    toggleImportant: toggleImportantMutation.mutate,
    updateTask: (taskId: string, updates: Partial<Task>) => 
      updateTaskMutation.mutate({ taskId, updates })
  }
}
