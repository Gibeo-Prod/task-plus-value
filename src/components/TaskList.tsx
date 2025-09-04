import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskItem } from "./TaskItem"
import { TaskInput } from "./TaskInput"
import { TaskDetailsSheet } from "./TaskDetailsSheet"
import { useChecklistTemplates, ChecklistTemplateItem } from "@/hooks/useChecklistTemplates"
import { Task, TaskCategory, TaskTag, Project, Client } from "@/types/tasks"
import { cn } from "@/lib/utils"

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
  project?: Project | null
  client?: Client | null
  projects?: Project[]
  clients?: Client[]
  showChecklistTemplate?: boolean
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
  projectId,
  project,
  client,
  projects = [],
  clients = [],
  showChecklistTemplate = false
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [checkedTemplateItems, setCheckedTemplateItems] = useState<Set<string>>(new Set())
  
  const { getDefaultTemplate, fetchTemplateItems } = useChecklistTemplates()
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateItem[]>([])

  useEffect(() => {
    if (showChecklistTemplate) {
      loadTemplateItems()
    }
  }, [showChecklistTemplate])

  const loadTemplateItems = async () => {
    try {
      const defaultTemplate = getDefaultTemplate()
      if (defaultTemplate) {
        const items = await fetchTemplateItems(defaultTemplate.id)
        setTemplateItems(items)
      }
    } catch (error) {
      console.error('Error loading template items:', error)
    }
  }

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

  const handleToggleTemplateItem = (itemId: string) => {
    setCheckedTemplateItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Helper function to get project and client for a task  
  const getTaskContext = (task: Task) => {
    if (project && client) {
      // If we already have project and client context, use them
      return { taskProject: project, taskClient: client }
    }
    
    // Otherwise, find them based on task's projectId
    const taskProject = task.projectId ? projects.find(p => p.id === task.projectId) : null
    const taskClient = taskProject ? clients.find(c => c.id === taskProject.clientId) : null
    
    return { taskProject, taskClient }
  }

  // Sort template items by sort_order first, then group by category
  const sortedTemplateItems = templateItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  
  const groupedTemplateItems = sortedTemplateItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistTemplateItem[]>)
  
  // Get categories in the order they first appear in sorted items
  const categoryOrder = sortedTemplateItems
    .map(item => item.category)
    .filter((category, index, arr) => arr.indexOf(category) === index)

  const categoryColors = {
    'ESTRUTURA': 'bg-blue-100 text-blue-800',
    'PROJETO': 'bg-green-100 text-green-800',
    'ACABAMENTOS': 'bg-orange-100 text-orange-800',
    'REVISÃO': 'bg-purple-100 text-purple-800',
    'PRODUÇÃO': 'bg-red-100 text-red-800'
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
        project={project}
        client={client}
      />

      <div className="space-y-4">
        {/* Checklist Template Items */}
        {showChecklistTemplate && templateItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pt-2 pb-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-sm text-muted-foreground px-3">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Template de Checklist
              </span>
              <div className="h-px bg-border flex-1" />
            </div>

            {categoryOrder.map(category => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs font-medium", categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800")}
                  >
                    {category}
                  </Badge>
                </div>
                
                {groupedTemplateItems[category].map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "group border rounded-lg transition-all duration-200",
                      "hover:bg-muted/50 hover:shadow-sm",
                      checkedTemplateItems.has(item.id) && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3 p-3">
                      <Checkbox
                        checked={checkedTemplateItems.has(item.id)}
                        onCheckedChange={() => handleToggleTemplateItem(item.id)}
                        className="data-[state=checked]:bg-ms-blue data-[state=checked]:border-ms-blue mt-1"
                      />
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={cn(
                              "text-sm transition-all duration-200 flex-1",
                              checkedTemplateItems.has(item.id) && "line-through text-muted-foreground"
                            )}
                          >
                            {item.title}
                          </div>
                        </div>

                        {item.description && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Regular Tasks */}
        {sortedIncompleteTasks.length > 0 && (
          <div className="space-y-2">
            {showChecklistTemplate && templateItems.length > 0 && (
              <div className="flex items-center gap-2 pt-4 pb-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-sm text-muted-foreground px-3">
                  Tarefas do Projeto
                </span>
                <div className="h-px bg-border flex-1" />
              </div>
            )}
            
            {sortedIncompleteTasks.map((task) => {
              const { taskProject, taskClient } = getTaskContext(task)
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onToggleImportant={onToggleImportant}
                  onTaskClick={handleTaskClick}
                  project={taskProject}
                  client={taskClient}
                />
              )
            })}
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
            {completedTasks.map((task) => {
              const { taskProject, taskClient } = getTaskContext(task)
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onToggleImportant={onToggleImportant}
                  onTaskClick={handleTaskClick}
                  project={taskProject}
                  client={taskClient}
                />
              )
            })}
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
