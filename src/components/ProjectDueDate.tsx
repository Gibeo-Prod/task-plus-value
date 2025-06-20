
import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProjectDueDateProps {
  dueDate?: string
}

export function ProjectDueDate({ dueDate }: ProjectDueDateProps) {
  if (!dueDate) return null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Data de entrega: {new Date(dueDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
