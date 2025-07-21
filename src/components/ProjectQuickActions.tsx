
import { useState } from 'react';
import { Check, Pause, Play, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Project } from '@/types/projects';
import { toast } from 'sonner';

interface ProjectQuickActionsProps {
  project: Project;
  onUpdate: (projectId: string, data: any) => Promise<void>;
}

export function ProjectQuickActions({ project, onUpdate }: ProjectQuickActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: '', description: '', action: () => {} });

  const handleStatusChange = async (newStatus: string, setCompletionDate = false) => {
    setIsLoading(true);
    try {
      const updateData = {
        name: project.name,
        description: project.description,
        value: Number(project.value),
        status: newStatus,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: setCompletionDate 
          ? new Date().toISOString().split('T')[0]
          : project.dueDate,
      };

      await onUpdate(project.id, updateData);
      toast.success(`Status alterado para "${newStatus}"`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmStatusChange = (status: string, setCompletionDate = false) => {
    const actions = {
      'Concluído': {
        title: 'Finalizar Projeto',
        description: 'Tem certeza que deseja marcar este projeto como concluído? A data de finalização será definida como hoje.',
      },
      'Pausado': {
        title: 'Pausar Projeto',
        description: 'Tem certeza que deseja pausar este projeto?',
      },
      'Em Produção': {
        title: 'Retomar Projeto',
        description: 'Tem certeza que deseja retomar este projeto?',
      },
    };

    const action = actions[status as keyof typeof actions];
    
    setConfirmDialog({
      open: true,
      title: action.title,
      description: action.description,
      action: () => handleStatusChange(status, setCompletionDate),
    });
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (project.status !== 'Concluído') {
      actions.push({
        label: 'Finalizar',
        icon: Check,
        onClick: () => confirmStatusChange('Concluído', true),
        className: 'text-green-600',
      });
    }
    
    if (project.status === 'Em Produção') {
      actions.push({
        label: 'Pausar',
        icon: Pause,
        onClick: () => confirmStatusChange('Pausado'),
        className: 'text-orange-600',
      });
    }
    
    if (project.status === 'Pausado') {
      actions.push({
        label: 'Retomar',
        icon: Play,
        onClick: () => confirmStatusChange('Em Produção'),
        className: 'text-blue-600',
      });
    }
    
    return actions;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border">
          {availableActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={`cursor-pointer ${action.className}`}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.action}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
