
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
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 mb-6 rounded-lg shadow-sm">
      <div className="flex justify-end items-center">
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
    </div>
  )
}
