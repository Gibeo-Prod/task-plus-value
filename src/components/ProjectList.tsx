
import { useState } from "react"
import { Plus, Briefcase, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Project, Client } from "@/types/tasks"

interface ProjectListProps {
  client: Client
  projects: Project[]
  onAddProject: (projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  onProjectClick: (project: Project) => void
}

export function ProjectList({ client, projects, onAddProject, onProjectClick }: ProjectListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectValue, setProjectValue] = useState("")
  const [projectStatus, setProjectStatus] = useState("planejamento")
  const [projectPriority, setProjectPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim() && projectValue.trim()) {
      const value = parseFloat(projectValue)
      if (!isNaN(value) && value >= 0) {
        onAddProject({
          name: projectName.trim(),
          description: projectDescription.trim() || undefined,
          value,
          status: projectStatus,
          priority: projectPriority,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
        })
        
        // Reset form
        setProjectName("")
        setProjectDescription("")
        setProjectValue("")
        setProjectStatus("planejamento")
        setProjectPriority('medium')
        setStartDate("")
        setDueDate("")
        setIsAdding(false)
      }
    }
  }

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
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
        <p className="text-sm text-muted-foreground">
          {client.company && `${client.company} • `}
          {client.email}
        </p>
        <div className="text-sm text-muted-foreground">
          {projects.length === 0 
            ? "Nenhum projeto" 
            : `${projects.length} projeto${projects.length !== 1 ? 's' : ''}`
          }
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg bg-background">
        {!isAdding ? (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full justify-start bg-ms-blue hover:bg-ms-blue-dark text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar projeto
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nome do projeto"
                className="flex-1 focus:ring-ms-blue focus:border-ms-blue"
                required
              />
              <Button
                type="submit"
                disabled={!projectName.trim() || !projectValue.trim()}
                className="bg-ms-blue hover:bg-ms-blue-dark text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={projectValue}
                  onChange={(e) => setProjectValue(e.target.value)}
                  placeholder="0,00"
                  className="focus:ring-ms-blue focus:border-ms-blue"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={projectStatus} onValueChange={setProjectStatus}>
                  <SelectTrigger className="focus:ring-ms-blue focus:border-ms-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="em-revisao">Em Revisão</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select value={projectPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setProjectPriority(value)}>
                  <SelectTrigger className="focus:ring-ms-blue focus:border-ms-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Início</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="focus:ring-ms-blue focus:border-ms-blue"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Data de Entrega</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="focus:ring-ms-blue focus:border-ms-blue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descrição do projeto..."
                className="focus:ring-ms-blue focus:border-ms-blue"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg bg-background hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onProjectClick(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Briefcase className="w-5 h-5 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>R$ {project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {project.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(project.dueDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {getPriorityLabel(project.priority)}
                  </span>
                  {project.tasks > 0 && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {project.tasks} tarefa{project.tasks !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">Nenhum projeto ainda</h3>
            <p className="text-sm text-muted-foreground">
              Comece criando um projeto para este cliente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
