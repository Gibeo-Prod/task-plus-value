
import { CalendarDays, CheckSquare, Star, FileText, Plus, Building2, Users, Settings, Package } from "lucide-react"
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
import { ClientFormDialog } from "./ClientFormDialog"
import { ClientItem } from "./ClientItem"
import { Client } from "@/types/tasks"

// Navigation items
const items = [
  {
    title: "Meu Dia",
    value: "myday",
    icon: CalendarDays,
  },
  {
    title: "Importante",
    value: "important",
    icon: Star,
  },
  {
    title: "Planejado",
    value: "planned",
    icon: CheckSquare,
  },
  {
    title: "Tarefas",
    value: "tasks",
    icon: FileText,
  },
  {
    title: "Templates",
    value: "templates",
    icon: Settings,
  },
  {
    title: "Em Produção",
    value: "production",
    icon: Package,
  },
]

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
  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ms-blue rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">TaskFlow</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.value)}
                    isActive={selectedView === item.value}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Clientes</span>
            <ClientFormDialog onAddClient={onAddClient}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </ClientFormDialog>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1">
              {clients.map((client) => (
                <ClientItem
                  key={client.id}
                  client={client}
                  isSelected={selectedView === `client-${client.id}`}
                  onClick={() => onViewChange(`client-${client.id}`)}
                  onArchive={onArchiveClient}
                  onDelete={onDeleteClient}
                />
              ))}
              {clients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum cliente</p>
                  <p className="text-xs">Adicione um cliente para começar</p>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          TaskFlow v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
