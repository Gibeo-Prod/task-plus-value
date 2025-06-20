
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
    loading,
    addTask,
    addClient,
    addProject,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask
  } = useSupabaseData()

  const [selectedView, setSelectedView] = useState("myday")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { toast } = useToast()

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
    selectedView,
    setSelectedView,
    selectedProject,
    setSelectedProject,
    loading,
    addTask,
    addClient,
    addProject,
    toggleTask,
    deleteTask,
    toggleImportant,
    updateTask,
    toast
  }
}
