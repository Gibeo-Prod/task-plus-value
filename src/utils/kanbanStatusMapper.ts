
// Função para organizar projetos por status com fallback robusto
export const organizeProjectsByStatus = (projects: any[], statuses: any[]) => {
  console.log('=== ORGANIZING PROJECTS BY STATUS ===')
  console.log('Available statuses:', statuses.map(s => ({ id: s.id, name: s.name })))
  console.log('Projects to organize:', projects.map(p => ({ id: p.id, name: p.name, status: p.status })))

  // Criar um set de status válidos para busca rápida
  const validStatusNames = new Set(statuses.map(s => s.name))
  
  // Mapeamento de códigos antigos para nomes novos (fallback robusto)
  const statusCodeMap: Record<string, string> = {
    'new': 'NOVO',
    'in_progress': 'Em Andamento', 
    'in_review': 'Em Revisão',
    'completed': 'Concluído',
    'on_hold': 'Pausado',
    'cancelled': 'Cancelado'
  }

  // Função para normalizar e encontrar o status correto
  const findValidStatus = (projectStatus: string): string | null => {
    // 1. Verificação direta
    if (validStatusNames.has(projectStatus)) {
      return projectStatus
    }
    
    // 2. Tentar mapeamento de código antigo
    const mappedStatus = statusCodeMap[projectStatus]
    if (mappedStatus && validStatusNames.has(mappedStatus)) {
      return mappedStatus
    }
    
    // 3. Busca case-insensitive
    const lowerProjectStatus = projectStatus.toLowerCase()
    for (const validStatus of validStatusNames) {
      if (validStatus.toLowerCase() === lowerProjectStatus) {
        return validStatus
      }
    }
    
    return null
  }

  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status.name] = projects.filter(project => {
      console.log(`\n--- Checking project ${project.name} ---`)
      console.log(`Project status from DB: "${project.status}"`)
      console.log(`Status column name: "${status.name}"`)
      
      const validStatus = findValidStatus(project.status)
      const isMatch = validStatus === status.name
      
      console.log(`✓ Found valid status: "${validStatus}" -> Match: ${isMatch}`)
      
      return isMatch
    })
    
    console.log(`\nStatus "${status.name}" has ${acc[status.name].length} projects:`, acc[status.name].map(p => p.name))
    return acc
  }, {} as Record<string, any[]>)

  // Log de projetos não categorizados e colocá-los na primeira coluna como fallback
  const categorizedProjectIds = Object.values(projectsByStatus).flat().map((p: any) => p.id)
  const uncategorizedProjects = projects.filter(p => !categorizedProjectIds.includes(p.id))
  
  if (uncategorizedProjects.length > 0) {
    console.warn('\n🚨 UNCATEGORIZED PROJECTS (moving to first status):')
    uncategorizedProjects.forEach(p => {
      console.warn(`- ${p.name} (status: "${p.status}")`)
    })
    
    // Colocar projetos órfãos na primeira coluna disponível
    if (statuses.length > 0) {
      const firstStatus = statuses[0].name
      projectsByStatus[firstStatus].push(...uncategorizedProjects)
      console.log(`✓ Moved ${uncategorizedProjects.length} orphaned projects to "${firstStatus}"`)
    }
  }

  console.log('\n=== FINAL ORGANIZATION ===')
  Object.entries(projectsByStatus).forEach(([statusName, projectList]) => {
    console.log(`${statusName}: ${(projectList as any[]).length} projects`)
  })
  console.log('=================================\n')
  
  return projectsByStatus
}
