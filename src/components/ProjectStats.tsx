
import { DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Project, Task } from "@/types/tasks"

interface ProjectStatsProps {
  project: Project
  tasks: Task[]
}

export function ProjectStats({ project, tasks }: ProjectStatsProps) {
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

  return (
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
  )
}
