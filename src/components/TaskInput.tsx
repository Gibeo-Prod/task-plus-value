
import { useState } from "react"
import { Plus, Calendar, Bell, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CategorySelector } from "./CategorySelector"
import { TagSelector } from "./TagSelector"
import { PrioritySelector } from "./PrioritySelector"
import { TaskCategory, TaskTag } from "@/types/tasks"

interface TaskInputProps {
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
  placeholder?: string
  categories: TaskCategory[]
  tags: TaskTag[]
  onAddCategory: (name: string, color: string, icon: string) => void
  onAddTag: (name: string, color: string) => void
  projectId?: string | null // Add projectId prop
}

export function TaskInput({ 
  onAddTask, 
  placeholder = "Adicionar uma tarefa",
  categories,
  tags,
  onAddCategory,
  onAddTag,
  projectId
}: TaskInputProps) {
  const [taskText, setTaskText] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [reminderDate, setReminderDate] = useState("")
  const [categoryId, setCategoryId] = useState<string>()
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [notes, setNotes] = useState("")
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskText.trim()) {
      console.log('Submitting task with projectId:', projectId)
      onAddTask({
        text: taskText.trim(),
        dueDate: dueDate || undefined,
        categoryId,
        priority,
        notes: notes || undefined,
        reminderDate: reminderDate || undefined,
        tags: selectedTags,
        projectId: projectId || undefined // Pass the projectId
      })
      
      // Reset form
      setTaskText("")
      setDueDate("")
      setReminderDate("")
      setCategoryId(undefined)
      setPriority('medium')
      setNotes("")
      setSelectedTags([])
      setShowAdvanced(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder={placeholder}
            className="flex-1 focus:ring-ms-blue focus:border-ms-blue"
          />
          <Button
            type="submit"
            disabled={!taskText.trim()}
            className="bg-ms-blue hover:bg-ms-blue-dark text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              {showAdvanced ? "Ocultar opções" : "Mais opções"}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Vencimento</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="focus:ring-ms-blue focus:border-ms-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lembrete</label>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="focus:ring-ms-blue focus:border-ms-blue"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <CategorySelector
                categories={categories}
                selectedCategory={categoryId}
                onSelectCategory={setCategoryId}
                onAddCategory={onAddCategory}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <PrioritySelector
                priority={priority}
                onPriorityChange={setPriority}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Etiquetas</label>
              <TagSelector
                availableTags={tags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onAddTag={onAddTag}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicionar notas sobre a tarefa..."
                className="focus:ring-ms-blue focus:border-ms-blue"
                rows={3}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>
    </div>
  )
}
