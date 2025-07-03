
import { useState } from "react"
import { TaskList } from "@/components/TaskList"
import { CollaborativeChat } from "@/components/CollaborativeChat"
import { WhatsAppInviteModal } from "@/components/WhatsAppInviteModal"
import { ProjectHeader } from "@/components/ProjectHeader"
import { ProjectStats } from "@/components/ProjectStats"
import { ProjectDueDate } from "@/components/ProjectDueDate"
import { Project, Task, TaskCategory, TaskTag, Client } from "@/types/tasks"

interface ProjectDetailsProps {
  project: Project
  client: Client
  tasks: Task[]
  categories: TaskCategory[]
  tags: TaskTag[]
  onBack: () => void
  onAddTask: (data: {
    text: string
    dueDate?: string
    categoryId?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
    reminderDate?: string
    tags?: TaskTag[]
    projectId?: string
  }) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onToggleImportant: (id: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onAddCategory: (name: string, color: string, icon: string) => void
  onAddTag: (name: string, color: string) => void
}

type TabType = 'tasks' | 'chat'

export function ProjectDetails({
  project,
  client,
  tasks,
  categories,
  tags,
  onBack,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleImportant,
  onUpdateTask,
  onAddCategory,
  onAddTag,
}: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  if (activeTab === 'chat') {
    return <CollaborativeChat project={project} onBack={() => setActiveTab('tasks')} />
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        onBack={onBack}
        onTabChange={setActiveTab}
        onShowWhatsAppModal={() => setShowWhatsAppModal(true)}
      />

      <ProjectStats project={project} tasks={tasks} />

      <ProjectDueDate dueDate={project.dueDate} />

      <TaskList
        tasks={tasks}
        title="Tarefas do Projeto"
        subtitle={`${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''} neste projeto`}
        onAddTask={(taskData) => onAddTask({ ...taskData, projectId: project.id })}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onToggleImportant={onToggleImportant}
        onUpdateTask={onUpdateTask}
        categories={categories}
        tags={tags}
        onAddCategory={onAddCategory}
        onAddTag={onAddTag}
        projectId={project.id}
        project={project}
        client={client}
      />

      <WhatsAppInviteModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        project={project}
        client={client}
      />
    </div>
  )
}
