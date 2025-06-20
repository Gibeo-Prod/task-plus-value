
import { useState, useRef, useEffect } from "react"
import { Send, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChatMessage, ChatParticipant } from "@/hooks/useCollaborativeChat"

interface ChatMessagesProps {
  messages: ChatMessage[]
  participants: ChatParticipant[]
  onSendMessage: (content: string) => void
  isLoading: boolean
}

export function ChatMessages({ messages, participants, onSendMessage, isLoading }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isLoading) return
    
    await onSendMessage(newMessage.trim())
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getParticipantRole = (email: string) => {
    const participant = participants.find(p => p.email === email)
    return participant?.role || 'guest'
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
      case 'owner': return 'text-purple-600'
      case 'client': return 'text-blue-600'
      case 'architect': return 'text-green-600'
      case 'commercial': return 'text-orange-600'
      case 'guest': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Seja o primeiro a enviar uma mensagem neste chat
              </p>
            </div>
          )}
          
          {messages.map((message) => {
            const role = getParticipantRole(message.senderEmail)
            const isCurrentUser = message.senderId // Simplified check
            
            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isCurrentUser ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-ms-blue text-white ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.senderName}
                    </span>
                    <span className={`text-xs ${getRoleColor(role)}`}>
                      {getRoleLabel(role)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isLoading}
            className="bg-ms-blue hover:bg-ms-blue-dark"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
