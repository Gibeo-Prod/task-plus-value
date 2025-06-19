import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { TaskList } from "@/components/TaskList"
import { useToast } from "@/hooks/use-toast"
import { Task, TaskCategory, TaskTag, Project } from "@/types/tasks"

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<TaskCategory[]>([
    {
      id: "personal",
      name: "Pessoal",
      color: "#3b82f6",
      icon: "home",
      userId: "demo"
    },
    {
      id: "work",
      name: "Trabalho",
      color: "#10b981",
      icon: "briefcase",
      userId: "demo"
    }
  ])
  const [tags, setTags] = useState<TaskTag[]>([
    {
      id: "urgent",
      name: "Urgente",
      color: "#ef4444",
      userId: "demo"
    },
    {
      id: "meeting",
      name: "Reunião",
      color: "#8b5cf6",
      userId: "demo"
    }
  ])
  const [selectedView, setSelectedView] = useState("myday")
  const { toast } = useToast()

  const addTask = (data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: data.text,
      completed: false,
      important: false,
      dueDate: data.dueDate,
      categoryId: data.categoryId,
      priority: data.priority || 'medium',
      notes: data.notes,
      reminderDate: data.reminderDate,
      tags: data.tags || [],
      projectId: selectedView.startsWith("project-") ? selectedView : undefined,
    }

    setTasks(prev => [...prev, newTask])
    
    // Update project task count
    if (selectedView.startsWith("project-")) {
      setProjects(prev => prev.map(project => 
        project.id === selectedView 
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
    const newCategory: TaskCategory = {
      id: `category-${Date.now()}`,
      name,
      color,
      icon,
      userId: "demo"
    }
    setCategories(prev => [...prev, newCategory])
    
    toast({
      title: "Categoria criada",
      description: `Categoria "${name}" criada com sucesso!`,
    })
  }

  const addTag = (name: string, color: string) => {
    const newTag: TaskTag = {
      id: `tag-${Date.now()}`,
      name,
      color,
      userId: "demo"
    }
    setTags(prev => [...prev, newTag])
    
    toast({
      title: "Etiqueta criada",
      description: `Etiqueta "${name}" criada com sucesso!`,
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

  const addProject = (name: string, value: number) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      value,
      tasks: 0,
    }

    setProjects(prev => [...prev, newProject])
  }

  const getFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    
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
        if (selectedView.startsWith("project-")) {
          return tasks.filter(task => task.projectId === selectedView)
        }
        return tasks
    }
  }

  const getViewTitle = () => {
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
        if (selectedView.startsWith("project-")) {
          const project = projects.find(p => p.id === selectedView)
          return project?.name || "Projeto"
        }
        return "Tarefas"
    }
  }

  const getViewSubtitle = () => {
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
        if (selectedView.startsWith("project-")) {
          const project = projects.find(p => p.id === selectedView)
          return project ? `Valor: R$ ${project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ""
        }
        return ""
    }
  }

  const filteredTasks = getFilteredTasks()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <AppSidebar 
          selectedView={selectedView}
          onViewChange={setSelectedView}
          projects={projects}
          onAddProject={addProject}
        />
        <main className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 p-4">
              <SidebarTrigger className="hover:bg-ms-blue-light" />
              <h2 className="text-sm font-medium text-muted-foreground">
                Microsoft To-Do Clone
              </h2>
            </div>
          </div>
          
          <TaskList
            tasks={filteredTasks}
            title={getViewTitle()}
            subtitle={getViewSubtitle()}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onToggleImportant={toggleImportant}
            onUpdateTask={updateTask}
            categories={categories}
            tags={tags}
            onAddCategory={addCategory}
            onAddTag={addTag}
          />
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Index
