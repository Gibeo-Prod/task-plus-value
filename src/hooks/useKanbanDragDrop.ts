
import { DropResult } from '@hello-pangea/dnd'
import { Project } from '@/types/projects'
import { ProjectStatus } from '@/types/projects'
import { mapStatusToDb } from '@/utils/supabaseDataMappers'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useKanbanDragDrop = (
  projects: Project[],
  statuses: ProjectStatus[],
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void,
  onRefreshProjects?: () => void
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

    // Atualizar localmente primeiro para feedback imediato
    if (onUpdateProject) {
      onUpdateProject(project.id, { status: newStatus.name })
    }

    try {
      // Mapear o status para o formato do banco
      const dbStatus = mapStatusToDb(newStatus.name)
      
      console.log(`Updating project ${project.name} from ${sourceStatus} to ${destStatus} (DB: ${dbStatus})`)
      
      // Atualizar no banco
      const { error } = await supabase
        .from('projects')
        .update({ status: dbStatus })
        .eq('id', project.id)

      if (error) throw error

      // Refresh projects from server to ensure persistence
      if (onRefreshProjects) {
        onRefreshProjects()
      }

      toast.success(`Projeto movido para "${newStatus.name}"`)
    } catch (error) {
      console.error('Error updating project status:', error)
      // Reverter a mudança local em caso de erro
      if (onUpdateProject) {
        onUpdateProject(project.id, { status: sourceStatus })
      }
      toast.error('Erro ao atualizar status do projeto')
    }
  }

  return { handleDragEnd }
}
