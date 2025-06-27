import { Home, CheckSquare, Calendar, Star, Users, Settings, Template, CheckCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { ClientForm } from "@/components/ClientForm"
import { useState } from "react"
import { Client } from "@/types/tasks"

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

const menuItems = [
  {
    title: "Meu Dia",
    url: "myday",
    icon: Home,
  },
  {
    title: "Importante",
    url: "important",
    icon: Star,
  },
  {
    title: "Planejado",
    url: "planned",
    icon: Calendar,
  },
  {
    title: "Tarefas",
    url: "tasks",
    icon: CheckSquare,
  },
  {
    title: "Templates",
    url: "templates",
    icon: Template,
  },
]

export function AppSidebar({ 
  selectedView, 
  onViewChange, 
  clients, 
  onAddClient, 
  onArchiveClient, 
  onDeleteClient 
}: AppSidebarProps) {
  const [showClientForm, setShowClientForm] = useState(false)

  const handleClientSubmit = (clientData: {
    name: string
    email: string
    phone?: string
    company?: string
    contactPersonName?: string
    contactPersonEmail?: string
    contactPersonPhone?: string
  }) => {
    onAddClient(clientData)
    setShowClientForm(false)
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <CheckCircle className="h-8 w-8 text-ms-blue" />
          <span className="text-xl font-bold text-ms-blue">TaskFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.url)}
                    isActive={selectedView === item.url}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Clientes
            <button onClick={() => setShowClientForm(true)} className="text-xs text-muted-foreground hover:text-foreground">
              (Novo)
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {clients.map((client) => (
              <SidebarMenuItem key={client.id}>
                <SidebarMenuButton
                  onClick={() => onViewChange(`client-${client.id}`)}
                  isActive={selectedView === `client-${client.id}`}
                >
                  <Users />
                  <span>{client.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onViewChange("settings")}>
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <ClientForm 
        open={showClientForm}
        onClose={() => setShowClientForm(false)}
        onSubmit={handleClientSubmit}
      />
    </Sidebar>
  )
}
