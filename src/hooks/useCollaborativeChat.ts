
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface ChatMessage {
  id: string
  chatId: string
  senderId?: string
  senderEmail: string
  senderName: string
  content: string
  messageType: 'text' | 'file' | 'system'
  isPinned: boolean
  replyToId?: string
  timestamp: string
}

export interface ChatParticipant {
  id: string
  chatId: string
  userId?: string
  email: string
  role: 'owner' | 'client' | 'architect' | 'commercial' | 'guest'
  status: 'pending' | 'active' | 'removed'
  invitedBy?: string
  invitedAt: string
  joinedAt?: string
  lastReadAt: string
}

export interface ProjectChat {
  id: string
  projectId: string
  name: string
  createdAt: string
  updatedAt: string
}

export const useCollaborativeChat = (projectId: string) => {
  const [chat, setChat] = useState<ProjectChat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize or get existing chat for project
  useEffect(() => {
    initializeChat()
  }, [projectId])

  // Load messages when chat is ready
  useEffect(() => {
    if (chat?.id) {
      loadMessages()
      loadParticipants()
      subscribeToMessages()
    }
  }, [chat?.id])

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      
      // Check if chat already exists for this project
      const { data: existingChat, error: chatError } = await supabase
        .from('project_chats')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (chatError && chatError.code !== 'PGRST116') {
        throw chatError
      }

      if (existingChat) {
        setChat({
          id: existingChat.id,
          projectId: existingChat.project_id,
          name: existingChat.name,
          createdAt: existingChat.created_at,
          updatedAt: existingChat.updated_at
        })
      } else {
        // Create new chat for project
        const { data: newChat, error: createError } = await supabase
          .from('project_chats')
          .insert({
            project_id: projectId,
            name: 'Chat do Projeto'
          })
          .select()
          .single()

        if (createError) throw createError

        setChat({
          id: newChat.id,
          projectId: newChat.project_id,
          name: newChat.name,
          createdAt: newChat.created_at,
          updatedAt: newChat.updated_at
        })

        // Add project owner as participant
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('chat_participants')
            .insert({
              chat_id: newChat.id,
              user_id: user.id,
              email: user.email || '',
              role: 'owner',
              status: 'active',
              joined_at: new Date().toISOString()
            })
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      setError('Erro ao inicializar chat')
      toast({
        title: "Erro",
        description: "Não foi possível inicializar o chat",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!chat?.id) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        chatId: msg.chat_id,
        senderId: msg.sender_id || undefined,
        senderEmail: msg.sender_email,
        senderName: msg.sender_name,
        content: msg.content,
        messageType: msg.message_type as 'text' | 'file' | 'system',
        isPinned: msg.is_pinned || false,
        replyToId: msg.reply_to_id || undefined,
        timestamp: msg.created_at
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      })
    }
  }

  const loadParticipants = async () => {
    if (!chat?.id) return

    try {
      // Load both active and pending participants
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('chat_id', chat.id)
        .in('status', ['active', 'pending'])
        .order('joined_at', { ascending: true })

      if (error) throw error

      const formattedParticipants: ChatParticipant[] = data.map(participant => ({
        id: participant.id,
        chatId: participant.chat_id,
        userId: participant.user_id || undefined,
        email: participant.email,
        role: participant.role as 'owner' | 'client' | 'architect' | 'commercial' | 'guest',
        status: participant.status as 'pending' | 'active' | 'removed',
        invitedBy: participant.invited_by || undefined,
        invitedAt: participant.invited_at || '',
        joinedAt: participant.joined_at || undefined,
        lastReadAt: participant.last_read_at || ''
      }))

      setParticipants(formattedParticipants)
    } catch (error) {
      console.error('Error loading participants:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os participantes",
        variant: "destructive",
      })
    }
  }

  const subscribeToMessages = () => {
    if (!chat?.id) return

    const channel = supabase
      .channel(`chat-${chat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chat.id}`
        },
        (payload) => {
          const newMessage = payload.new as any
          const formattedMessage: ChatMessage = {
            id: newMessage.id,
            chatId: newMessage.chat_id,
            senderId: newMessage.sender_id || undefined,
            senderEmail: newMessage.sender_email,
            senderName: newMessage.sender_name,
            content: newMessage.content,
            messageType: newMessage.message_type,
            isPinned: newMessage.is_pinned || false,
            replyToId: newMessage.reply_to_id || undefined,
            timestamp: newMessage.created_at
          }
          
          setMessages(prev => [...prev, formattedMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (content: string) => {
    if (!chat?.id || !content.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chat.id,
          sender_id: user.id,
          sender_email: user.email || '',
          sender_name: user.user_metadata?.full_name || user.email || 'Usuário',
          content: content.trim(),
          message_type: 'text'
        })

      if (error) throw error

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      })
    }
  }

  const inviteUser = async (email: string, role: 'client' | 'architect' | 'commercial' | 'guest') => {
    if (!chat?.id) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate unique token
      const token = crypto.randomUUID()

      // Create invitation
      const { error: inviteError } = await supabase
        .from('chat_invitations')
        .insert({
          chat_id: chat.id,
          email,
          role,
          token,
          invited_by: user.id
        })

      if (inviteError) throw inviteError

      // Add participant as pending
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert({
          chat_id: chat.id,
          email,
          role,
          status: 'pending',
          invited_by: user.id
        })

      if (participantError) throw participantError

      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${email}`,
      })

      // Reload participants
      loadParticipants()

    } catch (error) {
      console.error('Error inviting user:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive",
      })
    }
  }

  return {
    chat,
    messages,
    participants,
    sendMessage,
    inviteUser,
    isLoading,
    error
  }
}
