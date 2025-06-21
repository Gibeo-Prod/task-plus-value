
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
    <div className="border rounded-lg p-3 sm:p-4 bg-muted/30 space-y-3 overflow-hidden">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight break-words">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed break-words hyphens-auto">
            {project.description}
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="p-2 sm:p-3 bg-white/50 rounded-md">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block mb-1">
            Valor do Projeto
          </span>
          <p className="text-green-600 font-bold text-sm sm:text-base lg:text-lg break-all">
            {formatCurrency(project.value)}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-2 sm:p-3 bg-white/50 rounded-md">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block mb-1">
              Prioridade
            </span>
            <p className="capitalize font-semibold">
              {project.priority}
            </p>
          </div>
          
          <div className="p-2 sm:p-3 bg-white/50 rounded-md">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block mb-1">
              Início
            </span>
            <p className="font-semibold text-xs sm:text-sm">
              {formatDate(project.start_date)}
            </p>
          </div>
          
          <div className="p-2 sm:p-3 bg-white/50 rounded-md">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block mb-1">
              Prazo
            </span>
            <p className="text-orange-600 font-bold text-xs sm:text-sm">
              {formatDate(project.due_date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
