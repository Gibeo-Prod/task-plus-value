
// Função para mapear status do DB para nomes legíveis
export const mapStatusFromDb = (dbStatus: string): string => {
  const statusMap = {
    'new': 'Planejamento',
    'in_progress': 'Em Andamento',
    'in_review': 'Em Revisão',
    'completed': 'Concluído',
    'on_hold': 'Pausado',
    'cancelled': 'Cancelado'
  }
  return statusMap[dbStatus as keyof typeof statusMap] || dbStatus
}

// Função para organizar projetos por status
export const organizeProjectsByStatus = (projects: any[], statuses: any[]) => {
  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.name] = projects.filter(project => {
      console.log(`Project ${project.name}: project.status=${project.status}, status.name=${status.name}`)
      
      // Comparar diretamente o status do projeto com o nome do status
      // Se o projeto tem status do banco (ex: 'new'), comparar com status mapeado
      const mappedProjectStatus = mapStatusFromDb(project.status)
      const matches = mappedProjectStatus === status.name
      
      console.log(`Mapped project status: ${mappedProjectStatus}, matches: ${matches}`)
      
      return matches
    })
    return acc
  }, {} as Record<string, any[]>)

  console.log('Projects by status:', Object.entries(projectsByStatus).map(([status, projectList]) => `${status}: ${(projectList as any[]).length}`))
  
  return projectsByStatus
}
