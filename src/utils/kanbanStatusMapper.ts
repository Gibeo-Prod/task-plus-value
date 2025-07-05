
// Função para organizar projetos por status com fallback para códigos antigos
export const organizeProjectsByStatus = (projects: any[], statuses: any[]) => {
  console.log('=== ORGANIZING PROJECTS BY STATUS ===')
  console.log('Available statuses:', statuses.map(s => ({ id: s.id, name: s.name })))
  console.log('Projects to organize:', projects.map(p => ({ id: p.id, name: p.name, status: p.status })))

  // Mapeamento de códigos antigos para nomes novos (fallback)
  const statusCodeMap: Record<string, string> = {
    'new': 'Planejamento',
    'in_progress': 'Em Andamento', 
    'in_review': 'Em Revisão',
    'completed': 'Concluído',
    'on_hold': 'Pausado',
    'cancelled': 'Cancelado'
  }

  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.name] = projects.filter(project => {
      console.log(`\n--- Checking project ${project.name} ---`)
      console.log(`Project status from DB: "${project.status}"`)
      console.log(`Status column name: "${status.name}"`)
      
      // Primeiro tenta comparação direta por nome
      const directMatch = project.status === status.name
      console.log(`✓ Direct match: "${project.status}" === "${status.name}" = ${directMatch}`)
      
      // Se não houver match direto, tenta usar o mapeamento de códigos antigos
      const mappedStatus = statusCodeMap[project.status]
      const mappedMatch = mappedStatus === status.name
      console.log(`✓ Mapped match: "${project.status}" -> "${mappedStatus}" === "${status.name}" = ${mappedMatch}`)
      
      return directMatch || mappedMatch
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
