
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
  
  // Se é um código padrão do banco, mapear para o nome do frontend
  if (statusMap[dbStatus as keyof typeof statusMap]) {
    return statusMap[dbStatus as keyof typeof statusMap]
  }
  
  // Se é um status personalizado, usar o nome diretamente
  return dbStatus
}

// Função para organizar projetos por status
export const organizeProjectsByStatus = (projects: any[], statuses: any[]) => {
  console.log('=== ORGANIZING PROJECTS BY STATUS ===')
  console.log('Available statuses:', statuses.map(s => ({ id: s.id, name: s.name })))
  console.log('Projects to organize:', projects.map(p => ({ id: p.id, name: p.name, status: p.status })))

  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.name] = projects.filter(project => {
      console.log(`\n--- Checking project ${project.name} ---`)
      console.log(`Project status from DB: "${project.status}"`)
      console.log(`Status column name: "${status.name}"`)
      
      // Lista de status padrão
      const defaultStatuses = [
        'Planejamento',
        'Em Andamento', 
        'Em Revisão',
        'Concluído',
        'Pausado',
        'Cancelado'
      ]
      
      // Se o status da coluna é padrão, verificar com mapeamento
      if (defaultStatuses.includes(status.name)) {
        const mappedProjectStatus = mapStatusFromDb(project.status)
        console.log(`Status padrão - Mapped project status: "${mappedProjectStatus}"`)
        
        const matches = mappedProjectStatus === status.name
        console.log(`✓ Mapped match: "${mappedProjectStatus}" === "${status.name}" = ${matches}`)
        return matches
      } else {
        // Se o status da coluna é personalizado, comparar diretamente
        const matches = project.status === status.name
        console.log(`Status personalizado - Direct match: "${project.status}" === "${status.name}" = ${matches}`)
        return matches
      }
    })
    
    console.log(`\nStatus "${status.name}" has ${acc[status.name].length} projects:`, acc[status.name].map(p => p.name))
    return acc
  }, {} as Record<string, any[]>)

  console.log('\n=== FINAL ORGANIZATION ===')
  Object.entries(projectsByStatus).forEach(([statusName, projectList]) => {
    console.log(`${statusName}: ${(projectList as any[]).length} projects`)
  })
  console.log('=================================\n')
  
  return projectsByStatus
}
