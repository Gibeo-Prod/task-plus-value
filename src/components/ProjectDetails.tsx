
import { useState } from "react"
import { ArrowLeft, MessageSquare, Plus, Calendar, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskList } from "@/components/TaskList"
import { ProjectChat } from "@/components/ProjectChat"
import { Project, Task, TaskCategory, TaskTag } from "@/types/tasks"

interface ProjectDetailsProps {
  project: Project
  tasks: Task[]
  categories: TaskCategory[]
  tags: TaskTag[]
  onBack: () => void
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
  onAddCategory: (name: string, color: string, icon: string) => void
  onAddTag: (name: string, color: string) => void
}

export function ProjectDetails({
  project,
  tasks,
  categories,
  tags,
  onBack,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleImportant,
  onUpdateTask,
  onAddCategory,
  onAddTag,
}: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat'>('tasks')

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
      case "planejamento": return "bg-gray-100 text-gray-800"
      case "in_progress":
      case "em-andamento": return "bg-blue-100 text-blue-800"
      case "completed":
      case "concluido": return "bg-green-100 text-green-800"
      case "on_hold":
      case "pausado": return "bg-yellow-100 text-yellow-800"
      case "in_review":
      case "em-revisao": return "bg-purple-100 text-purple-800"
      case "cancelled":
      case "cancelado": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Planejamento"
      case "in_progress": return "Em Andamento"
      case "in_review": return "Em Revisão"
      case "completed": return "Concluído"
      case "on_hold": return "Pausado"
      case "cancelled": return "Cancelado"
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600"
      case "medium": return "text-yellow-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Alta"
      case "medium": return "Média"
      case "low": return "Baixa"
      default: return priority
    }
  }

  if (activeTab === 'chat') {
    return <ProjectChat project={project} onBack={() => setActiveTab('tasks')} />
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'tasks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tasks')}
            className={activeTab === 'tasks' ? 'bg-ms-blue hover:bg-ms-blue-dark' : ''}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tarefas
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat')}
            className={activeTab === 'chat' ? 'bg-ms-blue hover:bg-ms-blue-dark' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat IA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-semibold">
                R$ {project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                Prioridade {getPriorityLabel(project.priority)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-semibold">{tasks.length}</span>
              <span className="text-sm text-muted-foreground">
                {tasks.filter(t => t.completed).length} concluídas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {project.dueDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Data de entrega: {new Date(project.dueDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <TaskList
        tasks={tasks}
        title="Tarefas do Projeto"
        subtitle={`${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''} neste projeto`}
        onAddTask={(taskData) => onAddTask({ ...taskData, projectId: project.id })}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onToggleImportant={onToggleImportant}
        onUpdateTask={onUpdateTask}
        categories={categories}
        tags={tags}
        onAddCategory={onAddCategory}
        onAddTag={onAddTag}
        projectId={project.id}
      />
    </div>
  )
}
