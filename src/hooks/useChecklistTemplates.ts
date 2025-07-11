
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface ChecklistTemplate {
  id: string
  name: string
  description?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ChecklistTemplateItem {
  id: string
  template_id: string
  title: string
  description?: string
  category: string
  sort_order: number
  created_at: string
}

export const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchTemplates = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplateItems = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching template items:', error)
      return []
    }
  }

  const createTemplateFromItems = async (templateName: string, items: ChecklistTemplateItem[]) => {
    if (!user) return

    try {
      // Create template
      const { data: template, error: templateError } = await supabase
        .from('checklist_templates')
        .insert({
          name: templateName,
          description: `Template baseado em ${items.length} itens`,
          is_default: false,
          user_id: user.id
        })
        .select()
        .single()

      if (templateError) throw templateError

      // Create template items
      const templateItems = items.map((item, index) => ({
        template_id: template.id,
        title: item.title,
        description: item.description,
        category: item.category,
        sort_order: index
      }))

      const { error: itemsError } = await supabase
        .from('checklist_template_items')
        .insert(templateItems)

      if (itemsError) throw itemsError

      await fetchTemplates()
      return template
    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    }
  }

  const applyTemplateToProject = async (templateId: string, projectId: string) => {
    if (!user) return

    try {
      const items = await fetchTemplateItems(templateId)
      
      const tasks = items.map(item => ({
        title: item.title,
        description: item.description || `Categoria: ${item.category}`,
        project_id: projectId,
        user_id: user.id,
        status: 'new',
        priority: 'medium',
        completed: false
      }))

      const { error } = await supabase
        .from('tasks')
        .insert(tasks)

      if (error) throw error

      return tasks.length
    } catch (error) {
      console.error('Error applying template to project:', error)
      throw error
    }
  }

  const updateTemplate = async (templateId: string, templateData: { name: string; description?: string }) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('checklist_templates')
        .update({
          name: templateData.name,
          description: templateData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('user_id', user.id)

      if (error) throw error

      await fetchTemplates()
    } catch (error) {
      console.error('Error updating template:', error)
      throw error
    }
  }

  const updateTemplateItem = async (itemId: string, itemData: { title: string; description?: string; category: string }) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('checklist_template_items')
        .update({
          title: itemData.title,
          description: itemData.description,
          category: itemData.category
        })
        .eq('id', itemId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating template item:', error)
      throw error
    }
  }

  const addTemplateItem = async (templateId: string, itemData: { title: string; description?: string; category: string }) => {
    if (!user) return

    try {
      // Get the highest sort_order for this template
      const { data: existingItems, error: fetchError } = await supabase
        .from('checklist_template_items')
        .select('sort_order')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      const nextSortOrder = existingItems && existingItems.length > 0 ? existingItems[0].sort_order + 1 : 1

      const { error } = await supabase
        .from('checklist_template_items')
        .insert({
          template_id: templateId,
          title: itemData.title,
          description: itemData.description,
          category: itemData.category,
          sort_order: nextSortOrder
        })

      if (error) throw error
    } catch (error) {
      console.error('Error adding template item:', error)
      throw error
    }
  }

  const deleteTemplateItem = async (itemId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('checklist_template_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting template item:', error)
      throw error
    }
  }

  const getDefaultTemplate = () => {
    return templates.find(t => t.is_default) || templates[0]
  }

  useEffect(() => {
    fetchTemplates()
  }, [user])

  return {
    templates,
    loading,
    fetchTemplates,
    fetchTemplateItems,
    createTemplateFromItems,
    applyTemplateToProject,
    updateTemplate,
    updateTemplateItem,
    addTemplateItem,
    deleteTemplateItem,
    getDefaultTemplate
  }
}
