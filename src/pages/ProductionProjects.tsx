
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Filter, TrendingUp, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Project } from '@/types/projects';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductionProjectEditDialog } from '@/components/ProductionProjectEditDialog';
import { ProjectQuickActions } from '@/components/ProjectQuickActions';
import { BackButton } from '@/components/BackButton';

// Função para calcular comissão
const calculateCommission = (value: number): { rate: number; amount: number; category: string } => {
  if (value <= 100000) {
    return { rate: 0, amount: 0, category: 'Sem comissão' };
  } else if (value <= 200000) {
    return { rate: 0.5, amount: value * 0.005, category: '0,5%' };
  } else {
    return { rate: 1, amount: value * 0.01, category: '1%' };
  }
};

export default function ProductionProjects() {
  const { projects, clients, loading, updateProject } = useSupabaseData();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'commission' | 'date'>('value');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Em Produção' | 'Concluído'>('all');
  const [completedProjectsWithCommission, setCompletedProjectsWithCommission] = useState<(Project & { commission: ReturnType<typeof calculateCommission> })[]>([]);

  const productionProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const isRelevantStatus = project.status === 'Em Produção' || project.status === 'Concluído' || project.status === 'Pausado';
    return isRelevantStatus && matchesStatus;
  });
  
  const filteredProductionProjects = productionProjects.filter(project => {
    const client = clients.find(c => c.id === project.clientId);
    const clientName = client?.name || '';
    
    return (
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const completedProjects = projects.filter(project => {
    if (project.status !== 'Concluído' || !project.dueDate) return false;
    
    const projectDate = new Date(project.dueDate);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    return isWithinInterval(projectDate, { start: monthStart, end: monthEnd });
  });

  console.log('DEBUG - Completed Projects:', completedProjects);
  console.log('DEBUG - Selected Month:', selectedMonth);
  console.log('DEBUG - Total projects:', projects.length);

  const filteredCompletedProjects = completedProjectsWithCommission.filter(project => {
    const client = clients.find(c => c.id === project.clientId);
    const clientName = client?.name || '';
    
    return (
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedCompletedProjects = [...filteredCompletedProjects].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return Number(b.value) - Number(a.value);
      case 'commission':
        return b.commission.amount - a.commission.amount;
      case 'date':
        return new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime();
      default:
        return 0;
    }
  });

  useEffect(() => {
    // Calcular o valor total mensal primeiro
    const totalValueMonth = completedProjects.reduce((sum, project) => sum + Number(project.value), 0);
    
    // Calcular a comissão sobre o valor total mensal
    const monthlyCommission = calculateCommission(totalValueMonth);
    
    // Distribuir a comissão proporcionalmente entre os projetos
    const projectsWithCommission = completedProjects.map(project => {
      const projectValue = Number(project.value);
      const proportion = totalValueMonth > 0 ? projectValue / totalValueMonth : 0;
      const projectCommissionAmount = monthlyCommission.amount * proportion;
      
      return {
        ...project,
        commission: {
          rate: monthlyCommission.rate,
          amount: projectCommissionAmount,
          category: monthlyCommission.category
        }
      };
    });
    
    console.log('DEBUG - Total monthly value:', totalValueMonth);
    console.log('DEBUG - Monthly commission:', monthlyCommission);
    console.log('DEBUG - Projects with proportional commission:', projectsWithCommission);
    
    setCompletedProjectsWithCommission(projectsWithCommission);
  }, [completedProjects]);

  const totalCommissionMonth = completedProjectsWithCommission.reduce((sum, project) => sum + project.commission.amount, 0);
  const totalValueMonth = completedProjectsWithCommission.reduce((sum, project) => sum + Number(project.value), 0);

  // Estatísticas por categoria de comissão
  const commissionStats = completedProjectsWithCommission.reduce((acc, project) => {
    const category = project.commission.category;
    if (!acc[category]) {
      acc[category] = { count: 0, totalValue: 0, totalCommission: 0 };
    }
    acc[category].count += 1;
    acc[category].totalValue += Number(project.value);
    acc[category].totalCommission += project.commission.amount;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; totalCommission: number }>);

  const exportToCsv = () => {
    const csvData = completedProjectsWithCommission.map(project => {
      const client = clients.find(c => c.id === project.clientId);
      return {
        'Projeto': project.name,
        'Cliente': client?.name || '',
        'Valor': project.value,
        'Data Finalização': project.dueDate ? format(new Date(project.dueDate), 'dd/MM/yyyy') : '',
        'Comissão %': project.commission.category,
        'Valor Comissão': project.commission.amount.toFixed(2),
      };
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comissoes_${format(selectedMonth, 'MM_yyyy')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold">Projetos em Produção</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {productionProjects.length} projeto(s)
          </Badge>
          {completedProjectsWithCommission.length > 0 && (
            <Button onClick={exportToCsv} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'Em Produção').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Projetos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedProjectsWithCommission.length}
            </div>
            <p className="text-xs text-muted-foreground">
              No mês selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCommissionMonth.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValueMonth.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Faturamento do mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown de comissões por categoria */}
      {Object.keys(commissionStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown de Comissões - {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(commissionStats).map(([category, stats]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground">{category}</h4>
                  <p className="text-2xl font-bold">
                    {stats.totalCommission.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.count} projeto(s) • {stats.totalValue.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de todos os projetos (em produção, pausados, etc.) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciar Projetos</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Em Produção">Em Produção</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Buscar projeto/cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProductionProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum projeto encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProductionProjects.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                const commission = calculateCommission(Number(project.value));
                
                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge variant={
                          project.status === 'Em Produção' ? 'default' :
                          project.status === 'Concluído' ? 'secondary' :
                          project.status === 'Pausado' ? 'outline' : 'default'
                        }>
                          {project.status}
                        </Badge>
                        <Badge variant="outline">{commission.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {client?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Valor: {Number(project.value).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </p>
                      {project.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          {project.status === 'Concluído' ? 'Finalizado em' : 'Previsão'}: {format(new Date(project.dueDate), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="font-medium">
                          Comissão: {commission.amount.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </p>
                      </div>
                      <ProjectQuickActions project={project} onUpdate={async (id, data) => {
                        await updateProject(id, data);
                      }} />
                      <ProductionProjectEditDialog project={project} onUpdate={async (id, data) => {
                        await updateProject(id, data);
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projetos concluídos com filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comissões por Mês</CardTitle>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(selectedMonth, 'MMM yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-2">
                    <Label>Selecionar mês</Label>
                    <Input
                      type="month"
                      value={format(selectedMonth, 'yyyy-MM')}
                      onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Ordenar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sort">Ordenar por</Label>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border">
                          <SelectItem value="value">Valor do projeto</SelectItem>
                          <SelectItem value="commission">Valor da comissão</SelectItem>
                          <SelectItem value="date">Data de conclusão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedCompletedProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum projeto concluído no mês selecionado
            </p>
          ) : (
            <div className="space-y-4">
              {sortedCompletedProjects.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                
                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge variant={project.commission.rate === 0 ? 'secondary' : 'default'}>
                          {project.commission.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {client?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Concluído em: {project.dueDate && format(new Date(project.dueDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        {Number(project.value).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        Comissão: {project.commission.amount.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
