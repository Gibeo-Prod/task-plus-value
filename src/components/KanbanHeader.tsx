import { Settings } from 'lucide-react';
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
  return;
}