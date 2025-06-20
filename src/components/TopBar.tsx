
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Breadcrumb } from "@/components/Breadcrumb"
import { Client, Project } from "@/types/tasks"

interface TopBarProps {
  selectedView: string
  selectedProject: Project | null
  currentClient: Client | null
  onViewChange: (view: string) => void
  onBackToClient: () => void
}

export function TopBar({
  selectedView,
  selectedProject,
  currentClient,
  onViewChange,
  onBackToClient,
}: TopBarProps) {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-ms-blue-light" />
          <h2 className="text-sm font-medium text-muted-foreground">
            Agend
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="hover:bg-ms-blue-light"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <Breadcrumb
          selectedView={selectedView}
          selectedProject={selectedProject}
          currentClient={currentClient}
          onViewChange={onViewChange}
          onBackToClient={onBackToClient}
        />
      </div>
    </div>
  )
}
