
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { TaskList } from "@/components/TaskList"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate?: string
  projectId?: string
}

interface Project {
  id: string
  name: string
  value: number
  tasks: number
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedView, setSelectedView] = useState("myday")
  const { toast } = useToast()

  const addTask = (text: string, dueDate?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      important: false,
      dueDate,
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
          />
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Index
