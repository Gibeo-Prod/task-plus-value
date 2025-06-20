
import { ArrowLeft, MessageSquare, Plus, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Project } from "@/types/tasks"

interface ProjectHeaderProps {
  project: Project
  activeTab: 'tasks' | 'chat'
  onBack: () => void
  onTabChange: (tab: 'tasks' | 'chat') => void
  onShowWhatsAppModal: () => void
}

export function ProjectHeader({
  project,
  activeTab,
  onBack,
  onTabChange,
  onShowWhatsAppModal,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onShowWhatsAppModal}
          className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
        >
          <Phone className="w-4 h-4" />
          Convidar WhatsApp
        </Button>
        <Button
          variant={activeTab === 'tasks' ? 'default' : 'outline'}
          onClick={() => onTabChange('tasks')}
          className={activeTab === 'tasks' ? 'bg-ms-blue hover:bg-ms-blue-dark' : ''}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tarefas
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'outline'}
          onClick={() => onTabChange('chat')}
          className={activeTab === 'chat' ? 'bg-ms-blue hover:bg-ms-blue-dark' : ''}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat Colaborativo
        </Button>
      </div>
    </div>
  )
}
