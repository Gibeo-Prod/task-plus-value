
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface Reminder {
  id: string
  task_id: string
  user_id: string
  reminder_date: string
  is_sent: boolean
  created_at: string
  updated_at: string
}

export const useReminders = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('task_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true })
      
      if (error) {
        console.error('Error fetching reminders:', error)
        throw error
      }
      
      return data as Reminder[]
    },
    enabled: !!user
  })

  const createReminderMutation = useMutation({
    mutationFn: async ({ taskId, reminderDate }: { taskId: string, reminderDate: string }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { data, error } = await supabase
        .from('task_reminders')
        .insert({
          task_id: taskId,
          user_id: user.id,
          reminder_date: reminderDate,
          is_sent: false
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating reminder:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      toast({
        title: "Lembrete criado",
        description: "Lembrete configurado com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('Error creating reminder:', error)
      toast({
        title: "Erro ao criar lembrete",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  const updateReminderMutation = useMutation({
    mutationFn: async ({ reminderId, reminderDate }: { reminderId: string, reminderDate: string }) => {
      const { data, error } = await supabase
        .from('task_reminders')
        .update({ reminder_date: reminderDate })
        .eq('id', reminderId)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating reminder:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      toast({
        title: "Lembrete atualizado",
        description: "Lembrete atualizado com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('Error updating reminder:', error)
      toast({
        title: "Erro ao atualizar lembrete",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('task_reminders')
        .delete()
        .eq('id', reminderId)
      
      if (error) {
        console.error('Error deleting reminder:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      toast({
        title: "Lembrete removido",
        description: "Lembrete removido com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('Error deleting reminder:', error)
      toast({
        title: "Erro ao remover lembrete",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  const getReminderForTask = (taskId: string): Reminder | undefined => {
    return reminders.find(reminder => reminder.task_id === taskId)
  }

  return {
    reminders,
    isLoading,
    createReminder: createReminderMutation.mutate,
    updateReminder: updateReminderMutation.mutate,
    deleteReminder: deleteReminderMutation.mutate,
    getReminderForTask
  }
}
