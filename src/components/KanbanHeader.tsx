import { Settings, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/projects';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ProjectStatusManager } from '@/components/ProjectStatusManager';
interface KanbanHeaderProps {
  projects: Project[];
  showStatusManager: boolean;
  onStatusManagerToggle: (show: boolean) => void;
}
export function KanbanHeader({
  projects,
  showStatusManager,
  onStatusManagerToggle
}: KanbanHeaderProps) {
  return <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Dialog open={showStatusManager} onOpenChange={onStatusManagerToggle}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Cog className="h-4 w-4" />
              Configurações de Status
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ProjectStatusManager onClose={() => onStatusManagerToggle(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      
    </div>;
}