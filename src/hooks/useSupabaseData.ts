
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Task, TaskCategory, TaskTag, Client, Project } from '@/types/tasks'

export const useSupabaseData = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch tasks
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
      
      // Transform Supabase data to app format
      return data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        important: task.priority === 'high',
        dueDate: task.due_date,
        projectId: task.project_id,
        categoryId: null, // Not available in new structure
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status,
        assignedTo: task.assigned_to,
        tags: [],
        userId: task.user_id,
        reminderDate: undefined, // Not available in new structure
        notes: task.description, // Map description to notes for backward compatibility
        text: task.title // Map title to text for backward compatibility
      })) as Task[]
    },
    enabled: !!user
  })

  // Fetch projects first
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
      
      return data.map(project => ({
        id: project.id,
        name: project.name,
        clientId: project.client_id,
        value: Number(project.value),
        description: project.description,
        startDate: project.start_date,
        dueDate: project.due_date,
        status: project.status,
        priority: project.priority as 'low' | 'medium' | 'high',
        tasks: 0 // Will be calculated separately
      })) as Project[]
    },
    enabled: !!user
  })

  // Fetch clients and calculate project count
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
      
      // Calculate project count for each client
      return data.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        projects: projects.filter(project => project.clientId === client.id).length
      })) as Client[]
    },
    enabled: !!user && projects !== undefined
  })

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon || 'folder',
        userId: category.user_id
      })) as TaskCategory[]
    },
    enabled: !!user
  })

  // Fetch tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('task_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        userId: tag.user_id
      })) as TaskTag[]
    },
    enabled: !!user
  })

  // Helper function to map frontend status to database values
  const mapStatusToDb = (frontendStatus: string): string => {
    const statusMap = {
      'planejamento': 'new',
      'em-andamento': 'in_progress',
      'em-revisao': 'in_review',
      'concluido': 'completed',
      'pausado': 'on_hold',
      'cancelado': 'cancelled'
    }
    return statusMap[frontendStatus as keyof typeof statusMap] || 'new'
  }

  // Add task mutation
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

  // Add client mutation
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

  // Add project mutation
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
          category: 'other', // Use valid constraint value
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
    tasks,
    clients,
    projects,
    categories,
    tags,
    loading: tasksLoading || clientsLoading || projectsLoading || categoriesLoading || tagsLoading,
    addTask: addTaskMutation.mutate,
    addClient: addClientMutation.mutate,
    addProject: addProjectMutation.mutate
  }
}
