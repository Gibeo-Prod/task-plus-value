
import { DropResult } from '@hello-pangea/dnd'
import { Project } from '@/types/projects'
import { ProjectStatus } from '@/types/projects'
import { mapStatusToDb } from '@/utils/supabaseDataMappers'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useKanbanDragDrop = (
  projects: Project[],
  statuses: ProjectStatus[],
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void
) => {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    const sourceStatus = source.droppableId
    const destStatus = destination.droppableId

    if (sourceStatus === destStatus) return

    // Encontrar o projeto
    const project = projects.find(p => p.id === draggableId)
    if (!project) return

    // Encontrar o novo status
    const newStatus = statuses.find(s => s.name === destStatus)
    if (!newStatus) return

    try {
      // Mapear o status para o formato do banco
      const dbStatus = mapStatusToDb(newStatus.name)
      
      // Atualizar no banco
      const { error } = await supabase
        .from('projects')
        .update({ status: dbStatus })
        .eq('id', project.id)

      if (error) throw error

      // Atualizar localmente se tiver callback
      if (onUpdateProject) {
        onUpdateProject(project.id, { status: newStatus.name })
      }

      toast.success(`Projeto movido para "${newStatus.name}"`)
    } catch (error) {
      console.error('Error updating project status:', error)
      toast.error('Erro ao atualizar status do projeto')
    }
  }

  return { handleDragEnd }
}
