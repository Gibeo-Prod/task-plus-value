
import { AlertCircle, ArrowUp, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrioritySelectorProps {
  priority: 'low' | 'medium' | 'high'
  onPriorityChange: (priority: 'low' | 'medium' | 'high') => void
}

export function PrioritySelector({ priority, onPriorityChange }: PrioritySelectorProps) {
  const priorityOptions = [
    { value: 'low', label: 'Baixa', icon: Minus, color: 'text-blue-500' },
    { value: 'medium', label: 'Média', icon: AlertCircle, color: 'text-yellow-500' },
    { value: 'high', label: 'Alta', icon: ArrowUp, color: 'text-red-500' }
  ]

  const selectedOption = priorityOptions.find(option => option.value === priority)

  return (
    <Select value={priority} onValueChange={onPriorityChange}>
      <SelectTrigger className="w-32">
        <SelectValue>
          {selectedOption && (
            <div className="flex items-center gap-2">
              <selectedOption.icon className={`w-4 h-4 ${selectedOption.color}`} />
              <span>{selectedOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <option.icon className={`w-4 h-4 ${option.color}`} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
