import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Trash2, Search, Folder, Calendar, DollarSign, Filter } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useUserRoles } from '@/hooks/useUserRoles'
import { Project } from '@/types/tasks'

interface ProjectWithUser extends Project {
  user_name?: string
  client_name?: string
}

interface User {
  id: string
  full_name?: string
  email: string
}

export const ProjectManagement: React.FC = () => {
  const { isAdmin } = useUserRoles()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectWithUser[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState<ProjectWithUser | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (!isAdmin) {
    return null
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name')

      if (error) throw error
      
      // Simulate email for display (since we can't access auth.users)
      const usersWithEmail = data.map(user => ({
        ...user,
        email: `user-${user.id.slice(0, 8)}@sistema.com`
      }))

      setUsers(usersWithEmail)
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // Build query with user filter
      let query = supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          value,
          status,
          priority,
          start_date,
          due_date,
          notes,
          user_id,
          client_id,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      // Apply user filter if selected
      if (selectedUserId !== 'all') {
        query = query.eq('user_id', selectedUserId)
      }

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      const { data: projectsData, error } = await query

      if (error) throw error

      // Get user names separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')

      // Get client names separately
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')

      const projectsWithUser = projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        value: Number(project.value),
        status: project.status,
        priority: project.priority as 'low' | 'medium' | 'high',
        startDate: project.start_date,
        dueDate: project.due_date,
        notes: project.notes,
        clientId: project.client_id,
        tasks: 0,
        user_name: profilesData?.find(p => p.id === project.user_id)?.full_name || 'Usuário sem nome',
        client_name: clientsData?.find(c => c.id === project.client_id)?.name || 'Cliente não encontrado'
      }))

      setProjects(projectsWithUser)
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error)
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [selectedUserId, searchTerm])

  const handleEditProject = async () => {
    if (!editingProject) return

    setIsEditing(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name,
          description: editingProject.description,
          value: editingProject.value,
          status: editingProject.status,
          priority: editingProject.priority,
          start_date: editingProject.startDate,
          due_date: editingProject.dueDate,
          notes: editingProject.notes
        })
        .eq('id', editingProject.id)

      if (error) throw error

      toast({
        title: "Projeto atualizado",
        description: "Projeto foi atualizado com sucesso",
      })

      setEditingProject(null)
      await fetchProjects()
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      toast({
        title: "Projeto removido",
        description: "Projeto foi removido com sucesso",
      })

      await fetchProjects()
    } catch (error: any) {
      toast({
        title: "Erro ao remover projeto",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Projetos</h2>
          <p className="text-muted-foreground">Gerencie todos os projetos do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userFilter">Filtrar por Usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Usuário sem nome'} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="searchTerm">Buscar por Nome do Projeto</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchTerm"
                  placeholder="Digite o nome do projeto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Projetos ({projects.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando projetos...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum projeto encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-sm text-muted-foreground">
                              {project.description.length > 50 
                                ? `${project.description.substring(0, 50)}...` 
                                : project.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{project.client_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{project.user_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(project.priority)}>
                          {getPriorityText(project.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(Number(project.value))}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {project.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingProject(project)}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Editar Projeto</DialogTitle>
                                <DialogDescription>
                                  Atualize as informações do projeto
                                </DialogDescription>
                              </DialogHeader>
                              {editingProject && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="editName">Nome do Projeto</Label>
                                      <Input
                                        id="editName"
                                        value={editingProject.name}
                                        onChange={(e) => 
                                          setEditingProject(prev => 
                                            prev ? { ...prev, name: e.target.value } : null
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editValue">Valor</Label>
                                      <Input
                                        id="editValue"
                                        type="number"
                                        value={editingProject.value}
                                        onChange={(e) => 
                                          setEditingProject(prev => 
                                            prev ? { ...prev, value: Number(e.target.value) } : null
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="editDescription">Descrição</Label>
                                    <Textarea
                                      id="editDescription"
                                      value={editingProject.description || ''}
                                      onChange={(e) => 
                                        setEditingProject(prev => 
                                          prev ? { ...prev, description: e.target.value } : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="editStatus">Status</Label>
                                      <Input
                                        id="editStatus"
                                        value={editingProject.status}
                                        onChange={(e) => 
                                          setEditingProject(prev => 
                                            prev ? { ...prev, status: e.target.value } : null
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editPriority">Prioridade</Label>
                                      <Select 
                                        value={editingProject.priority} 
                                        onValueChange={(value) => 
                                          setEditingProject(prev => 
                                            prev ? { ...prev, priority: value as 'low' | 'medium' | 'high' } : null
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Baixa</SelectItem>
                                          <SelectItem value="medium">Média</SelectItem>
                                          <SelectItem value="high">Alta</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="editDueDate">Data de Entrega</Label>
                                      <Input
                                        id="editDueDate"
                                        type="date"
                                        value={editingProject.dueDate || ''}
                                        onChange={(e) => 
                                          setEditingProject(prev => 
                                            prev ? { ...prev, dueDate: e.target.value } : null
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="editNotes">Notas</Label>
                                    <Textarea
                                      id="editNotes"
                                      value={editingProject.notes || ''}
                                      onChange={(e) => 
                                        setEditingProject(prev => 
                                          prev ? { ...prev, notes: e.target.value } : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setEditingProject(null)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      onClick={handleEditProject}
                                      disabled={isEditing}
                                    >
                                      {isEditing ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o projeto "{project.name}"? 
                                  Esta ação não pode ser desfeita e todas as tarefas associadas também serão removidas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir Projeto
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}