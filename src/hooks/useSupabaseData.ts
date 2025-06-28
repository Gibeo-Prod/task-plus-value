
import { useTasks } from './useTasks'
import { useProjects } from './useProjects'
import { useClients } from './useClients'
import { useCategoriesAndTags } from './useCategoriesAndTags'
import { useProjectStatuses } from './useProjectStatuses'

export const useSupabaseData = () => {
  // Call hooks in a consistent order
  const tasksData = useTasks()
  const projectsData = useProjects()
  const categoriesAndTagsData = useCategoriesAndTags()
  const projectStatusesData = useProjectStatuses()
  // Call useClients last as it depends on projects
  const clientsData = useClients(projectsData.projects)

  const loading = tasksData.tasksLoading || 
                 clientsData.clientsLoading || 
                 projectsData.loading || 
                 categoriesAndTagsData.categoriesLoading || 
                 categoriesAndTagsData.tagsLoading ||
                 projectStatusesData.loading

  return {
    tasks: tasksData.tasks,
    clients: clientsData.clients,
    projects: projectsData.projects,
    categories: categoriesAndTagsData.categories,
    tags: categoriesAndTagsData.tags,
    projectStatuses: projectStatusesData.statuses,
    loading,
    addTask: tasksData.addTask,
    addClient: clientsData.addClient,
    addProject: projectsData.addProject,
    addCategory: categoriesAndTagsData.addCategory,
    addTag: categoriesAndTagsData.addTag,
    addProjectStatus: projectStatusesData.addStatus,
    updateProjectStatus: projectStatusesData.updateStatus,
    deleteProjectStatus: projectStatusesData.deleteStatus,
    reorderProjectStatuses: projectStatusesData.reorderStatuses,
    toggleTask: tasksData.toggleTask,
    deleteTask: tasksData.deleteTask,
    toggleImportant: tasksData.toggleImportant,
    updateTask: tasksData.updateTask,
    archiveClient: clientsData.archiveClient,
    deleteClient: clientsData.deleteClient
  }
}
