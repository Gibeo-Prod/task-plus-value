
import { useState } from "react"
import { 
  Home, 
  Calendar, 
  Star, 
  CheckSquare, 
  Users,
  Plus,
  DollarSign,
  List
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

interface Client {
  id: string
  name: string
  email?: string
  company?: string
  projects: number
}

interface AppSidebarProps {
  selectedView: string
  onViewChange: (view: string) => void
  clients: Client[]
  onAddClient: (name: string, email: string, company?: string) => void
}

export function AppSidebar({ selectedView, onViewChange, clients, onAddClient }: AppSidebarProps) {
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientCompany, setNewClientCompany] = useState("")
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

  const handleAddClient = () => {
    if (newClientName.trim() && newClientEmail.trim()) {
      onAddClient(newClientName.trim(), newClientEmail.trim(), newClientCompany.trim() || undefined)
      setNewClientName("")
      setNewClientEmail("")
      setNewClientCompany("")
      setIsAddingClient(false)
      toast({
        title: "Cliente criado",
        description: `Cliente "${newClientName.trim()}" criado com sucesso!`,
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
            <span>Clientes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingClient(true)}
              className="h-6 w-6 p-0 hover:bg-ms-blue-light"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAddingClient && (
                <SidebarMenuItem>
                  <div className="space-y-2 p-2">
                    <input
                      type="text"
                      placeholder="Nome do cliente"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddClient()
                        } else if (e.key === 'Escape') {
                          setIsAddingClient(false)
                          setNewClientName("")
                          setNewClientEmail("")
                          setNewClientCompany("")
                        }
                      }}
                      autoFocus
                    />
                    <input
                      type="email"
                      placeholder="Email do cliente"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddClient()
                        } else if (e.key === 'Escape') {
                          setIsAddingClient(false)
                          setNewClientName("")
                          setNewClientEmail("")
                          setNewClientCompany("")
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Empresa (opcional)"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddClient()
                        } else if (e.key === 'Escape') {
                          setIsAddingClient(false)
                          setNewClientName("")
                          setNewClientEmail("")
                          setNewClientCompany("")
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddClient}
                        className="flex-1 bg-ms-blue hover:bg-ms-blue-dark text-white"
                      >
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingClient(false)
                          setNewClientName("")
                          setNewClientEmail("")
                          setNewClientCompany("")
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </SidebarMenuItem>
              )}
              
              {clients.map((client) => (
                <SidebarMenuItem key={client.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={selectedView === `client-${client.id}`}
                    className="w-full justify-start hover:bg-ms-blue-light transition-colors"
                  >
                    <button
                      onClick={() => onViewChange(`client-${client.id}`)}
                      className="flex items-center gap-3 p-2 text-left w-full"
                    >
                      <Users className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{client.name}</div>
                        {client.company && (
                          <div className="text-xs text-muted-foreground truncate">
                            {client.company}
                          </div>
                        )}
                      </div>
                      {client.projects > 0 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {client.projects}
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
          onClick={() => setIsAddingClient(true)}
          className="w-full justify-start hover:bg-ms-blue-light"
        >
          <List className="w-4 h-4 mr-3" />
          <span>Adicionar Novo Cliente</span>
        </Button>
        <div className="text-xs text-muted-foreground">
          Agend - Organize suas tarefas
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
