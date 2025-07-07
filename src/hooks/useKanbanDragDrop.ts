
import { DropResult } from '@hello-pangea/dnd'
import { Project } from '@/types/projects'
import { ProjectStatus } from '@/types/projects'
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
    if (!project) {
      console.error('Project not found:', draggableId)
      toast.error('Projeto não encontrado')
      return
    }

    // Verificar se o status de destino existe
    const targetStatus = statuses.find(s => s.name === destStatus)
    if (!targetStatus) {
      console.error('Target status not found:', destStatus)
      toast.error('Status de destino não encontrado')
      return
    }

    console.log(`\n=== DRAG AND DROP ===`)
    console.log(`Project: ${project.name}`)
    console.log(`From: ${sourceStatus} -> To: ${destStatus}`)
    console.log(`Target status exists:`, targetStatus)

    // Atualizar localmente primeiro para feedback imediato
    if (onUpdateProject) {
      console.log('Updating project locally with status:', destStatus)
      onUpdateProject(project.id, { status: destStatus })
    }

    try {
      console.log(`Updating project ${project.name} in DB with status: ${destStatus}`)
      
      // Usar o nome exato do status de destino
      const { data, error } = await supabase
        .from('projects')
        .update({ status: destStatus })
        .eq('id', project.id)
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      console.log(`✓ Successfully updated project ${project.name} to status ${destStatus}`)
      console.log('Updated project data:', data)

      // Refresh projects from server to ensure persistence
      if (onRefreshProjects) {
        console.log('Refreshing projects from server...')
        setTimeout(() => {
          onRefreshProjects()
        }, 500) // Pequeno delay para garantir que a atualização foi processada
      }

      toast.success(`Projeto "${project.name}" movido para "${destStatus}"`)
    } catch (error) {
      console.error('Error updating project status:', error)
      
      // Reverter a mudança local em caso de erro
      if (onUpdateProject) {
        console.log('Reverting local changes due to error')
        onUpdateProject(project.id, { status: sourceStatus })
      }
      
      // Mostrar erro específico baseado no tipo
      if (error.message?.includes('check constraint') || error.message?.includes('projects_status_check')) {
        toast.error(`Erro: Status "${destStatus}" não é válido para este projeto`)
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        toast.error('Erro: Sem permissão para atualizar este projeto')
      } else {
        toast.error('Erro ao atualizar status do projeto. Tente novamente.')
      }
    }
  }

  return { handleDragEnd }
}
