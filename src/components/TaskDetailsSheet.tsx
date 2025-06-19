
import { useState } from "react"
import { X, Plus, Sun, Clock, Calendar, Repeat, User, Paperclip, FileText, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Task } from "@/types/tasks"

interface TaskDetailsSheetProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskDetailsSheet({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onDeleteTask 
}: TaskDetailsSheetProps) {
  const [notes, setNotes] = useState(task?.notes || "")

  if (!task) return null

  const handleNotesChange = (value: string) => {
    setNotes(value)
    onUpdateTask(task.id, { notes: value })
  }

  const handleDeleteTask = () => {
    onDeleteTask(task.id)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-medium">
              {task.text}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Adicionar etapa */}
          <Button variant="ghost" className="w-full justify-start h-12 px-3">
            <Plus className="w-4 h-4 mr-3 text-blue-600" />
            <span className="text-blue-600">Adicionar etapa</span>
          </Button>

          <Separator />

          {/* Opções de ação */}
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <Sun className="w-4 h-4 mr-3" />
              <span>Adicionar a Meu Dia</span>
            </Button>

            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <Clock className="w-4 h-4 mr-3" />
              <span>Lembrar-me</span>
            </Button>

            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <Calendar className="w-4 h-4 mr-3" />
              <span>Adicionar data de conclusão</span>
              {task.dueDate && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              )}
            </Button>

            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <Repeat className="w-4 h-4 mr-3" />
              <span>Repetir</span>
            </Button>

            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <User className="w-4 h-4 mr-3" />
              <span>Atribuir a</span>
            </Button>

            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <Paperclip className="w-4 h-4 mr-3" />
              <span>Adicionar arquivo</span>
            </Button>
          </div>

          <Separator />

          {/* Adicionar anotação */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Adicionar anotação</span>
            </div>
            <Textarea
              placeholder="Adicione uma anotação..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Separator />

          {/* Informações da tarefa */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              Criada {new Date().toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>

          {/* Botão de excluir */}
          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={handleDeleteTask}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              <span>Excluir tarefa</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
