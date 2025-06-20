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

  console.log('useTasks hook - user:', user?.id, 'email:', user?.email)

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useTasks: No user found, returning empty array')
        return []
      }
      console.log('Fetching tasks for user:', user.id)
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching tasks:', error)
        throw error
      }
      
      console.log('Tasks fetched successfully:', data?.length || 0, 'tasks')
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
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('Creating task with data:', taskData)
      
      const dbTask = {
        user_id: user.id,
        title: taskData.text.trim(),
        description: taskData.notes || null,
        due_date: taskData.dueDate || null,
        priority: taskData.priority || 'medium',
        project_id: taskData.projectId || null,
        assigned_to: user.email || 'Usuário',
        status: 'new',
        completed: false
      }
      
      console.log('Inserting task into database:', dbTask)
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select()
        .single()
      
      if (error) {
        console.error('Database error creating task:', error)
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
    onError: (error: any) => {
      console.error('Error creating task:', error)
      toast({
        title: "Erro ao criar tarefa",
        description: error.message || "Erro desconhecido ao criar tarefa",
        variant: "destructive"
      })
    }
  })

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('toggleTaskMutation: Toggling task:', taskId)
      const task = tasks.find(t => t.id === taskId)
      if (!task) {
        console.error('toggleTaskMutation: Task not found:', taskId)
        throw new Error('Task not found')
      }
      
      const newCompleted = !task.completed
      const newStatus = newCompleted ? 'completed' : 'new'
      
      console.log('toggleTaskMutation: Updating task:', { taskId, newCompleted, newStatus })
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: newCompleted,
          status: newStatus
        })
        .eq('id', taskId)
      
      if (error) {
        console.error('toggleTaskMutation: Database error:', error)
        throw error
      }
      
      console.log('toggleTaskMutation: Task toggled successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      console.error('toggleTaskMutation: Error:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa: " + error.message,
        variant: "destructive"
      })
    }
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('deleteTaskMutation: Deleting task:', taskId)
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) {
        console.error('deleteTaskMutation: Database error:', error)
        throw error
      }
      
      console.log('deleteTaskMutation: Task deleted successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast({
        title: "Tarefa removida",
        description: "Tarefa deletada com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('deleteTaskMutation: Error:', error)
      toast({
        title: "Erro",
        description: "Erro ao deletar tarefa: " + error.message,
        variant: "destructive"
      })
    }
  })

  const toggleImportantMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('toggleImportantMutation: Toggling important for task:', taskId)
      const task = tasks.find(t => t.id === taskId)
      if (!task) {
        console.error('toggleImportantMutation: Task not found:', taskId)
        throw new Error('Task not found')
      }
      
      const newPriority = task.important ? 'medium' : 'high'
      
      console.log('toggleImportantMutation: Updating priority:', { taskId, newPriority })
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          priority: newPriority
        })
        .eq('id', taskId)
      
      if (error) {
        console.error('toggleImportantMutation: Database error:', error)
        throw error
      }
      
      console.log('toggleImportantMutation: Priority updated successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      console.error('toggleImportantMutation: Error:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar prioridade: " + error.message,
        variant: "destructive"
      })
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
      console.log('updateTaskMutation: Updating task:', taskId, 'with updates:', updates)
      
      const dbUpdates: any = {}
      
      if (updates.title) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
      if (updates.priority) dbUpdates.priority = updates.priority
      if (updates.completed !== undefined) {
        dbUpdates.completed = updates.completed
        dbUpdates.status = updates.completed ? 'completed' : 'new'
      }
      
      console.log('updateTaskMutation: Database updates:', dbUpdates)
      
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
      
      if (error) {
        console.error('updateTaskMutation: Database error:', error)
        throw error
      }
      
      console.log('updateTaskMutation: Task updated successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      console.error('updateTaskMutation: Error:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa: " + error.message,
        variant: "destructive"
      })
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
