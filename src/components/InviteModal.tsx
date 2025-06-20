
import { useState } from "react"
import { UserPlus, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: 'client' | 'architect' | 'commercial' | 'guest') => Promise<void>
  projectName: string
}

export function InviteModal({ isOpen, onClose, onInvite, projectName }: InviteModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<'client' | 'architect' | 'commercial' | 'guest'>('guest')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) return

    setIsLoading(true)
    try {
      await onInvite(email, role)
      setEmail("")
      setRole('guest')
      onClose()
    } catch (error) {
      console.error('Error inviting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    { value: 'client', label: 'Cliente', description: 'Pode visualizar e comentar no projeto' },
    { value: 'architect', label: 'Arquiteto', description: 'Pode colaborar no desenvolvimento do projeto' },
    { value: 'commercial', label: 'Comercial', description: 'Pode acompanhar questões comerciais' },
    { value: 'guest', label: 'Convidado', description: 'Acesso limitado ao chat' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar para o Chat
          </DialogTitle>
          <DialogDescription>
            Convide alguém para participar do chat do projeto "{projectName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>
                  O convidado receberá um email com link para aceitar o convite
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!email || !role || isLoading}
              className="bg-ms-blue hover:bg-ms-blue-dark"
            >
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
