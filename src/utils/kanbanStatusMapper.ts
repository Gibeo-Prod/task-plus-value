
// Função para organizar projetos por status com fallback robusto
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

  // Criar um mapa reverso também (nome para código)
  const reverseStatusMap: Record<string, string> = {
    'Planejamento': 'new',
    'Em Andamento': 'in_progress',
    'Em Revisão': 'in_review',
    'Concluído': 'completed',
    'Pausado': 'on_hold',
    'Cancelado': 'cancelled'
  }

  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.name] = projects.filter(project => {
      console.log(`\n--- Checking project ${project.name} ---`)
      console.log(`Project status from DB: "${project.status}"`)
      console.log(`Status column name: "${status.name}"`)
      
      // 1. Primeiro tenta comparação direta por nome
      const directMatch = project.status === status.name
      console.log(`✓ Direct match: "${project.status}" === "${status.name}" = ${directMatch}`)
      
      if (directMatch) return true
      
      // 2. Tenta usar o mapeamento de códigos antigos para nomes novos
      const mappedStatus = statusCodeMap[project.status]
      const mappedMatch = mappedStatus === status.name
      console.log(`✓ Code to name match: "${project.status}" -> "${mappedStatus}" === "${status.name}" = ${mappedMatch}`)
      
      if (mappedMatch) return true
      
      // 3. Tenta o mapeamento reverso (nome para código) - caso o projeto tenha nome mas o status espere código
      const reverseStatus = reverseStatusMap[project.status]
      const reverseMatch = reverseStatus && statusCodeMap[reverseStatus] === status.name
      console.log(`✓ Reverse match: "${project.status}" -> "${reverseStatus}" -> "${statusCodeMap[reverseStatus]}" === "${status.name}" = ${reverseMatch}`)
      
      return reverseMatch || false
    })
    
    console.log(`\nStatus "${status.name}" has ${acc[status.name].length} projects:`, acc[status.name].map(p => p.name))
    return acc
  }, {} as Record<string, any[]>)

  // Log de projetos não categorizados
  const categorizedProjectIds = Object.values(projectsByStatus).flat().map((p: any) => p.id)
  const uncategorizedProjects = projects.filter(p => !categorizedProjectIds.includes(p.id))
  
  if (uncategorizedProjects.length > 0) {
    console.warn('\n🚨 UNCATEGORIZED PROJECTS:')
    uncategorizedProjects.forEach(p => {
      console.warn(`- ${p.name} (status: "${p.status}")`)
    })
  }

  console.log('\n=== FINAL ORGANIZATION ===')
  Object.entries(projectsByStatus).forEach(([statusName, projectList]) => {
    console.log(`${statusName}: ${(projectList as any[]).length} projects`)
  })
  console.log('=================================\n')
  
  return projectsByStatus
}
