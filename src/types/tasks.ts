
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

export interface Project {
  id: string
  name: string
  value: number
  tasks: number
}
