
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
import { ClientActions } from "@/components/ClientActions"

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
  onAddClient: (clientData: {
    name: string
    email: string
    phone?: string
    company?: string
    contactPersonName?: string
    contactPersonEmail?: string
    contactPersonPhone?: string
  }) => void
  onArchiveClient: (clientId: string) => void
  onDeleteClient: (clientId: string) => void
}

export function AppSidebar({ 
  selectedView, 
  onViewChange, 
  clients, 
  onAddClient,
  onArchiveClient,
  onDeleteClient 
}: AppSidebarProps) {
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientCompany, setNewClientCompany] = useState("")
  const [contactPersonName, setContactPersonName] = useState("")
  const [contactPersonEmail, setContactPersonEmail] = useState("")
  const [contactPersonPhone, setContactPersonPhone] = useState("")
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
      onAddClient({
        name: newClientName.trim(),
        email: newClientEmail.trim(),
        phone: newClientPhone.trim() || undefined,
        company: newClientCompany.trim() || undefined,
        contactPersonName: contactPersonName.trim() || undefined,
        contactPersonEmail: contactPersonEmail.trim() || undefined,
        contactPersonPhone: contactPersonPhone.trim() || undefined
      })
      
      // Reset all form fields
      setNewClientName("")
      setNewClientEmail("")
      setNewClientPhone("")
      setNewClientCompany("")
      setContactPersonName("")
      setContactPersonEmail("")
      setContactPersonPhone("")
      setIsAddingClient(false)
      
      toast({
        title: "Cliente criado",
        description: `Cliente "${newClientName.trim()}" criado com sucesso!`,
      })
    }
  }

  const handleCancel = () => {
    setIsAddingClient(false)
    setNewClientName("")
    setNewClientEmail("")
    setNewClientPhone("")
    setNewClientCompany("")
    setContactPersonName("")
    setContactPersonEmail("")
    setContactPersonPhone("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddClient()
    } else if (e.key === 'Escape') {
      handleCancel()
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
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Dados do Cliente
                    </div>
                    <input
                      type="text"
                      placeholder="Nome do cliente*"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <input
                      type="email"
                      placeholder="Email do cliente*"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                    />
                    <input
                      type="tel"
                      placeholder="Telefone do cliente"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                    />
                    <input
                      type="text"
                      placeholder="Empresa"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                    />
                    
                    <div className="text-xs font-medium text-muted-foreground mt-3 mb-2">
                      Pessoa de Contato (Opcional)
                    </div>
                    <input
                      type="text"
                      placeholder="Nome da pessoa de contato"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                    />
                    <input
                      type="email"
                      placeholder="Email da pessoa de contato"
                      value={contactPersonEmail}
                      onChange={(e) => setContactPersonEmail(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                    />
                    <input
                      type="tel"
                      placeholder="Telefone da pessoa de contato"
                      value={contactPersonPhone}
                      onChange={(e) => setContactPersonPhone(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-ms-blue"
                      onKeyDown={handleKeyDown}
                    />
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={handleAddClient}
                        className="flex-1 bg-ms-blue hover:bg-ms-blue-dark text-white"
                        disabled={!newClientName.trim() || !newClientEmail.trim()}
                      >
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
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
                      <ClientActions
                        clientId={client.id}
                        clientName={client.name}
                        onArchive={onArchiveClient}
                        onDelete={onDeleteClient}
                      />
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
