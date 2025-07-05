import { Task, TaskCategory, TaskTag, Client, Project } from '@/types/tasks'

export const mapTaskFromSupabase = (task: any): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  important: task.priority === 'high',
  dueDate: task.due_date,
  projectId: task.project_id,
  categoryId: null, // Not available in new structure
  priority: task.priority as 'low' | 'medium' | 'high',
  status: task.status, // Usar status diretamente sem mapeamento
  assignedTo: task.assigned_to,
  tags: [],
  userId: task.user_id,
  reminderDate: undefined, // Not available in new structure
  notes: task.description, // Map description to notes for backward compatibility
  text: task.title // Map title to text for backward compatibility
})

export const mapProjectFromSupabase = (project: any): Project => {
  console.log('Mapping project from Supabase:', { id: project.id, name: project.name, status: project.status })
  
  const mappedProject = {
    id: project.id,
    name: project.name,
    clientId: project.client_id,
    value: Number(project.value),
    description: project.description,
    startDate: project.start_date,
    dueDate: project.due_date,
    status: project.status, // Usar o status exato do banco (já padronizado pela migração)
    priority: project.priority as 'low' | 'medium' | 'high',
    tasks: 0 // Will be calculated separately
  }
  
  console.log('Mapped project:', mappedProject)
  return mappedProject
}

export const mapClientFromSupabase = (client: any, projects: Project[]): Client => ({
  id: client.id,
  name: client.name,
  email: client.email,
  phone: client.phone,
  company: client.company,
  projects: projects.filter(project => project.clientId === client.id).length,
  contactPersonName: client.contact_person_name,
  contactPersonEmail: client.contact_person_email,
  contactPersonPhone: client.contact_person_phone
})

export const mapCategoryFromSupabase = (category: any): TaskCategory => ({
  id: category.id,
  name: category.name,
  color: category.color,
  icon: category.icon || 'folder',
  userId: category.user_id
})

export const mapTagFromSupabase = (tag: any): TaskTag => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
  userId: tag.user_id
})

export const mapStatusToDb = (frontendStatus: string): string => {
  console.log(`Using status directly: '${frontendStatus}'`)
  return frontendStatus
}

export const mapStatusFromDb = (dbStatus: string): string => {
  console.log(`Using status directly: '${dbStatus}'`)
  return dbStatus
}
