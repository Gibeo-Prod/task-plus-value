
import { Project, Client } from '@/types/tasks'

export interface ProjectStatus {
  id: string
  name: string
  color: string
  sort_order: number
  userId: string
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  projects: Project[]
  count: number
}

// Re-export existing types from tasks.ts
export type { Project, Client } from '@/types/tasks'
