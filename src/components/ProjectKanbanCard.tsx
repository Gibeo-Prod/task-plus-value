
import { Calendar, DollarSign, AlertCircle, Grip, User, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Project, Client } from '@/types/projects'
import { format, isAfter, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProjectKanbanCardProps {
  project: Project
  client?: Client
  onClick: () => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  dragHandleProps?: DraggableProvidedDragHandleProps
}

export function ProjectKanbanCard({ 
  project, 
  client, 
  onClick, 
  onEditProject,
  onDeleteProject,
  dragHandleProps 
}: ProjectKanbanCardProps) {
  const isOverdue = project.dueDate && isAfter(new Date(), parseISO(project.dueDate))
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return priority
    }
  }

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate mb-1">
              {project.name}
            </h4>
            {client && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <User className="h-3 w-3" />
                <span className="truncate">{client.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditProject(project); }}>
                    <Edit className="h-3 w-3 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o projeto "{project.name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteProject(project.id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div {...dragHandleProps} className="ml-1 cursor-grab active:cursor-grabbing">
              <Grip className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">
                R$ {project.value.toLocaleString('pt-BR')}
              </span>
            </div>
            
            <Badge 
              variant="secondary" 
              className={`text-xs ${getPriorityColor(project.priority)} text-white`}
            >
              {getPriorityText(project.priority)}
            </Badge>
          </div>

          {project.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                {format(parseISO(project.dueDate), 'dd MMM yyyy', { locale: ptBR })}
              </span>
              {isOverdue && <AlertCircle className="h-3 w-3" />}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{project.tasks || 0} tarefa{(project.tasks || 0) !== 1 ? 's' : ''}</span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Atrasado
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
