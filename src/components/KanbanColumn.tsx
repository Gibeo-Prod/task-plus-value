
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { MoreVertical, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProjectKanbanCard } from '@/components/ProjectKanbanCard'
import { Project, Client, ProjectStatus } from '@/types/projects'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface KanbanColumnProps {
  status: ProjectStatus
  projects: Project[]
  clients: Client[]
  onProjectClick: (project: Project) => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onEditStatus: () => void
}

export function KanbanColumn({ 
  status, 
  projects, 
  clients, 
  onProjectClick,
  onEditProject,
  onDeleteProject,
  onEditStatus 
}: KanbanColumnProps) {
  // Calculate total value of projects in this column
  const totalValue = projects.reduce((sum, project) => sum + (project.value || 0), 0)
  
  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="flex-shrink-0 w-80">
      <Droppable droppableId={status.name}>
        {(provided, snapshot) => (
          <Card className={`h-full flex flex-col ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}>
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <h3 className="font-semibold">{status.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {projects.length}
                  </Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEditStatus}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Status
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Show total value */}
              <div className="text-sm text-muted-foreground font-medium">
                Total: {formatCurrency(totalValue)}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-6 pb-6">
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {projects.map((project, index) => (
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
                            onEditProject={onEditProject}
                            onDeleteProject={onDeleteProject}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Nenhum projeto</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </Droppable>
    </div>
  )
}
