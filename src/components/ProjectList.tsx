
import { useState } from "react"
import { Plus, LayoutGrid, List, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProjectForm } from "@/components/ProjectForm"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Project, Client } from "@/types/tasks"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
  onUpdateProject: (projectId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => void
  onDeleteProject: (projectId: string) => void
  onProjectClick: (project: Project) => void
}

type ViewMode = 'list' | 'kanban'

export function ProjectList({ client, projects, onAddProject, onUpdateProject, onDeleteProject, onProjectClick }: ProjectListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  const handleProjectSubmit = (projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => {
    if (editingProject) {
      onUpdateProject(editingProject.id, projectData)
      setEditingProject(null)
    } else {
      onAddProject(projectData)
    }
    setShowForm(false)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleDeleteProject = (projectId: string) => {
    onDeleteProject(projectId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planejamento': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Em Andamento': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Em Revisão': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Concluído': return 'bg-green-100 text-green-800 border-green-200'
      case 'Pausado': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header fixo */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ms-blue">Projetos de {client.name}</h1>
            <p className="text-gray-600 mt-1">
              {projects.length} projeto{projects.length !== 1 ? 's' : ''} cadastrado{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </div>

      </div>

      {/* Área de conteúdo com scroll */}
      <div className="flex-1 overflow-hidden px-6">
        {viewMode === 'kanban' ? (
          <div className="h-full">
            <KanbanBoard
              projects={projects}
              clients={[client]}
              onProjectClick={onProjectClick}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onAddProject={(clientId, projectData) => onAddProject(projectData)}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto pb-6">
            <div className="grid gap-4">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                      <p className="text-gray-600 mb-4">Comece criando seu primeiro projeto para este cliente.</p>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Projeto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => onProjectClick(project)}>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <Badge className={getPriorityColor(project.priority)}>
                              {getPriorityText(project.priority)}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o projeto "{project.name}"? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="cursor-pointer" onClick={() => onProjectClick(project)}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Valor</p>
                          <p className="font-semibold text-green-600">
                            R$ {project.value.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Início</p>
                          <p className="font-medium">
                            {project.startDate ? 
                              format(parseISO(project.startDate), 'dd/MMM/yyyy', { locale: ptBR }) 
                              : '-'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Entrega</p>
                          <p className="font-medium">
                            {project.dueDate ? 
                              format(parseISO(project.dueDate), 'dd/MMM/yyyy', { locale: ptBR }) 
                              : '-'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Tarefas</p>
                          <p className="font-medium">{project.tasks || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <ProjectForm
              onSubmit={handleProjectSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingProject(null)
              }}
              project={editingProject}
            />
          </div>
        </div>
      )}
    </div>
  )
}
