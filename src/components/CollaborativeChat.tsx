
import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare, Users, UserPlus, ArrowLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatParticipants } from "@/components/ChatParticipants"
import { ChatMessages } from "@/components/ChatMessages"
import { InviteModal } from "@/components/InviteModal"
import { useCollaborativeChat } from "@/hooks/useCollaborativeChat"
import { Project } from "@/types/tasks"

interface CollaborativeChatProps {
  project: Project
  onBack: () => void
}

export function CollaborativeChat({ project, onBack }: CollaborativeChatProps) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const { 
    chat, 
    messages, 
    participants, 
    sendMessage, 
    inviteUser,
    isLoading,
    error
  } = useCollaborativeChat(project.id)

  return (
    <div className="flex-1 p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-ms-blue" />
            <div>
              <h1 className="text-2xl font-semibold">Chat Colaborativo</h1>
              <p className="text-sm text-muted-foreground">
                Projeto: {project.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Convidar
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {participants.length} participante{participants.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ChatMessages 
                messages={messages}
                participants={participants}
                onSendMessage={sendMessage}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatParticipants 
                participants={participants}
                projectOwnerId={project.clientId} // Assuming clientId is the owner
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={inviteUser}
        projectName={project.name}
      />
    </div>
  )
}
