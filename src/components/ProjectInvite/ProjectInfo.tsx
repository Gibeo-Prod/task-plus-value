
interface ProjectData {
  name: string
  description: string
  value: number
  priority: string
  start_date: string
  due_date: string
}

interface ProjectInfoProps {
  project: ProjectData
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-muted/50">
      <h3 className="font-semibold text-base sm:text-lg mb-2 break-words">{project.name}</h3>
      {project.description && (
        <p className="text-muted-foreground mb-3 text-sm sm:text-base break-words">{project.description}</p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div className="space-y-1">
          <span className="font-medium block">Valor:</span>
          <p className="text-green-600 font-semibold">{formatCurrency(project.value)}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium block">Prioridade:</span>
          <p className="capitalize">{project.priority}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium block">Início:</span>
          <p>{formatDate(project.start_date)}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium block">Prazo:</span>
          <p className="text-orange-600 font-medium">{formatDate(project.due_date)}</p>
        </div>
      </div>
    </div>
  )
}
