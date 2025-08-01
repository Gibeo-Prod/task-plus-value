import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { UserPlus, Settings, Trash2, Shield, User } from 'lucide-react'
import { useUserRoles, UserRole } from '@/hooks/useUserRoles'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const UserManagement: React.FC = () => {
  const { allUsers, isAdmin, assignRole, removeRole, refreshUsers } = useUserRoles()
  const { toast } = useToast()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [editingUser, setEditingUser] = useState<{ id: string; fullName: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  if (!isAdmin) {
    return null
  }

  const handleInviteUser = async () => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setIsInviting(true)
    try {
      // Call the secure admin-create-user edge function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password,
          fullName
        }
      })

      if (error) {
        throw new Error(error.message || 'Erro ao criar usuário')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      toast({
        title: "Usuário criado",
        description: `Usuário ${email} foi criado com sucesso`,
      })

      // Reset form
      setEmail('')
      setPassword('')
      setFullName('')
      setIsInviteDialogOpen(false)
      
      // Refresh users list
      await refreshUsers()
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleEditUser = async (userId: string, newFullName: string) => {
    setIsEditing(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newFullName })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Usuário atualizado",
        description: "Informações do usuário foram atualizadas com sucesso",
      })

      setEditingUser(null)
      await refreshUsers()
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleResetPassword = async (userId: string, newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId,
          password: newPassword
        }
      })

      if (error) {
        throw new Error(error.message || 'Erro ao resetar senha')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      toast({
        title: "Senha atualizada",
        description: "Senha do usuário foi atualizada com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleRoleToggle = async (userId: string, role: UserRole) => {
    try {
      const user = allUsers.find(u => u.id === userId)
      if (!user) return

      if (user.roles.includes(role)) {
        await removeRole(userId, role)
        toast({
          title: "Papel removido",
          description: `Papel ${role} removido do usuário`,
        })
      } else {
        await assignRole(userId, role)
        toast({
          title: "Papel atribuído",
          description: `Papel ${role} atribuído ao usuário`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) throw error

      toast({
        title: "Usuário removido",
        description: "Usuário foi removido com sucesso",
      })

      await refreshUsers()
    } catch (error: any) {
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">Gerencie usuários e suas permissões</p>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
              <DialogDescription>
                Crie uma nova conta de usuário para o sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha temporária"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Nome Completo (Opcional)</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInviteUser} disabled={isInviting}>
                  {isInviting ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left">Usuário</th>
              <th className="border border-border p-3 text-left">Email</th>
              <th className="border border-border p-3 text-left">Papel</th>
              <th className="border border-border p-3 text-left">Status</th>
              <th className="border border-border p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="border border-border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{user.full_name || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="border border-border p-3">
                  <div className="font-mono text-sm">{user.email}</div>
                </td>
                <td className="border border-border p-3">
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.map((role) => (
                      <Badge 
                        key={role} 
                        variant={role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'Usuário'
                        )}
                      </Badge>
                    ))}
                    {user.roles.length === 0 && (
                      <Badge variant="outline" className="text-xs">Sem papel</Badge>
                    )}
                  </div>
                </td>
                <td className="border border-border p-3">
                  <Badge variant="secondary" className="text-xs">
                    Ativo
                  </Badge>
                </td>
                <td className="border border-border p-3">
                  <div className="flex gap-2 flex-wrap">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingUser({ id: user.id, fullName: user.full_name || '' })}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                          <DialogDescription>
                            Atualize as informações do usuário
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="editEmail">Email</Label>
                            <Input
                              id="editEmail"
                              type="email"
                              defaultValue={user.email}
                              className="font-mono text-sm"
                              disabled
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Email não pode ser alterado por segurança
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="editFullName">Nome Completo</Label>
                            <Input
                              id="editFullName"
                              value={editingUser?.id === user.id ? editingUser.fullName : user.full_name || ''}
                              onChange={(e) => 
                                setEditingUser(prev => 
                                  prev?.id === user.id 
                                    ? { ...prev, fullName: e.target.value }
                                    : { id: user.id, fullName: e.target.value }
                                )
                              }
                              placeholder="Nome do usuário"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingUser(null)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={() => {
                                if (editingUser?.id === user.id) {
                                  handleEditUser(user.id, editingUser.fullName)
                                }
                              }}
                              disabled={isEditing}
                            >
                              {isEditing ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleToggle(user.id, 'admin')}
                    >
                      {user.roles.includes('admin') ? 'Remover Admin' : 'Tornar Admin'}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          🔑 Reset Senha
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resetar Senha</DialogTitle>
                          <DialogDescription>
                            Defina uma nova senha para {user.email}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          const newPassword = formData.get('newPassword') as string
                          const confirmPassword = formData.get('confirmPassword') as string
                          handleResetPassword(user.id, newPassword, confirmPassword)
                        }}>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newPassword">Nova Senha</Label>
                              <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                placeholder="Digite a nova senha"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirme a nova senha"
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline">Cancelar</Button>
                              <Button type="submit">Atualizar Senha</Button>
                            </div>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o usuário {user.email}? 
                            Esta ação não pode ser desfeita e removerá todos os dados associados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir Usuário
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allUsers.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}