import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { TopBar } from "@/components/TopBar"
import { MainContent } from "@/components/MainContent"
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"

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
  onAddClient: (clientData: {
    name: string
    email: string
    phone?: string
    company?: string
    contactPersonName?: string
    contactPersonEmail?: string
    contactPersonPhone?: string
  }) => void
  onAddProject: (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  onUpdateProject: (projectId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  onDeleteProject: (projectId: string) => void
  onArchiveClient: (clientId: string) => void
  onDeleteClient: (clientId: string) => void
  
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
  onUpdateProject,
  onDeleteProject,
  onArchiveClient,
  onDeleteClient,
  onViewChange,
  onProjectClick,
  onBackToClient,
}: MainLayoutProps) {
  const isClientView = selectedView.startsWith("client-")
  const currentClientId = isClientView ? selectedView.replace("client-", "") : null
  const currentClient = currentClientId ? clients.find(c => c.id === currentClientId) : null

  // Adapter function to convert old client format to new format
  const handleAddClientAdapter = (name: string, email: string, company?: string) => {
    onAddClient({
      name,
      email,
      company
    })
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <AppSidebar 
          selectedView={selectedView}
          onViewChange={onViewChange}
          clients={clients}
          onAddClient={onAddClient}
          onArchiveClient={onArchiveClient}
          onDeleteClient={onDeleteClient}
        />
        <main className="flex-1 flex flex-col">
          <TopBar
            selectedView={selectedView}
            selectedProject={selectedProject}
            currentClient={currentClient}
            onViewChange={onViewChange}
            onBackToClient={onBackToClient}
          />
          
          <MainContent
            tasks={tasks}
            clients={clients}
            projects={projects}
            categories={categories}
            tags={tags}
            selectedView={selectedView}
            selectedProject={selectedProject}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onToggleImportant={onToggleImportant}
            onUpdateTask={onUpdateTask}
            onAddCategory={onAddCategory}
            onAddTag={onAddTag}
            onAddProject={onAddProject}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
            onProjectClick={onProjectClick}
            onBackToClient={onBackToClient}
          />
        </main>
      </div>
    </SidebarProvider>
  )
}
