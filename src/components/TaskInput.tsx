
import { useState } from "react"
import { Plus, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TaskInputProps {
  onAddTask: (text: string, dueDate?: string) => void
  placeholder?: string
}

export function TaskInput({ onAddTask, placeholder = "Adicionar uma tarefa" }: TaskInputProps) {
  const [taskText, setTaskText] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskText.trim()) {
      onAddTask(taskText.trim(), dueDate || undefined)
      setTaskText("")
      setDueDate("")
      setShowDatePicker(false)
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder={placeholder}
            className="pr-10 focus:ring-ms-blue focus:border-ms-blue"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
        <Button
          type="submit"
          disabled={!taskText.trim()}
          className="bg-ms-blue hover:bg-ms-blue-dark text-white"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </form>
      
      {showDatePicker && (
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-auto focus:ring-ms-blue focus:border-ms-blue"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDueDate("")
              setShowDatePicker(false)
            }}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
