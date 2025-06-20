
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"

export const createTask = (
  data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
  },
  selectedProject: Project | null
): Task => {
  return {
    id: Date.now().toString(),
    title: data.text,
    description: data.notes,
    completed: false,
    important: false,
    dueDate: data.dueDate,
    categoryId: data.categoryId,
    priority: data.priority || 'medium',
    status: 'Pendente',
    assignedTo: 'Usuário',
    tags: data.tags || [],
    projectId: selectedProject?.id,
    userId: "demo"
  }
}

export const createCategory = (name: string, color: string, icon: string): TaskCategory => {
  return {
    id: `category-${Date.now()}`,
    name,
    color,
    icon,
    userId: "demo"
  }
}

export const createTag = (name: string, color: string): TaskTag => {
  return {
    id: `tag-${Date.now()}`,
    name,
    color,
    userId: "demo"
  }
}

export const createClient = (name: string, email: string, company?: string): Client => {
  return {
    id: `client-${Date.now()}`,
    name,
    email,
    company,
    projects: 0,
  }
}

export const createProject = (clientId: string, projectData: {
  name: string
  description?: string
  value: number
  status: string
  priority: 'low' | 'medium' | 'high'
  startDate?: string
  dueDate?: string
}): Project => {
  return {
    id: `project-${Date.now()}`,
    clientId,
    name: projectData.name,
    description: projectData.description,
    value: projectData.value,
    status: projectData.status,
    priority: projectData.priority,
    startDate: projectData.startDate,
    dueDate: projectData.dueDate,
    tasks: 0,
  }
}

export const getFilteredTasks = (
  tasks: Task[],
  selectedView: string,
  selectedProject: Project | null
): Task[] => {
  const today = new Date().toISOString().split('T')[0]
  
  if (selectedProject) {
    return tasks.filter(task => task.projectId === selectedProject.id)
  }
  
  switch (selectedView) {
    case "myday":
      return tasks.filter(task => 
        !task.completed && 
        (task.dueDate === today || task.important)
      )
    case "important":
      return tasks.filter(task => task.important)
    case "planned":
      return tasks.filter(task => task.dueDate)
    case "tasks":
      return tasks.filter(task => !task.projectId)
    default:
      return tasks
  }
}

export const getViewTitle = (selectedView: string, selectedProject: Project | null, clients: Client[]): string => {
  if (selectedProject) {
    return selectedProject.name
  }
  
  switch (selectedView) {
    case "myday":
      return "Meu Dia"
    case "important":
      return "Importante"
    case "planned":
      return "Planejado"
    case "tasks":
      return "Tarefas"
    default:
      if (selectedView.startsWith("client-")) {
        const client = clients.find(c => c.id === selectedView)
        return client?.name || "Cliente"
      }
      return "Tarefas"
  }
}

export const getViewSubtitle = (selectedView: string, selectedProject: Project | null, clients: Client[]): string => {
  if (selectedProject) {
    const client = clients.find(c => c.id === selectedProject.clientId)
    return `${client?.name || 'Cliente'} • Valor: R$ ${selectedProject.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }
  
  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  switch (selectedView) {
    case "myday":
      return today
    case "important":
      return "Tarefas marcadas como importantes"
    case "planned":
      return "Tarefas com data de vencimento"
    case "tasks":
      return "Todas as suas tarefas"
    default:
      return ""
  }
}
