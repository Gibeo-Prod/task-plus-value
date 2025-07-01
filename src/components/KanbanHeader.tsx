
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Project } from '@/types/projects'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectStatusManager } from '@/components/ProjectStatusManager'

interface KanbanHeaderProps {
  projects: Project[]
  showStatusManager: boolean
  onStatusManagerToggle: (show: boolean) => void
}

export function KanbanHeader({ 
  projects, 
  showStatusManager, 
  onStatusManagerToggle 
}: KanbanHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold">Kanban de Projetos</h2>
        <p className="text-muted-foreground">
          {projects.length} projeto{projects.length !== 1 ? 's' : ''} no total
        </p>
      </div>
      
      <Dialog open={showStatusManager} onOpenChange={onStatusManagerToggle}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Status
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <ProjectStatusManager onClose={() => onStatusManagerToggle(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
