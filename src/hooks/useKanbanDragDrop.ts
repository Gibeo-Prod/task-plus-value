
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
      return
    }

    // Encontrar o novo status na lista de status disponíveis
    const newStatusObj = statuses.find(s => s.name === destStatus)
    if (!newStatusObj) {
      console.error('Status not found:', destStatus)
      return
    }

    console.log(`\n=== DRAG AND DROP ===`)
    console.log(`Project: ${project.name}`)
    console.log(`From: ${sourceStatus} -> To: ${destStatus}`)
    console.log(`New status object:`, newStatusObj)

    // Atualizar localmente primeiro para feedback imediato
    if (onUpdateProject) {
      console.log('Updating project locally with status:', destStatus)
      onUpdateProject(project.id, { status: destStatus })
    }

    try {
      // Lista de status padrão do sistema (que precisam ser mapeados)
      const defaultStatuses = [
        'Planejamento',
        'Em Andamento', 
        'Em Revisão',
        'Concluído',
        'Pausado',
        'Cancelado'
      ]
      
      let dbStatusValue: string
      
      // Verificar se é um status padrão do sistema
      if (defaultStatuses.includes(destStatus)) {
        // Status padrão - mapear para código do banco
        const defaultStatusMapping: Record<string, string> = {
          'Planejamento': 'new',
          'Em Andamento': 'in_progress', 
          'Em Revisão': 'in_review',
          'Concluído': 'completed',
          'Pausado': 'on_hold',
          'Cancelado': 'cancelled'
        }
        
        dbStatusValue = defaultStatusMapping[destStatus]
        console.log(`Status padrão detectado: ${destStatus} -> ${dbStatusValue}`)
      } else {
        // Status personalizado - usar o nome exato
        dbStatusValue = destStatus
        console.log(`Status personalizado detectado: usando diretamente "${dbStatusValue}"`)
      }
      
      console.log(`Updating project ${project.name} in DB with status: ${dbStatusValue}`)
      
      // Atualizar no banco
      const { error } = await supabase
        .from('projects')
        .update({ status: dbStatusValue })
        .eq('id', project.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log(`✓ Successfully updated project ${project.name} to status ${dbStatusValue}`)

      // Refresh projects from server to ensure persistence
      if (onRefreshProjects) {
        console.log('Refreshing projects from server...')
        await onRefreshProjects()
      }

      toast.success(`Projeto movido para "${destStatus}"`)
    } catch (error) {
      console.error('Error updating project status:', error)
      // Reverter a mudança local em caso de erro
      if (onUpdateProject) {
        console.log('Reverting local changes due to error')
        onUpdateProject(project.id, { status: sourceStatus })
      }
      toast.error('Erro ao atualizar status do projeto')
    }
  }

  return { handleDragEnd }
}
