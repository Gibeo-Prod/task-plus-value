
import { TaskItem } from "./TaskItem"
import { TaskInput } from "./TaskInput"

interface Task {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate?: string
  projectId?: string
}

interface TaskListProps {
  tasks: Task[]
  title: string
  subtitle?: string
  onAddTask: (text: string, dueDate?: string) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onToggleImportant: (id: string) => void
}

export function TaskList({
  tasks,
  title,
  subtitle,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleImportant,
}: TaskListProps) {
  const incompleteTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
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

      <TaskInput onAddTask={onAddTask} />

      <div className="space-y-4">
        {incompleteTasks.length > 0 && (
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onToggleImportant={onToggleImportant}
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
    </div>
  )
}
