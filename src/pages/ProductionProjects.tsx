import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Filter, TrendingUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Project } from '@/types/projects';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { projects, clients, loading } = useSupabaseData();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'commission' | 'date'>('value');
  const [completedProjectsWithCommission, setCompletedProjectsWithCommission] = useState<(Project & { commission: ReturnType<typeof calculateCommission> })[]>([]);

  const productionProjects = projects.filter(project => project.status === 'Em produção');
  
  const completedProjects = projects.filter(project => {
    if (project.status !== 'Concluído' || !project.dueDate) return false;
    
    const projectDate = new Date(project.dueDate);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    return isWithinInterval(projectDate, { start: monthStart, end: monthEnd });
  });

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
    const projectsWithCommission = completedProjects.map(project => ({
      ...project,
      commission: calculateCommission(Number(project.value))
    }));
    setCompletedProjectsWithCommission(projectsWithCommission);
  }, [completedProjects]);

  const totalCommissionMonth = completedProjectsWithCommission.reduce((sum, project) => sum + project.commission.amount, 0);
  const totalValueMonth = completedProjectsWithCommission.reduce((sum, project) => sum + Number(project.value), 0);

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
        <h1 className="text-3xl font-bold">Projetos em Produção</h1>
        <Badge variant="secondary" className="text-sm">
          {productionProjects.length} projeto(s) em produção
        </Badge>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos em Produção</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Projetos atualmente sendo desenvolvidos
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
            <CardTitle className="text-sm font-medium">Valor Total do Mês</CardTitle>
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
              {completedProjectsWithCommission.length} projeto(s) concluído(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de projetos em produção */}
      <Card>
        <CardHeader>
          <CardTitle>Projetos em Produção</CardTitle>
        </CardHeader>
        <CardContent>
          {productionProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum projeto em produção no momento
            </p>
          ) : (
            <div className="space-y-4">
              {productionProjects.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                const commission = calculateCommission(Number(project.value));
                
                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
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
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Comissão: {commission.amount.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </p>
                      {project.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Previsão: {format(new Date(project.dueDate), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros para projetos concluídos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projetos Concluídos - Comissões</CardTitle>
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
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search">Buscar projeto/cliente</Label>
                      <Input
                        id="search"
                        placeholder="Digite para buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sort">Ordenar por</Label>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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