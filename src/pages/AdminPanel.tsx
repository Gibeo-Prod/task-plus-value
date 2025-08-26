import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { UserManagement } from '@/components/UserManagement'
import { ProjectManagement } from '@/components/ProjectManagement'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Database, ArrowLeft, Folder } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

const AdminPanel: React.FC = () => {
  const { isAdmin, loading } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalProjects: 0,
    systemStatus: 'Ativo'
  })
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      
      // Buscar total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Buscar total de administradores
      const { count: totalAdmins } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      // Buscar total de projetos
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalProjects: totalProjects || 0,
        systemStatus: 'Ativo'
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="container mx-auto px-6 py-8 flex-1 flex flex-col overflow-hidden">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        
        <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários e configurações do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <div className="animate-pulse bg-muted h-8 w-8 rounded"></div>
                ) : (
                  stats.totalUsers
                )}
              </div>
              <p className="text-xs text-muted-foreground">usuários registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <div className="animate-pulse bg-muted h-8 w-8 rounded"></div>
                ) : (
                  stats.totalAdmins
                )}
              </div>
              <p className="text-xs text-muted-foreground">usuários com privilégios admin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <div className="animate-pulse bg-muted h-8 w-8 rounded"></div>
                ) : (
                  stats.totalProjects
                )}
              </div>
              <p className="text-xs text-muted-foreground">projetos no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ativo</div>
              <p className="text-xs text-muted-foreground">status do sistema</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="flex-1 flex flex-col overflow-hidden">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Projetos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="flex-1 overflow-hidden">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="projects" className="flex-1 overflow-hidden">
            <ProjectManagement />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel