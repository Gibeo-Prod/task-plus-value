
-- Drop existing table to recreate with new structure
DROP TABLE IF EXISTS public.project_chat_messages CASCADE;

-- Create table for project chats (one chat per project)
CREATE TABLE public.project_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Chat do Projeto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Create table for chat participants with role-based permissions
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.project_chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'client', 'architect', 'commercial', 'guest')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chat_id, email)
);

-- Create table for chat invitations
CREATE TABLE public.chat_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.project_chats(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'architect', 'commercial', 'guest')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.project_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  is_pinned BOOLEAN DEFAULT FALSE,
  reply_to_id UUID REFERENCES public.chat_messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat mentions
CREATE TABLE public.chat_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_email TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for message attachments
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_chats
CREATE POLICY "Users can view chats of their projects" 
  ON public.project_chats 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_chats.project_id 
      AND projects.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE chat_participants.chat_id = project_chats.id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.status = 'active'
    )
  );

CREATE POLICY "Project owners can create chats" 
  ON public.project_chats 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_chats.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants of accessible chats" 
  ON public.chat_participants 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_chats pc
      JOIN public.projects p ON pc.project_id = p.id
      WHERE pc.id = chat_participants.chat_id 
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = chat_participants.chat_id
      AND cp.user_id = auth.uid()
      AND cp.status = 'active'
    )
  );

CREATE POLICY "Project owners can manage participants" 
  ON public.chat_participants 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_chats pc
      JOIN public.projects p ON pc.project_id = p.id
      WHERE pc.id = chat_participants.chat_id 
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages of accessible chats" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = chat_messages.chat_id
      AND cp.user_id = auth.uid()
      AND cp.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.project_chats pc
      JOIN public.projects p ON pc.project_id = p.id
      WHERE pc.id = chat_messages.chat_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = chat_messages.chat_id
      AND cp.user_id = auth.uid()
      AND cp.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.project_chats pc
      JOIN public.projects p ON pc.project_id = p.id
      WHERE pc.id = chat_messages.chat_id 
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for chat_mentions
CREATE POLICY "Users can view their mentions" 
  ON public.chat_mentions 
  FOR SELECT 
  USING (mentioned_user_id = auth.uid());

CREATE POLICY "Participants can create mentions" 
  ON public.chat_mentions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_participants cp ON cp.chat_id = cm.chat_id
      WHERE cm.id = chat_mentions.message_id
      AND cp.user_id = auth.uid()
      AND cp.status = 'active'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_project_chats_updated_at
    BEFORE UPDATE ON public.project_chats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_participants_updated_at
    BEFORE UPDATE ON public.chat_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_chat_participants_chat_user ON public.chat_participants(chat_id, user_id);
CREATE INDEX idx_chat_messages_chat_created ON public.chat_messages(chat_id, created_at);
CREATE INDEX idx_chat_mentions_user_read ON public.chat_mentions(mentioned_user_id, is_read);
CREATE INDEX idx_chat_invitations_token ON public.chat_invitations(token);
CREATE INDEX idx_chat_invitations_email ON public.chat_invitations(email);
