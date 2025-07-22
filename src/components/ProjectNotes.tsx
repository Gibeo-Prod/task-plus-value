import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, Save, X, FileText } from "lucide-react"
import { Project } from "@/types/tasks"
import { toast } from "sonner"

interface ProjectNotesProps {
  project: Project
  onUpdateProject: (projectId: string, projectData: {
    name: string
    description?: string
    value: number
    status: string
    priority: 'low' | 'medium' | 'high'
    startDate?: string
    dueDate?: string
    notes?: string
  }) => void
}

export function ProjectNotes({ project, onUpdateProject }: ProjectNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(project.notes || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdateProject(project.id, {
        name: project.name,
        description: project.description,
        value: project.value,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: project.dueDate,
        notes
      })
      setIsEditing(false)
      toast.success("Anotações salvas com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar anotações:", error)
      toast.error("Erro ao salvar anotações")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setNotes(project.notes || "")
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Anotações do Projeto
          </CardTitle>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {project.notes ? "Editar" : "Adicionar"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione suas anotações sobre o projeto..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px]">
            {project.notes ? (
              <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
                {project.notes}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-md">
                Nenhuma anotação adicionada ainda
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}