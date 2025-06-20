
import { useTasks } from './useTasks'
import { useProjects } from './useProjects'
import { useClients } from './useClients'
import { useCategoriesAndTags } from './useCategoriesAndTags'

export const useSupabaseData = () => {
  // Call hooks in a consistent order
  const tasksData = useTasks()
  const projectsData = useProjects()
  const categoriesAndTagsData = useCategoriesAndTags()
  // Call useClients last as it depends on projects
  const clientsData = useClients(projectsData.projects)

  const loading = tasksData.tasksLoading || 
                 clientsData.clientsLoading || 
                 projectsData.projectsLoading || 
                 categoriesAndTagsData.categoriesLoading || 
                 categoriesAndTagsData.tagsLoading

  return {
    tasks: tasksData.tasks,
    clients: clientsData.clients,
    projects: projectsData.projects,
    categories: categoriesAndTagsData.categories,
    tags: categoriesAndTagsData.tags,
    loading,
    addTask: tasksData.addTask,
    addClient: clientsData.addClient,
    addProject: projectsData.addProject,
    addCategory: categoriesAndTagsData.addCategory,
    addTag: categoriesAndTagsData.addTag,
    toggleTask: tasksData.toggleTask,
    deleteTask: tasksData.deleteTask,
    toggleImportant: tasksData.toggleImportant,
    updateTask: tasksData.updateTask
  }
}
