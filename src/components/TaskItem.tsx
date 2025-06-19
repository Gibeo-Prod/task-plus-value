
import { useState } from "react"
import { Trash2, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate?: string
  projectId?: string
}

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleImportant: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete, onToggleImportant }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
        "hover:bg-muted/50 hover:shadow-sm",
        task.completed && "opacity-60"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="data-[state=checked]:bg-ms-blue data-[state=checked]:border-ms-blue"
      />
      
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm transition-all duration-200",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.text}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
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
  )
}
