
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
      // Primeiro tenta mapear do banco para legível
      const mappedStatus = mapStatusFromDb(project.status)
      console.log(`Project ${project.name}: status=${project.status}, mapped=${mappedStatus}, comparing to=${status.name}`)
      
      // Se não encontrou o mapeamento, compara diretamente
      return mappedStatus === status.name || project.status === status.name
    })
    return acc
  }, {} as Record<string, any[]>)

  console.log('Projects by status:', Object.entries(projectsByStatus).map(([status, projectList]) => `${status}: ${(projectList as any[]).length}`))
  
  return projectsByStatus
}
