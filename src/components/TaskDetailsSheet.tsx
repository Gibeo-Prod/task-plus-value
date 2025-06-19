import { useState } from "react"
import { X, Plus, Sun, Clock, Calendar, User, Paperclip, FileText, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Task } from "@/types/tasks"

interface TaskDetailsSheetProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
}

interface Subtask {
  text: string
  completed: boolean
}

interface AttachedFile {
  id: string
  name: string
  size: number
}

export function TaskDetailsSheet({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onDeleteTask 
}: TaskDetailsSheetProps) {
  const [notes, setNotes] = useState(task?.notes || "")
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showReminderPicker, setShowReminderPicker] = useState(false)
  const [showAssignPicker, setShowAssignPicker] = useState(false)
  const [assignTo, setAssignTo] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const { toast } = useToast()

  if (!task) return null

  // Extrair etapas das notas
  const extractSubtasks = (notesText: string): { subtasks: Subtask[], otherNotes: string } => {
    if (!notesText) return { subtasks: [], otherNotes: "" }
    
    const lines = notesText.split('\n')
    const subtasks: Subtask[] = []
    const otherNotes: string[] = []
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('•')) {
        const text = trimmedLine.substring(1).trim()
        subtasks.push({ text, completed: false })
      } else if (trimmedLine.startsWith('✓')) {
        const text = trimmedLine.substring(1).trim()
        subtasks.push({ text, completed: true })
      } else if (trimmedLine) {
        otherNotes.push(line)
      }
    })
    
    return { subtasks, otherNotes: otherNotes.join('\n') }
  }

  const { subtasks, otherNotes } = extractSubtasks(notes)

  const handleNotesChange = (value: string) => {
    setNotes(value)
    onUpdateTask(task.id, { notes: value })
  }

  const handleSubtaskToggle = (index: number) => {
    const updatedSubtasks = [...subtasks]
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed
    
    // Reconstituir as notas com as etapas atualizadas
    const subtaskLines = updatedSubtasks.map(subtask => 
      `${subtask.completed ? '✓' : '•'} ${subtask.text}`
    )
    
    const updatedNotes = subtaskLines.length > 0 
      ? (otherNotes ? `${subtaskLines.join('\n')}\n${otherNotes}` : subtaskLines.join('\n'))
      : otherNotes
    
    setNotes(updatedNotes)
    onUpdateTask(task.id, { notes: updatedNotes })
  }

  const handleDeleteTask = () => {
    onDeleteTask(task.id)
    onClose()
  }

  const handleAddToMyDay = () => {
    const today = new Date().toISOString().split('T')[0]
    onUpdateTask(task.id, { dueDate: today })
    toast({
      title: "Adicionado ao Meu Dia",
      description: "Tarefa adicionada ao seu dia de hoje",
    })
  }

  const handleSetReminder = (reminderDate: string) => {
    onUpdateTask(task.id, { reminderDate })
    setShowReminderPicker(false)
    toast({
      title: "Lembrete definido",
      description: "Lembrete configurado com sucesso",
    })
  }

  const handleSetDueDate = (dueDate: string) => {
    onUpdateTask(task.id, { dueDate })
    setShowDatePicker(false)
    toast({
      title: "Data de conclusão definida",
      description: "Data de vencimento configurada",
    })
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskLine = `• ${newSubtask.trim()}`
      const updatedNotes = notes 
        ? `${newSubtaskLine}\n${notes}`
        : newSubtaskLine
      
      onUpdateTask(task.id, { notes: updatedNotes })
      setNotes(updatedNotes)
      setNewSubtask("")
      setShowSubtaskInput(false)
      
      toast({
        title: "Etapa adicionada",
        description: "Nova etapa criada com sucesso",
      })
    }
  }

  const handleAssignTask = () => {
    if (assignTo.trim()) {
      onUpdateTask(task.id, { assignedTo: assignTo.trim() })
      setShowAssignPicker(false)
      setAssignTo("")
      toast({
        title: "Tarefa atribuída",
        description: `Tarefa atribuída para ${assignTo.trim()}`,
      })
    }
  }

  const handleAddFile = () => {
    // Criar um input file temporário
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const newFiles: AttachedFile[] = Array.from(files).map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size
        }))
        
        setAttachedFiles(prev => [...prev, ...newFiles])
        
        const fileNames = newFiles.map(file => file.name)
        toast({
          title: "Arquivos anexados",
          description: `${fileNames.length} arquivo(s) anexado(s): ${fileNames.join(', ')}`,
        })
      }
    }
    input.click()
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
    toast({
      title: "Arquivo removido",
      description: "Arquivo foi removido da tarefa",
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isInMyDay = task.dueDate === new Date().toISOString().split('T')[0]

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
          {/* Lista de etapas existentes */}
          {subtasks.length > 0 && (
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleSubtaskToggle(index)}
                    className="shrink-0"
                  />
                  <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                    {subtask.text}
                  </span>
                </div>
              ))}
              <Separator className="my-3" />
            </div>
          )}

          {/* Adicionar etapa */}
          {showSubtaskInput ? (
            <div className="space-y-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Digite o nome da etapa"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtask()
                  } else if (e.key === 'Escape') {
                    setShowSubtaskInput(false)
                    setNewSubtask("")
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSubtask}>
                  Adicionar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowSubtaskInput(false)
                    setNewSubtask("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-3"
              onClick={() => setShowSubtaskInput(true)}
            >
              <Plus className="w-4 h-4 mr-3 text-blue-600" />
              <span className="text-blue-600">Adicionar etapa</span>
            </Button>
          )}

          <Separator />

          {/* Opções de ação */}
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-3"
              onClick={handleAddToMyDay}
              disabled={isInMyDay}
            >
              <Sun className="w-4 h-4 mr-3" />
              <span>{isInMyDay ? "Já está no Meu Dia" : "Adicionar a Meu Dia"}</span>
            </Button>

            {showReminderPicker ? (
              <div className="space-y-2 p-3 border rounded">
                <label className="text-sm font-medium">Definir lembrete</label>
                <Input
                  type="datetime-local"
                  onChange={(e) => handleSetReminder(e.target.value)}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowReminderPicker(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-3"
                onClick={() => setShowReminderPicker(true)}
              >
                <Clock className="w-4 h-4 mr-3" />
                <span>Lembrar-me</span>
                {task.reminderDate && (
                  <span className="ml-auto text-sm text-muted-foreground">
                    {new Date(task.reminderDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </Button>
            )}

            {showDatePicker ? (
              <div className="space-y-2 p-3 border rounded">
                <label className="text-sm font-medium">Data de conclusão</label>
                <Input
                  type="date"
                  defaultValue={task.dueDate}
                  onChange={(e) => handleSetDueDate(e.target.value)}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-3"
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar className="w-4 h-4 mr-3" />
                <span>Adicionar data de conclusão</span>
                {task.dueDate && (
                  <span className="ml-auto text-sm text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </Button>
            )}

            {showAssignPicker ? (
              <div className="space-y-2 p-3 border rounded">
                <label className="text-sm font-medium">Atribuir tarefa para</label>
                <Input
                  type="text"
                  placeholder="Digite o nome ou email"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAssignTask()
                    } else if (e.key === 'Escape') {
                      setShowAssignPicker(false)
                      setAssignTo("")
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAssignTask}>
                    Atribuir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setShowAssignPicker(false)
                      setAssignTo("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-3"
                onClick={() => setShowAssignPicker(true)}
              >
                <User className="w-4 h-4 mr-3" />
                <span>Atribuir a</span>
                {task.assignedTo && (
                  <span className="ml-auto text-sm text-muted-foreground">
                    {task.assignedTo}
                  </span>
                )}
              </Button>
            )}

            {/* Lista de arquivos anexados */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground px-3">
                  Arquivos anexados
                </div>
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 px-3"
              onClick={handleAddFile}
            >
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
              value={otherNotes}
              onChange={(e) => {
                const updatedNotes = subtasks.length > 0 
                  ? `${subtasks.map(s => `${s.completed ? '✓' : '•'} ${s.text}`).join('\n')}\n${e.target.value}`
                  : e.target.value
                setNotes(updatedNotes)
                handleNotesChange(updatedNotes)
              }}
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
