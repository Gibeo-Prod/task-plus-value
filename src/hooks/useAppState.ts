
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Task, TaskCategory, TaskTag, Client, Project } from "@/types/tasks"

export const useAppState = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<TaskCategory[]>([
    {
      id: "personal",
      name: "Pessoal",
      color: "#3b82f6",
      icon: "home",
      userId: "demo"
    },
    {
      id: "work",
      name: "Trabalho",
      color: "#10b981",
      icon: "briefcase",
      userId: "demo"
    }
  ])
  const [tags, setTags] = useState<TaskTag[]>([
    {
      id: "urgent",
      name: "Urgente",
      color: "#ef4444",
      userId: "demo"
    },
    {
      id: "meeting",
      name: "Reunião",
      color: "#8b5cf6",
      userId: "demo"
    }
  ])
  const [selectedView, setSelectedView] = useState("myday")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { toast } = useToast()

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
    toast
  }
}
