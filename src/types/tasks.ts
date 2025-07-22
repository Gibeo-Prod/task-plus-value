
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  important: boolean
  dueDate?: string
  projectId?: string | null // Explicitly allow null
  categoryId?: string
  priority?: 'low' | 'medium' | 'high'
  status: string
  assignedTo?: string
  tags?: TaskTag[]
  userId: string
  reminderDate?: string
  notes?: string
  text?: string
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
  task_id: string
  user_id: string
  reminder_date: string
  is_sent: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  projects: number
  contactPersonName?: string
  contactPersonEmail?: string
  contactPersonPhone?: string
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
  notes?: string
}

export interface ProjectInvite {
  id: string
  projectId: string
  clientId: string
  invitedBy: string
  token: string
  contactType: 'client' | 'contact_person'
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  expiresAt: string
  usedAt?: string
  createdAt: string
  updatedAt: string
}
