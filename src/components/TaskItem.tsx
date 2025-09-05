
import { useState } from "react"
import { Trash2, Star, Calendar, Bell, AlertCircle, ArrowUp, Minus, FileText, Tag, Folder, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Task, Project, Client, TaskCategory } from "@/types/tasks"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleImportant: (id: string) => void
  onTaskClick: (task: Task) => void
  project?: Project | null
  client?: Client | null
  categories?: TaskCategory[]
}

export function TaskItem({ task, onToggle, onDelete, onToggleImportant, onTaskClick, project, client, categories = [] }: TaskItemProps) {
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
  const hasReminder = false // Reminder functionality not available in new structure

  const handleTaskClick = (e: React.MouseEvent) => {
    // Não abrir o painel se clicou em um botão ou checkbox
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="checkbox"]')) {
      return
    }
    onTaskClick(task)
  }

  // Find category for the task
  const taskCategory = task.categoryId ? categories.find(cat => cat.id === task.categoryId) : null

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2 px-4 transition-all duration-200 cursor-pointer hover:bg-muted/30 rounded-lg",
        task.completed && "opacity-60"
      )}
      onClick={handleTaskClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />
      
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-medium transition-all duration-200",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </div>
      </div>

      {/* Action buttons - only show on hover */}
      <div className={cn(
        "flex items-center gap-1 transition-opacity duration-200",
        !isHovered && "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onToggleImportant(task.id)
          }}
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
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
