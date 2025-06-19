
export interface Task {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate?: string
  projectId?: string
  categoryId?: string
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  reminderDate?: string
  tags?: TaskTag[]
  assignedTo?: string
}

export interface TaskCategory {
  id: string
  name: string
  color: string
  icon: string
  userId: string
}

export interface TaskTag {
  id: string
  name: string
  color: string
  userId: string
}

export interface TaskReminder {
  id: string
  taskId: string
  userId: string
  reminderDate: string
  isSent: boolean
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  projects: number
}

export interface Project {
  id: string
  name: string
  clientId: string
  value: number
  description?: string
  startDate?: string
  dueDate?: string
  status: string
  priority: 'low' | 'medium' | 'high'
  tasks: number
}
