
import { User, Crown, Briefcase, Palette, ShoppingBag, UserCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatParticipant } from "@/hooks/useCollaborativeChat"

interface ChatParticipantsProps {
  participants: ChatParticipant[]
  projectOwnerId: string
}

export function ChatParticipants({ participants, projectOwnerId }: ChatParticipantsProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3" />
      case 'client': return <Briefcase className="w-3 h-3" />
      case 'architect': return <Palette className="w-3 h-3" />
      case 'commercial': return <ShoppingBag className="w-3 h-3" />
      case 'guest': return <UserCheck className="w-3 h-3" />
      default: return <User className="w-3 h-3" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Proprietário'
      case 'client': return 'Cliente'
      case 'architect': return 'Arquiteto'
      case 'commercial': return 'Comercial'
      case 'guest': return 'Convidado'
      default: return 'Participante'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'client': return 'bg-blue-100 text-blue-800'
      case 'architect': return 'bg-green-100 text-green-800'
      case 'commercial': return 'bg-orange-100 text-orange-800'
      case 'guest': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'removed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'pending': return 'Pendente'
      case 'removed': return 'Removido'
      default: return status
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {participant.email.split('@')[0]}
                </p>
                {participant.status === 'active' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleColor(participant.role)}`}
                >
                  <span className="mr-1">{getRoleIcon(participant.role)}</span>
                  {getRoleLabel(participant.role)}
                </Badge>
                {participant.status !== 'active' && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(participant.status)}`}
                  >
                    {getStatusLabel(participant.status)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
