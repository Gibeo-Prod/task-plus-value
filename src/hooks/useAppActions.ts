
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"
import { createTask, createCategory, createTag, createClient, createProject } from "@/utils/dataOperations"

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
  toast
}: UseAppActionsProps) => {

  const addTask = (data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
  }) => {
    const newTask = createTask(data, selectedProject)
    setTasks(prev => [...prev, newTask])
    
    // Update project task count
    if (selectedProject) {
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id 
          ? { ...project, tasks: project.tasks + 1 }
          : project
      ))
    }

    toast({
      title: "Tarefa adicionada",
      description: "Nova tarefa criada com sucesso!",
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

  const addClient = (name: string, email: string, company?: string) => {
    const newClient = createClient(name, email, company)
    setClients(prev => [...prev, newClient])
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
    const newProject = createProject(clientId, projectData)
    setProjects(prev => [...prev, newProject])
    
    // Update client project count
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, projects: client.projects + 1 }
        : client
    ))

    toast({
      title: "Projeto criado",
      description: `Projeto "${projectData.name}" criado com sucesso!`,
    })
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
        
        // Update project task count
        if (updatedTask.projectId) {
          setProjects(prevProjects => prevProjects.map(project => 
            project.id === updatedTask.projectId 
              ? { 
                  ...project, 
                  tasks: updatedTask.completed 
                    ? project.tasks - 1 
                    : project.tasks + 1 
                }
              : project
          ))
        }
        
        return updatedTask
      }
      return task
    }))
  }

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id)
    
    setTasks(prev => prev.filter(task => task.id !== id))
    
    // Update project task count
    if (taskToDelete?.projectId && !taskToDelete.completed) {
      setProjects(prev => prev.map(project => 
        project.id === taskToDelete.projectId 
          ? { ...project, tasks: project.tasks - 1 }
          : project
      ))
    }

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
    addTask,
    addCategory,
    addTag,
    addClient,
    addProject,
    updateTask,
    toggleTask,
    deleteTask,
    toggleImportant
  }
}
