
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, MoreVertical, Settings, Grip } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProjectStatusManager } from '@/components/ProjectStatusManager'
import { ProjectKanbanCard } from '@/components/ProjectKanbanCard'
import { Project, Client } from '@/types/projects'
import { useProjectStatuses } from '@/hooks/useProjectStatuses'
import { mapStatusToDb } from '@/utils/supabaseDataMappers'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface KanbanBoardProps {
  projects: Project[]
  clients: Client[]
  onProjectClick: (project: Project) => void
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
}

export function KanbanBoard({ 
  projects, 
  clients, 
  onProjectClick, 
  onAddProject,
  onUpdateProject 
}: KanbanBoardProps) {
  const { statuses, loading } = useProjectStatuses()
  const [showStatusManager, setShowStatusManager] = useState(false)
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)

  // Organizar projetos por status
  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.name] = projects.filter(project => {
      // Mapear os status do banco para os nomes legíveis
      const mappedStatus = mapStatusFromDb(project.status)
      return mappedStatus === status.name
    })
    return acc
  }, {} as Record<string, Project[]>)

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    const sourceStatus = source.droppableId
    const destStatus = destination.droppableId

    if (sourceStatus === destStatus) return

    // Encontrar o projeto
    const project = projects.find(p => p.id === draggableId)
    if (!project) return

    // Encontrar o novo status
    const newStatus = statuses.find(s => s.name === destStatus)
    if (!newStatus) return

    try {
      // Mapear o status para o formato do banco
      const dbStatus = mapStatusToDb(newStatus.name)
      
      // Atualizar no banco
      const { error } = await supabase
        .from('projects')
        .update({ status: dbStatus })
        .eq('id', project.id)

      if (error) throw error

      // Atualizar localmente se tiver callback
      if (onUpdateProject) {
        onUpdateProject(project.id, { status: newStatus.name })
      }

      toast.success(`Projeto movido para "${newStatus.name}"`)
    } catch (error) {
      console.error('Error updating project status:', error)
      toast.error('Erro ao atualizar status do projeto')
    }
  }

  // Função para mapear status do DB para nomes legíveis
  const mapStatusFromDb = (dbStatus: string): string => {
    const statusMap = {
      'new': 'Planejamento',
      'in_progress': 'Em Andamento',
      'in_review': 'Em Revisão',
      'completed': 'Concluído',
      'on_hold': 'Pausado',
      'cancelled': 'Cancelado'
    }
    return statusMap[dbStatus as keyof typeof statusMap] || dbStatus
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue"></div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kanban de Projetos</h2>
          <p className="text-muted-foreground">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        
        <Dialog open={showStatusManager} onOpenChange={setShowStatusManager}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Status
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <ProjectStatusManager onClose={() => setShowStatusManager(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {statuses.map((status) => {
            const statusProjects = projectsByStatus[status.name] || []
            
            return (
              <div key={status.id} className="flex-shrink-0 w-80">
                <Droppable droppableId={status.name}>
                  {(provided, snapshot) => (
                    <Card className={`h-fit min-h-[500px] ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: status.color }}
                            />
                            <h3 className="font-semibold">{status.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {statusProjects.length}
                            </Badge>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setShowStatusManager(true)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Editar Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {statusProjects.map((project, index) => (
                          <Draggable
                            key={project.id}
                            draggableId={project.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={snapshot.isDragging ? 'rotate-3 scale-105' : ''}
                              >
                                <ProjectKanbanCard
                                  project={project}
                                  client={clients.find(c => c.id === project.clientId)}
                                  onClick={() => onProjectClick(project)}
                                  dragHandleProps={provided.dragHandleProps}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {statusProjects.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">Nenhum projeto</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
