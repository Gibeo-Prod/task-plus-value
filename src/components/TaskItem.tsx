
import { useState } from "react"
import { Trash2, Star, Calendar, Bell, AlertCircle, ArrowUp, Minus, FileText, Tag, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Task } from "@/types/tasks"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleImportant: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete, onToggleImportant }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return { icon: ArrowUp, color: 'text-red-500' }
      case 'medium': return { icon: AlertCircle, color: 'text-yellow-500' }
      case 'low': return { icon: Minus, color: 'text-blue-500' }
      default: return { icon: AlertCircle, color: 'text-yellow-500' }
    }
  }

  const priorityInfo = getPriorityIcon(task.priority)
  const PriorityIcon = priorityInfo.icon

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  const hasReminder = task.reminderDate && new Date(task.reminderDate) > new Date()

  return (
    <div
      className={cn(
        "group border rounded-lg transition-all duration-200",
        "hover:bg-muted/50 hover:shadow-sm",
        task.completed && "opacity-60",
        isOverdue && "border-red-200 bg-red-50/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 p-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="data-[state=checked]:bg-ms-blue data-[state=checked]:border-ms-blue mt-1"
        />
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                "text-sm transition-all duration-200 flex-1",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.text}
            </div>

            <div className={cn(
              "flex items-center gap-1 transition-opacity duration-200",
              !isHovered && "opacity-0 group-hover:opacity-100"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleImportant(task.id)}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-yellow-100",
                  task.important && "text-yellow-500"
                )}
              >
                <Star className={cn("w-4 h-4", task.important && "fill-current")} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Task metadata */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Priority */}
            <div className="flex items-center gap-1">
              <PriorityIcon className={cn("w-3 h-3", priorityInfo.color)} />
              <span className="text-xs text-muted-foreground capitalize">
                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
              </span>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-600" : "text-muted-foreground"
              )}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                {isOverdue && <span className="text-red-600 font-medium">(Atrasado)</span>}
              </div>
            )}

            {/* Reminder */}
            {hasReminder && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bell className="w-3 h-3" />
                <span>{new Date(task.reminderDate!).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs h-5 px-2"
                    style={{ backgroundColor: tag.color + "20", color: tag.color }}
                  >
                    <Tag className="w-2 h-2 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Expandable details */}
          {(task.notes || (task.tags && task.tags.length > 2)) && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3 mr-1" />
                  {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2 pt-2">
                {task.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {task.notes}
                  </div>
                )}
                
                {task.tags && task.tags.length > 2 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {task.tags.slice(2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs h-5 px-2"
                        style={{ backgroundColor: tag.color + "20", color: tag.color }}
                      >
                        <Tag className="w-2 h-2 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  )
}
