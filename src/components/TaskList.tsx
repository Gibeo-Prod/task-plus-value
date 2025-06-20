
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskItem } from "./TaskItem"
import { TaskInput } from "./TaskInput"
import { TaskDetailsSheet } from "./TaskDetailsSheet"
import { Task, TaskCategory, TaskTag } from "@/types/tasks"

interface TaskListProps {
  tasks: Task[]
  title: string
  subtitle?: string
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
  categories: TaskCategory[]
  tags: TaskTag[]
  onAddCategory: (name: string, color: string, icon: string) => void
  onAddTag: (name: string, color: string) => void
  showBackButton?: boolean
  onBack?: () => void
  projectId?: string | null
}

export function TaskList({
  tasks,
  title,
  subtitle,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleImportant,
  onUpdateTask,
  categories,
  tags,
  onAddCategory,
  onAddTag,
  showBackButton = false,
  onBack,
  projectId
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const incompleteTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  // Sort tasks by priority and due date
  const sortedIncompleteTasks = incompleteTasks.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority || 'medium']
    const bPriority = priorityOrder[b.priority || 'medium']
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    
    return 0
  })

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setSelectedTask(null)
  }

  const handleAddTask = (taskData: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
    projectId?: string
  }) => {
    // If we have a projectId prop, use it
    if (projectId) {
      taskData.projectId = projectId
    }
    onAddTask(taskData)
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-ms-blue-light"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="text-sm text-muted-foreground">
          {tasks.length === 0 
            ? "Nenhuma tarefa" 
            : `${incompleteTasks.length} pendente${incompleteTasks.length !== 1 ? 's' : ''}, ${completedTasks.length} concluída${completedTasks.length !== 1 ? 's' : ''}`
          }
        </div>
      </div>

      <TaskInput 
        onAddTask={handleAddTask}
        categories={categories}
        tags={tags}
        onAddCategory={onAddCategory}
        onAddTag={onAddTag}
        projectId={projectId}
      />

      <div className="space-y-4">
        {sortedIncompleteTasks.length > 0 && (
          <div className="space-y-2">
            {sortedIncompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onToggleImportant={onToggleImportant}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pt-4">
              <div className="h-px bg-border flex-1" />
              <span className="text-sm text-muted-foreground px-3">
                Concluídas ({completedTasks.length})
              </span>
              <div className="h-px bg-border flex-1" />
            </div>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onToggleImportant={onToggleImportant}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">Comece adicionando uma tarefa</h3>
            <p className="text-sm text-muted-foreground">
              Organize seu dia e aumente sua produtividade
            </p>
          </div>
        )}
      </div>

      <TaskDetailsSheet
        task={selectedTask}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  )
}
