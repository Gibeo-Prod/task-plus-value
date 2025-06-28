
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"
import { useSupabaseData } from "./useSupabaseData"

export const useAppState = () => {
  const {
    tasks,
    clients,
    projects,
    categories,
    tags,
    projectStatuses,
    loading,
    addTask,
    addClient,
    addProject: addProjectSupabase,
    addCategory,
    addTag,
    addProjectStatus,
    updateProjectStatus,
    deleteProjectStatus,
    reorderProjectStatuses,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask,
    archiveClient,
    deleteClient
  } = useSupabaseData()

  const [selectedView, setSelectedView] = useState("myday")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { toast } = useToast()

  // Adapter function to match the expected signature
  const addProject = (projectData: {
    clientId: string
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
  }) => {
    const { clientId, ...restData } = projectData
    return addProjectSupabase(clientId, restData)
  }

  // Helper function to get client by ID
  const getClientById = (clientId: string): Client | undefined => {
    return clients.find(client => client.id === clientId)
  }

  // Mock functions for compatibility - will be implemented later
  const setTasks = () => {}
  const setClients = () => {}
  const setProjects = () => {}
  const setCategories = () => {}
  const setTags = () => {}

  return {
    tasks,
    setTasks,
    clients,
    setClients,
    projects,
    setProjects,
    categories,
    setCategories,
    tags,
    setTags,
    projectStatuses,
    selectedView,
    setSelectedView,
    selectedProject,
    setSelectedProject,
    loading,
    addTask,
    addClient,
    addProject,
    addCategory,
    addTag,
    addProjectStatus,
    updateProjectStatus,
    deleteProjectStatus,
    reorderProjectStatuses,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask,
    archiveClient,
    deleteClient,
    getClientById,
    toast
  }
}
