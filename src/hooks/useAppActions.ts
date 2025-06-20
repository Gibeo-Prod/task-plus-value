
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"

interface UseAppActionsProps {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  clients: Client[]
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  categories: TaskCategory[]
  setCategories: React.Dispatch<React.SetStateAction<TaskCategory[]>>
  tags: TaskTag[]
  setTags: React.Dispatch<React.SetStateAction<TaskTag[]>>
  selectedProject: Project | null
  addTask: (data: any) => void
  addClient: (data: any) => void
  addProject: (data: any) => void
  addCategory: (name: string, color: string, icon: string) => void
  addTag: (name: string, color: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  toggleImportant: (id: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  toast: any
}

export const useAppActions = ({
  tasks,
  setTasks,
  clients,
  setClients,
  projects,
  setProjects,
  categories,
  setCategories,
  tags,
  setTags,
  selectedProject,
  addTask,
  addClient,
  addProject,
  addCategory,
  addTag,
  toggleTask,
  deleteTask,
  toggleImportant,
  updateTask,
  toast
}: UseAppActionsProps) => {

  const handleAddTask = (data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
  }) => {
    addTask({
      ...data,
      projectId: selectedProject?.id
    })
  }

  const handleAddClient = (name: string, email: string, company?: string) => {
    addClient({ name, email, company })
  }

  const handleAddProject = (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => {
    addProject({ clientId, ...projectData })
  }

  return {
    addTask: handleAddTask,
    addCategory,
    addTag,
    addClient: handleAddClient,
    addProject: handleAddProject,
    updateTask,
    toggleTask,
    deleteTask,
    toggleImportant
  }
}
