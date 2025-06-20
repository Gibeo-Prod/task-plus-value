
import { ChevronRight, Home, Users, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Breadcrumb as BreadcrumbUI,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Client, Project } from "@/types/tasks"

interface BreadcrumbProps {
  selectedView: string
  selectedProject: Project | null
  currentClient: Client | null
  onViewChange: (view: string) => void
  onBackToClient: () => void
}

export function Breadcrumb({
  selectedView,
  selectedProject,
  currentClient,
  onViewChange,
  onBackToClient
}: BreadcrumbProps) {
  const getViewIcon = (view: string) => {
    switch (view) {
      case 'myday':
        return <Home className="w-4 h-4" />
      case 'important':
        return <span className="text-yellow-500">⭐</span>
      case 'planned':
        return <span>📅</span>
      case 'tasks':
        return <span>✓</span>
      default:
        if (view.startsWith('client-')) {
          return <Users className="w-4 h-4" />
        }
        return <Home className="w-4 h-4" />
    }
  }

  const getViewTitle = (view: string) => {
    switch (view) {
      case 'myday':
        return 'Meu Dia'
      case 'important':
        return 'Importante'
      case 'planned':
        return 'Planejado'
      case 'tasks':
        return 'Tarefas'
      default:
        if (view.startsWith('client-') && currentClient) {
          return currentClient.name
        }
        return 'Início'
    }
  }

  return (
    <BreadcrumbUI>
      <BreadcrumbList>
        {/* Always show the main view */}
        <BreadcrumbItem>
          {selectedProject || currentClient ? (
            <BreadcrumbLink asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange(selectedView)}
                className="h-auto p-1 font-normal hover:bg-ms-blue-light"
              >
                <div className="flex items-center gap-2">
                  {getViewIcon(selectedView)}
                  <span>{getViewTitle(selectedView)}</span>
                </div>
              </Button>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>
              <div className="flex items-center gap-2">
                {getViewIcon(selectedView)}
                <span>{getViewTitle(selectedView)}</span>
              </div>
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Show client if we're in client view */}
        {currentClient && !selectedProject && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Projetos</span>
                </div>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {/* Show project if we're in project view */}
        {selectedProject && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {currentClient && (
                <>
                  <BreadcrumbLink asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onBackToClient}
                      className="h-auto p-1 font-normal hover:bg-ms-blue-light"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Projetos</span>
                      </div>
                    </Button>
                  </BreadcrumbLink>
                </>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>{selectedProject.name}</span>
                </div>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </BreadcrumbUI>
  )
}
