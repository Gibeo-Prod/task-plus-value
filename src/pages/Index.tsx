
import { MainLayout } from "@/components/MainLayout"
import { useAppState } from "@/hooks/useAppState"
import { useAppActions } from "@/hooks/useAppActions"
import { Project } from "@/types/tasks"

const Index = () => {
  const appState = useAppState()
  const appActions = useAppActions(appState)

  const handleViewChange = (view: string) => {
    appState.setSelectedView(view)
    appState.setSelectedProject(null) // Reset selected project when changing view
  }

  const handleProjectClick = (project: Project) => {
    appState.setSelectedProject(project)
  }

  const handleBackToClient = () => {
    appState.setSelectedProject(null)
  }

  return (
    <MainLayout
      // State
      tasks={appState.tasks}
      clients={appState.clients}
      projects={appState.projects}
      categories={appState.categories}
      tags={appState.tags}
      selectedView={appState.selectedView}
      selectedProject={appState.selectedProject}
      
      // Actions
      onAddTask={appActions.addTask}
      onToggleTask={appActions.toggleTask}
      onDeleteTask={appActions.deleteTask}
      onToggleImportant={appActions.toggleImportant}
      onUpdateTask={appActions.updateTask}
      onAddCategory={appActions.addCategory}
      onAddTag={appActions.addTag}
      onAddClient={appActions.addClient}
      onAddProject={appActions.addProject}
      
      // Navigation
      onViewChange={handleViewChange}
      onProjectClick={handleProjectClick}
      onBackToClient={handleBackToClient}
    />
  )
}

export default Index
