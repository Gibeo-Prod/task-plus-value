
import { useTasks } from './useTasks'
import { useProjects } from './useProjects'
import { useClients } from './useClients'
import { useCategoriesAndTags } from './useCategoriesAndTags'

export const useSupabaseData = () => {
  const { 
    tasks, 
    tasksLoading, 
    addTask,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask
  } = useTasks()
  const { projects, projectsLoading, addProject } = useProjects()
  const { clients, clientsLoading, addClient } = useClients(projects)
  const { 
    categories, 
    categoriesLoading, 
    tags, 
    tagsLoading,
    addCategory,
    addTag 
  } = useCategoriesAndTags()

  const loading = tasksLoading || clientsLoading || projectsLoading || categoriesLoading || tagsLoading

  return {
    tasks,
    clients,
    projects,
    categories,
    tags,
    loading,
    addTask,
    addClient,
    addProject,
    addCategory,
    addTag,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask
  }
}
