
import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { useProjectStatuses } from '@/hooks/useProjectStatuses'
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop'
import { KanbanHeader } from '@/components/KanbanHeader'
import { KanbanColumn } from '@/components/KanbanColumn'
import { organizeProjectsByStatus } from '@/utils/kanbanStatusMapper'
import { Project, Client } from '@/types/projects'

interface KanbanBoardProps {
  projects: Project[]
  clients: Client[]
  onProjectClick: (project: Project) => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onAddProject: (clientId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void
  onRefreshProjects?: () => void
}

export function KanbanBoard({ 
  projects, 
  clients, 
  onProjectClick, 
  onEditProject,
  onDeleteProject,
  onAddProject,
  onUpdateProject,
  onRefreshProjects 
}: KanbanBoardProps) {
  const { statuses, loading } = useProjectStatuses()
  const [showStatusManager, setShowStatusManager] = useState(false)
  const [localProjects, setLocalProjects] = useState<Project[]>(projects)

  // Sincronizar projetos locais quando os projetos externos mudarem
  useEffect(() => {
    console.log('🔄 Syncing projects in KanbanBoard:', projects.length)
    setLocalProjects(projects)
  }, [projects])

  // Função para atualizar projetos localmente
  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    console.log('📝 Local project update:', { projectId, updates })
    setLocalProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    ))
    
    // Chamar a função externa se fornecida
    if (onUpdateProject) {
      onUpdateProject(projectId, updates)
    }
  }

  const { handleDragEnd } = useKanbanDragDrop(
    localProjects, 
    statuses, 
    handleUpdateProject,
    onRefreshProjects
  )

  console.log('🏗️ KanbanBoard render - Projects:', localProjects.length)
  console.log('🏗️ KanbanBoard render - Statuses:', statuses.length)
  console.log('📊 Projects by status preview:', localProjects.map(p => ({ name: p.name, status: p.status })))
  console.log('📋 Available statuses:', statuses.map(s => s.name))

  // Organizar projetos por status usando projetos locais
  const projectsByStatus = organizeProjectsByStatus(localProjects, statuses)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0">
        <KanbanHeader 
          projects={localProjects}
          showStatusManager={showStatusManager}
          onStatusManagerToggle={setShowStatusManager}
        />
      </div>

      <div className="flex-1 min-h-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="flex gap-6 h-full min-w-max p-4">
              {statuses.map((status) => {
                const statusProjects = projectsByStatus[status.name] || []
                console.log(`🏷️ Rendering column "${status.name}" with ${statusProjects.length} projects:`, statusProjects.map(p => p.name))
                
                return (
                  <KanbanColumn
                    key={status.id}
                    status={status}
                    projects={statusProjects}
                    clients={clients}
                    onProjectClick={onProjectClick}
                    onEditProject={onEditProject}
                    onDeleteProject={onDeleteProject}
                    onEditStatus={() => setShowStatusManager(true)}
                  />
                )
              })}
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}
