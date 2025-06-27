
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
          category: 'Interior Design',
          progress: 0
        })
        .select()
        .single()

      if (error) throw error

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
      toast.error('Erro ao criar projeto')
      throw error
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  return {
    projects,
    loading,
    fetchProjects,
    addProject
  }
}
