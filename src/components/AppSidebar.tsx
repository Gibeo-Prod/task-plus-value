
import { useState } from "react"
import { 
  Home, 
  Calendar, 
  Star, 
  CheckSquare, 
  Briefcase,
  Plus,
  DollarSign,
  List,
  Users
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  name: string
  value: number
  tasks: number
}

interface Group {
  id: string
  name: string
  color: string
}

interface AppSidebarProps {
  selectedView: string
  onViewChange: (view: string) => void
  projects: Project[]
  onAddProject: (name: string, value: number) => void
}

export function AppSidebar({ selectedView, onViewChange, projects, onAddProject }: AppSidebarProps) {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectValue, setNewProjectValue] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [groups, setGroups] = useState<Group[]>([])
  const { toast } = useToast()

  const defaultViews = [
    {
      id: "myday",
      title: "Meu Dia",
      icon: Home,
      count: 0,
    },
    {
      id: "important",
      title: "Importante",
      icon: Star,
      count: 0,
    },
    {
      id: "planned",
      title: "Planejado",
      icon: Calendar,
      count: 0,
    },
    {
      id: "tasks",
      title: "Tarefas",
      icon: CheckSquare,
      count: 0,
    },
  ]

  const handleAddProject = () => {
    if (newProjectName.trim() && newProjectValue.trim()) {
      const value = parseFloat(newProjectValue)
      if (isNaN(value) || value < 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor válido para o projeto.",
          variant: "destructive",
        })
        return
      }
      
      onAddProject(newProjectName.trim(), value)
      setNewProjectName("")
      setNewProjectValue("")
      setIsAddingProject(false)
      toast({
        title: "Projeto criado",
        description: `Projeto "${newProjectName.trim()}" criado com sucesso!`,
      })
    }
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: newGroupName.trim(),
        color: "#3b82f6"
      }
      
      setGroups(prev => [...prev, newGroup])
      setNewGroupName("")
      setIsAddingGroup(false)
      toast({
        title: "Grupo criado",
        description: `Grupo "${newGroupName.trim()}" criado com sucesso!`,
      })
    }
  }

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ms-blue rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg ms-blue">Agend</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {defaultViews.map((view) => (
                <SidebarMenuItem key={view.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={selectedView === view.id}
                    className="w-full justify-start hover:bg-ms-blue-light transition-colors"
                  >
                    <button
                      onClick={() => onViewChange(view.id)}
                      className="flex items-center gap-3 p-2 text-left"
                    >
                      <view.icon className="w-5 h-5" />
                      <span className="flex-1">{view.title}</span>
                      {view.count > 0 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {view.count}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Grupos</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingGroup(true)}
              className="h-6 w-6 p-0 hover:bg-ms-blue-light"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAddingGroup && (
                <SidebarMenuItem>
                  <div className="space-y-2 p-2">
                    <input
                      type="text"
                      placeholder="Nome do grupo"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddGroup()
                        } else if (e.key === 'Escape') {
                          setIsAddingGroup(false)
                          setNewGroupName("")
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddGroup}
                        className="flex-1 bg-ms-blue hover:bg-ms-blue-dark text-white"
                      >
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingGroup(false)
                          setNewGroupName("")
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </SidebarMenuItem>
              )}
              
              {groups.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={selectedView === group.id}
                    className="w-full justify-start hover:bg-ms-blue-light transition-colors"
                  >
                    <button
                      onClick={() => onViewChange(group.id)}
                      className="flex items-center gap-3 p-2 text-left w-full"
                    >
                      <Users className="w-5 h-5" />
                      <span className="flex-1">{group.name}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Projetos</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingProject(true)}
              className="h-6 w-6 p-0 hover:bg-ms-blue-light"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAddingProject && (
                <SidebarMenuItem>
                  <div className="space-y-2 p-2">
                    <input
                      type="text"
                      placeholder="Nome do projeto"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddProject()
                        } else if (e.key === 'Escape') {
                          setIsAddingProject(false)
                          setNewProjectName("")
                          setNewProjectValue("")
                        }
                      }}
                      autoFocus
                    />
                    <input
                      type="number"
                      placeholder="Valor (R$)"
                      value={newProjectValue}
                      onChange={(e) => setNewProjectValue(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddProject()
                        } else if (e.key === 'Escape') {
                          setIsAddingProject(false)
                          setNewProjectName("")
                          setNewProjectValue("")
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddProject}
                        className="flex-1 bg-ms-blue hover:bg-ms-blue-dark text-white"
                      >
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingProject(false)
                          setNewProjectName("")
                          setNewProjectValue("")
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </SidebarMenuItem>
              )}
              
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={selectedView === project.id}
                    className="w-full justify-start hover:bg-ms-blue-light transition-colors"
                  >
                    <button
                      onClick={() => onViewChange(project.id)}
                      className="flex items-center gap-3 p-2 text-left w-full"
                    >
                      <Briefcase className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{project.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span>R$ {project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      {project.tasks > 0 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {project.tasks}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="ghost"
          onClick={() => setIsAddingProject(true)}
          className="w-full justify-start hover:bg-ms-blue-light"
        >
          <List className="w-4 h-4 mr-3" />
          <span>Adicionar Nova Lista</span>
        </Button>
        <div className="text-xs text-muted-foreground">
          Agend - Organize suas tarefas
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
