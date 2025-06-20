
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"
import { createCategory, createTag } from "@/utils/dataOperations"

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

  const addCategory = (name: string, color: string, icon: string) => {
    const newCategory = createCategory(name, color, icon)
    setCategories(prev => [...prev, newCategory])
    
    toast({
      title: "Categoria criada",
      description: `Categoria "${name}" criada com sucesso!`,
    })
  }

  const addTag = (name: string, color: string) => {
    const newTag = createTag(name, color)
    setTags(prev => [...prev, newTag])
    
    toast({
      title: "Etiqueta criada",
      description: `Etiqueta "${name}" criada com sucesso!`,
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

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed }
        return updatedTask
      }
      return task
    }))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))

    toast({
      title: "Tarefa removida",
      description: "Tarefa excluída com sucesso!",
    })
  }

  const toggleImportant = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, important: !task.important } : task
    ))
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
