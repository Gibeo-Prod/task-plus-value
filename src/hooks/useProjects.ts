
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates'
import { Project } from '@/types/tasks'
import { mapProjectFromSupabase } from '@/utils/supabaseDataMappers'
import { toast } from 'sonner'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { getDefaultTemplate, applyTemplateToProject } = useChecklistTemplates()

  const fetchProjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mappedProjects = data?.map(mapProjectFromSupabase) || []
      setProjects(mappedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProject = async (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => {
    if (!user) return

    console.log('Adding project:', { clientId, projectData })

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          client_id: clientId,
          name: projectData.name,
          description: projectData.description,
          value: projectData.value,
          status: projectData.status,
          priority: projectData.priority,
          start_date: projectData.startDate || new Date().toISOString().split('T')[0],
          due_date: projectData.dueDate,
          user_id: user.id,
          category: 'general',
          progress: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      const newProject = mapProjectFromSupabase(data)
      setProjects(prev => [newProject, ...prev])

      // Apply default checklist template to the new project
      try {
        const defaultTemplate = getDefaultTemplate()
        if (defaultTemplate) {
          const tasksAdded = await applyTemplateToProject(defaultTemplate.id, newProject.id)
          toast.success(`Projeto criado com sucesso! ${tasksAdded} tarefas do checklist padrão foram adicionadas.`)
        } else {
          toast.success('Projeto criado com sucesso!')
        }
      } catch (templateError) {
        console.error('Error applying template:', templateError)
        toast.success('Projeto criado com sucesso, mas não foi possível aplicar o checklist padrão.')
      }

      return newProject
    } catch (error) {
      console.error('Error creating project:', error)
      if (error.message?.includes('category_check') || error.message?.includes('check constraint')) {
        toast.error('Erro ao criar projeto: categoria inválida. Tente novamente.')
      } else {
        toast.error('Erro ao criar projeto')
      }
      throw error
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  const updateProject = async (projectId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
    notes?: string
  }) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          description: projectData.description,
          value: projectData.value,
          status: projectData.status,
          priority: projectData.priority,
          start_date: projectData.startDate,
          due_date: projectData.dueDate,
          notes: projectData.notes,
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      const updatedProject = mapProjectFromSupabase(data)
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p))
      
      toast.success('Projeto atualizado com sucesso!')
      return updatedProject
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Erro ao atualizar projeto')
      throw error
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Projeto excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Erro ao excluir projeto')
      throw error
    }
  }

  return {
    projects,
    loading,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject
  }
}
