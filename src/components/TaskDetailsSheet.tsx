import { useState } from "react"
import { X, Plus, Sun, Clock, Calendar, User, Paperclip, FileText, Trash2, Eye } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useReminders } from "@/hooks/useReminders"
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
  url: string
  type: string
}

export function TaskDetailsSheet({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onDeleteTask 
}: TaskDetailsSheetProps) {
  const [notes, setNotes] = useState(task?.description || "")
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showReminderPicker, setShowReminderPicker] = useState(false)
  const [showAssignPicker, setShowAssignPicker] = useState(false)
  const [assignTo, setAssignTo] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null)
  const { toast } = useToast()
  const { createReminder, updateReminder, deleteReminder, getReminderForTask } = useReminders()

  if (!task) return null

  const existingReminder = getReminderForTask(task.id)

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
    onUpdateTask(task.id, { description: value })
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
    onUpdateTask(task.id, { description: updatedNotes })
  }

  const handleDeleteTask = () => {
    onDeleteTask(task.id)
    onClose()
    toast({
      title: "Tarefa excluída",
      description: "A tarefa foi removida com sucesso",
    })
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
    if (!reminderDate) return
    
    if (existingReminder) {
      updateReminder({ 
        reminderId: existingReminder.id, 
        reminderDate 
      })
    } else {
      createReminder({ 
        taskId: task.id, 
        reminderDate 
      })
    }
    setShowReminderPicker(false)
  }

  const handleRemoveReminder = () => {
    if (existingReminder) {
      deleteReminder(existingReminder.id)
    }
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
      
      onUpdateTask(task.id, { description: updatedNotes })
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

  const isValidImageFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    return allowedTypes.includes(file.type)
  }

  const handleAddFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.jpg,.jpeg,.png,image/jpeg,image/png'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const validFiles = Array.from(files).filter(isValidImageFile)
        
        if (validFiles.length === 0) {
          toast({
            title: "Formato não suportado",
            description: "Apenas arquivos JPG e PNG são permitidos",
            variant: "destructive"
          })
          return
        }

        const newFiles: AttachedFile[] = validFiles.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          type: file.type
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
    const fileToRemove = attachedFiles.find(file => file.id === fileId)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url)
    }
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
    toast({
      title: "Arquivo removido",
      description: "Arquivo foi removido da tarefa",
    })
  }

  const handlePreviewFile = (file: AttachedFile) => {
    setPreviewFile(file)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatReminderDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isInMyDay = task.dueDate === new Date().toISOString().split('T')[0]

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-medium">
                {task.title}
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Definir lembrete</label>
                    {existingReminder && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveReminder}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <Input
                    type="datetime-local"
                    defaultValue={existingReminder?.reminder_date ? 
                      new Date(existingReminder.reminder_date).toISOString().slice(0, 16) : ''}
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
                  {existingReminder && (
                    <span className="ml-auto text-sm text-muted-foreground">
                      {formatReminderDate(existingReminder.reminder_date)}
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
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewFile(file)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
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
                <span>Adicionar arquivo (JPG, PNG)</span>
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

            {/* Botão de excluir com confirmação */}
            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    <span>Excluir tarefa</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTask}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de preview da imagem */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="flex justify-center">
              <img 
                src={previewFile.url} 
                alt={previewFile.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
