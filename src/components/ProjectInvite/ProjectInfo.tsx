
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
    <div className="border rounded-lg p-3 sm:p-4 bg-muted/30 space-y-3">
      <div className="space-y-2">
        <h3 className="font-semibold text-base sm:text-lg leading-tight break-words">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed break-words">
            {project.description}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
        <div className="space-y-1 p-2 sm:p-3 bg-white/50 rounded-md">
          <span className="font-medium text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
            Valor do Projeto
          </span>
          <p className="text-green-600 font-bold text-base sm:text-lg">
            {formatCurrency(project.value)}
          </p>
        </div>
        
        <div className="space-y-1 p-2 sm:p-3 bg-white/50 rounded-md">
          <span className="font-medium text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
            Prioridade
          </span>
          <p className="capitalize font-semibold text-base sm:text-lg">
            {project.priority}
          </p>
        </div>
        
        <div className="space-y-1 p-2 sm:p-3 bg-white/50 rounded-md">
          <span className="font-medium text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
            Data de Início
          </span>
          <p className="font-semibold text-base sm:text-lg">
            {formatDate(project.start_date)}
          </p>
        </div>
        
        <div className="space-y-1 p-2 sm:p-3 bg-white/50 rounded-md">
          <span className="font-medium text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
            Prazo Final
          </span>
          <p className="text-orange-600 font-bold text-base sm:text-lg">
            {formatDate(project.due_date)}
          </p>
        </div>
      </div>
    </div>
  )
}
