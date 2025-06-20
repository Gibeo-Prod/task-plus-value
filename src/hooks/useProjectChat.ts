
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  projectId: string
}

export const useProjectChat = (projectId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load messages when component mounts
  useEffect(() => {
    loadMessages()
  }, [projectId])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('project_chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.created_at,
        projectId: msg.project_id
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens do chat",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async (content: string) => {
    setIsLoading(true)
    
    try {
      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        projectId
      }
      
      setMessages(prev => [...prev, userMessage])

      // Save user message to database
      const { data: userMsgData, error: userError } = await supabase
        .from('project_chat_messages')
        .insert({
          project_id: projectId,
          role: 'user',
          content
        })
        .select()
        .single()

      if (userError) throw userError

      // Update user message with real ID
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, id: userMsgData.id }
            : msg
        )
      )

      // Call AI assistant
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('project-chat-ai', {
        body: { 
          projectId, 
          message: content,
          messageHistory: messages.slice(-10) // Send last 10 messages for context
        }
      })

      if (aiError) throw aiError

      // Add AI response to database and local state
      const { data: aiMsgData, error: aiSaveError } = await supabase
        .from('project_chat_messages')
        .insert({
          project_id: projectId,
          role: 'assistant',
          content: aiResponse.response
        })
        .select()
        .single()

      if (aiSaveError) throw aiSaveError

      const aiMessage: ChatMessage = {
        id: aiMsgData.id,
        role: 'assistant',
        content: aiResponse.response,
        timestamp: aiMsgData.created_at,
        projectId
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      })
      
      // Remove failed user message
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    sendMessage,
    isLoading
  }
}
