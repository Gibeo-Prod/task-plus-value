
import { Task, TaskCategory, TaskTag, Project } from "@/types/tasks"

interface AppState {
  tasks: Task[]
  clients: any[]
  projects: Project[]
  categories: TaskCategory[]
  tags: TaskTag[]
  selectedView: string
  selectedProject: Project | null
  addTask: (data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
    projectId?: string
  }) => void
  addClient: (clientData: {
    name: string
    email: string
    phone?: string
    company?: string
    contactPersonName?: string
    contactPersonEmail?: string
    contactPersonPhone?: string
  }) => void
  addProject: (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  addCategory: (name: string, color: string, icon: string) => void
  addTag: (name: string, color: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  toggleImportant: (id: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  toast: any
}

export const useAppActions = (appState: AppState) => {
  const addTask = (taskData: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
    projectId?: string
  }) => {
    try {
      console.log('Adding task:', taskData)
      appState.addTask(taskData)
    } catch (error) {
      console.error('Error adding task:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao adicionar tarefa: " + error,
        variant: "destructive"
      })
    }
  }

  const addClient = (clientData: {
    name: string
    email: string
    phone?: string
    company?: string
    contactPersonName?: string
    contactPersonEmail?: string
    contactPersonPhone?: string
  }) => {
    try {
      console.log('Adding client:', clientData)
      appState.addClient(clientData)
    } catch (error) {
      console.error('Error adding client:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao adicionar cliente: " + error,
        variant: "destructive"
      })
    }
  }

  const addProject = (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => {
    try {
      console.log('Adding project:', { clientId, projectData })
      appState.addProject(clientId, projectData)
    } catch (error) {
      console.error('Error adding project:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao adicionar projeto: " + error,
        variant: "destructive"
      })
    }
  }

  const addCategory = (name: string, color: string, icon: string) => {
    try {
      console.log('Adding category:', { name, color, icon })
      appState.addCategory(name, color, icon)
    } catch (error) {
      console.error('Error adding category:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao adicionar categoria: " + error,
        variant: "destructive"
      })
    }
  }

  const addTag = (name: string, color: string) => {
    try {
      console.log('Adding tag:', { name, color })
      appState.addTag(name, color)
    } catch (error) {
      console.error('Error adding tag:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao adicionar tag: " + error,
        variant: "destructive"
      })
    }
  }

  const toggleTask = (id: string) => {
    try {
      console.log('Toggling task:', id)
      appState.toggleTask(id)
    } catch (error) {
      console.error('Error toggling task:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao alternar status da tarefa: " + error,
        variant: "destructive"
      })
    }
  }

  const deleteTask = (id: string) => {
    try {
      console.log('Deleting task:', id)
      appState.deleteTask(id)
    } catch (error) {
      console.error('Error deleting task:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao excluir tarefa: " + error,
        variant: "destructive"
      })
    }
  }

  const toggleImportant = (id: string) => {
    try {
      console.log('Toggling important for task:', id)
      appState.toggleImportant(id)
    } catch (error) {
      console.error('Error toggling important:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao marcar como importante: " + error,
        variant: "destructive"
      })
    }
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('Updating task:', taskId, updates)
      appState.updateTask(taskId, updates)
    } catch (error) {
      console.error('Error updating task:', error)
      appState.toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa: " + error,
        variant: "destructive"
      })
    }
  }

  return {
    addTask,
    addClient,
    addProject,
    addCategory,
    addTag,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask
  }
}
