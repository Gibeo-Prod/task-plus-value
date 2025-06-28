
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ProjectStatus } from '@/types/projects'
import { toast } from 'sonner'

export const useProjectStatuses = () => {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchStatuses = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('project_statuses')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })

      if (error) throw error

      const mappedStatuses = data?.map(status => ({
        id: status.id,
        name: status.name,
        color: status.color,
        sort_order: status.sort_order,
        userId: status.user_id
      })) || []

      setStatuses(mappedStatuses)
    } catch (error) {
      console.error('Error fetching project statuses:', error)
      toast.error('Erro ao carregar status dos projetos')
    } finally {
      setLoading(false)
    }
  }

  const addStatus = async (name: string, color: string) => {
    if (!user) return

    try {
      const maxOrder = Math.max(...statuses.map(s => s.sort_order), -1)
      
      const { data, error } = await supabase
        .from('project_statuses')
        .insert({
          user_id: user.id,
          name,
          color,
          sort_order: maxOrder + 1
        })
        .select()
        .single()

      if (error) throw error

      const newStatus: ProjectStatus = {
        id: data.id,
        name: data.name,
        color: data.color,
        sort_order: data.sort_order,
        userId: data.user_id
      }

      setStatuses(prev => [...prev, newStatus].sort((a, b) => a.sort_order - b.sort_order))
      toast.success('Status criado com sucesso!')
      return newStatus
    } catch (error) {
      console.error('Error creating status:', error)
      toast.error('Erro ao criar status')
      throw error
    }
  }

  const updateStatus = async (id: string, updates: Partial<Pick<ProjectStatus, 'name' | 'color'>>) => {
    try {
      const { error } = await supabase
        .from('project_statuses')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setStatuses(prev => prev.map(status => 
        status.id === id ? { ...status, ...updates } : status
      ))

      toast.success('Status atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar status')
      throw error
    }
  }

  const deleteStatus = async (id: string) => {
    try {
      // Verificar se existem projetos com este status
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', statuses.find(s => s.id === id)?.name)

      if (count && count > 0) {
        toast.error('Não é possível excluir um status que possui projetos associados')
        return false
      }

      const { error } = await supabase
        .from('project_statuses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setStatuses(prev => prev.filter(status => status.id !== id))
      toast.success('Status excluído com sucesso!')
      return true
    } catch (error) {
      console.error('Error deleting status:', error)
      toast.error('Erro ao excluir status')
      return false
    }
  }

  const reorderStatuses = async (reorderedStatuses: ProjectStatus[]) => {
    try {
      const updates = reorderedStatuses.map((status, index) => ({
        id: status.id,
        sort_order: index
      }))

      for (const update of updates) {
        await supabase
          .from('project_statuses')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)
      }

      setStatuses(reorderedStatuses)
      toast.success('Ordem dos status atualizada!')
    } catch (error) {
      console.error('Error reordering statuses:', error)
      toast.error('Erro ao reordenar status')
    }
  }

  useEffect(() => {
    fetchStatuses()
  }, [user])

  return {
    statuses,
    loading,
    fetchStatuses,
    addStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses
  }
}
