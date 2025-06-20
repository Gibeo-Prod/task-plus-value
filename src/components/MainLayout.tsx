
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { TaskList } from "@/components/TaskList"
import { ProjectList } from "@/components/ProjectList"
import { Breadcrumb } from "@/components/Breadcrumb"
import { useAuth } from "@/contexts/AuthContext"
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"
import { getFilteredTasks, getViewTitle, getViewSubtitle } from "@/utils/dataOperations"

interface MainLayoutProps {
  // State
  tasks: Task[]
  clients: Client[]
  projects: Project[]
  categories: TaskCategory[]
  tags: TaskTag[]
  selectedView: string
  selectedProject: Project | null
  loading?: boolean
  
  // Actions
  onAddTask: (data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
    projectId?: string
  }) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onToggleImportant: (id: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onAddCategory: (name: string, color: string, icon: string) => void
  onAddTag: (name: string, color: string) => void
  onAddClient: (name: string, email: string, company?: string) => void
  onAddProject: (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  
  // Navigation
  onViewChange: (view: string) => void
  onProjectClick: (project: Project) => void
  onBackToClient: () => void
}

export function MainLayout({
  tasks,
  clients,
  projects,
  categories,
  tags,
  selectedView,
  selectedProject,
  loading = false,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleImportant,
  onUpdateTask,
  onAddCategory,
  onAddTag,
  onAddClient,
  onAddProject,
  onViewChange,
  onProjectClick,
  onBackToClient,
}: MainLayoutProps) {
  const { signOut, user } = useAuth()
  
  // Check if we're viewing a client
  const isClientView = selectedView.startsWith("client-")
  const currentClientId = isClientView ? selectedView.replace("client-", "") : null
  const currentClient = currentClientId ? clients.find(c => c.id === currentClientId) : null
  const clientProjects = currentClient ? projects.filter(p => p.clientId === currentClient.id) : []
  const filteredTasks = getFilteredTasks(tasks, selectedView, selectedProject)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleAddTaskWithProject = (taskData: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
    projectId?: string
  }) => {
    // If we're in a project view, automatically assign the project ID
    if (selectedProject) {
      taskData.projectId = selectedProject.id
    }
    onAddTask(taskData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    if (selectedProject) {
      // Show tasks for selected project
      return (
        <TaskList
          tasks={filteredTasks}
          title={getViewTitle(selectedView, selectedProject, clients)}
          subtitle={getViewSubtitle(selectedView, selectedProject, clients)}
          onAddTask={handleAddTaskWithProject}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onToggleImportant={onToggleImportant}
          onUpdateTask={onUpdateTask}
          categories={categories}
          tags={tags}
          onAddCategory={onAddCategory}
          onAddTag={onAddTag}
          showBackButton={true}
          onBack={onBackToClient}
          projectId={selectedProject.id}
        />
      )
    }
    
    if (currentClient) {
      // Show projects for selected client
      return (
        <ProjectList
          client={currentClient}
          projects={clientProjects}
          onAddProject={(projectData) => onAddProject(currentClient.id, projectData)}
          onProjectClick={onProjectClick}
        />
      )
    }
    
    // Show default task views
    return (
      <TaskList
        tasks={filteredTasks}
        title={getViewTitle(selectedView, selectedProject, clients)}
        subtitle={getViewSubtitle(selectedView, selectedProject, clients)}
        onAddTask={handleAddTaskWithProject}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onToggleImportant={onToggleImportant}
        onUpdateTask={onUpdateTask}
        categories={categories}
        tags={tags}
        onAddCategory={onAddCategory}
        onAddTag={onAddTag}
      />
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <AppSidebar 
          selectedView={selectedView}
          onViewChange={onViewChange}
          clients={clients}
          onAddClient={onAddClient}
        />
        <main className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-ms-blue-light" />
                <h2 className="text-sm font-medium text-muted-foreground">
                  Agend
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hover:bg-ms-blue-light"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Breadcrumb Navigation */}
            <div className="px-4 pb-4">
              <Breadcrumb
                selectedView={selectedView}
                selectedProject={selectedProject}
                currentClient={currentClient}
                onViewChange={onViewChange}
                onBackToClient={onBackToClient}
              />
            </div>
          </div>
          
          {renderMainContent()}
        </main>
      </div>
    </SidebarProvider>
  )
}
