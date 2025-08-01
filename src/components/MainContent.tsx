
import { TaskList } from "@/components/TaskList"
import { ProjectList } from "@/components/ProjectList"
import { ProjectDetails } from "@/components/ProjectDetails"
import { ChecklistTemplateManager } from "@/components/ChecklistTemplateManager"
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"
import { getFilteredTasks, getViewTitle, getViewSubtitle } from "@/utils/dataOperations"

interface MainContentProps {
  tasks: Task[]
  clients: Client[]
  projects: Project[]
  categories: TaskCategory[]
  tags: TaskTag[]
  selectedView: string
  selectedProject: Project | null
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
  onProjectClick: (project: Project) => void
  onBackToClient: () => void
}

export function MainContent({
  tasks,
  clients,
  projects,
  categories,
  tags,
  selectedView,
  selectedProject,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleImportant,
  onUpdateTask,
  onAddCategory,
  onAddTag,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onProjectClick,
  onBackToClient,
}: MainContentProps) {
  const isClientView = selectedView.startsWith("client-")
  const currentClientId = isClientView ? selectedView.replace("client-", "") : null
  const currentClient = currentClientId ? clients.find(c => c.id === currentClientId) : null
  const clientProjects = currentClient ? projects.filter(p => p.clientId === currentClient.id) : []
  const filteredTasks = getFilteredTasks(tasks, selectedView, selectedProject)
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : []

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
    if (selectedProject) {
      taskData.projectId = selectedProject.id
    }
    onAddTask(taskData)
  }

  // Template manager view
  if (selectedView === "templates") {
    return <ChecklistTemplateManager />
  }

  if (selectedProject) {
    // Find the client for this project
    const projectClient = clients.find(client => client.id === selectedProject.clientId)
    
    // If no client is found, show an error or create a fallback
    if (!projectClient) {
      return (
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cliente não encontrado para este projeto.</p>
            <button 
              onClick={onBackToClient}
              className="mt-4 text-primary hover:underline"
            >
              Voltar à lista de projetos
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <ProjectDetails
        project={selectedProject}
        client={projectClient}
        tasks={projectTasks}
        categories={categories}
        tags={tags}
        onBack={onBackToClient}
        onAddTask={handleAddTaskWithProject}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onToggleImportant={onToggleImportant}
        onUpdateTask={onUpdateTask}
        onAddCategory={onAddCategory}
        onAddTag={onAddTag}
        onUpdateProject={onUpdateProject}
      />
    )
  }
  
  if (currentClient) {
    return (
      <ProjectList
        client={currentClient}
        projects={clientProjects}
        onAddProject={(projectData) => onAddProject(currentClient.id, projectData)}
        onUpdateProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
        onProjectClick={onProjectClick}
      />
    )
  }
  
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
      projects={projects}
      clients={clients}
    />
  )
}
