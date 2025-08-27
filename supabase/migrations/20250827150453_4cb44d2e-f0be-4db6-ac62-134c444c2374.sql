-- Remove todas as políticas existentes das tabelas de chat para eliminar recursão
DROP POLICY IF EXISTS "Users can view project chats for their projects" ON public.project_chats;
DROP POLICY IF EXISTS "Users can create project chats for their projects" ON public.project_chats;
DROP POLICY IF EXISTS "Users can update project chats for their projects" ON public.project_chats;
DROP POLICY IF EXISTS "Project owners and admins can create chats" ON public.project_chats;
DROP POLICY IF EXISTS "Project owners can create chats" ON public.project_chats;
DROP POLICY IF EXISTS "Users can view accessible chats, admins view all" ON public.project_chats;

-- Criar políticas simples e diretas para project_chats
CREATE POLICY "Enable select for project owners" 
ON public.project_chats 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for project owners" 
ON public.project_chats 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT p.id FROM public.projects p WHERE p.user_id = auth.uid()
  )
);

-- Remover políticas duplicadas de chat_messages
DROP POLICY IF EXISTS "Participants, owners and admins can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view accessible messages, admins view all" ON public.chat_messages;

-- Criar políticas simplificadas para chat_messages
CREATE POLICY "Enable select for project owners on messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    WHERE pc.project_id IN (
      SELECT p.id FROM public.projects p WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable insert for project owners on messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    WHERE pc.project_id IN (
      SELECT p.id FROM public.projects p WHERE p.user_id = auth.uid()
    )
  )
);

-- Remover políticas duplicadas de chat_participants  
DROP POLICY IF EXISTS "Project owners and admins can manage participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view accessible participants, admins view all" ON public.chat_participants;

-- Criar políticas simplificadas para chat_participants
CREATE POLICY "Enable select for project owners on participants" 
ON public.chat_participants 
FOR SELECT 
USING (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    WHERE pc.project_id IN (
      SELECT p.id FROM public.projects p WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable insert for project owners on participants" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    WHERE pc.project_id IN (
      SELECT p.id FROM public.projects p WHERE p.user_id = auth.uid()
    )
  )
);