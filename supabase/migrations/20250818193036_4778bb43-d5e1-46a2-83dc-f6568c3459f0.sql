-- Atualizar políticas RLS para permitir que admins gerenciem todos os projetos e conversas

-- 1. PROJETOS: Atualizar políticas para permitir acesso admin
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Nova política para visualização: usuários veem seus próprios + admins veem todos
CREATE POLICY "Users can view own projects, admins view all" ON public.projects
FOR SELECT USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nova política para atualização: usuários atualizam seus próprios + admins atualizam todos
CREATE POLICY "Users can update own projects, admins update all" ON public.projects
FOR UPDATE USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nova política para exclusão: usuários excluem seus próprios + admins excluem todos
CREATE POLICY "Users can delete own projects, admins delete all" ON public.projects
FOR DELETE USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 2. PROJECT CHATS: Atualizar políticas para permitir acesso admin
DROP POLICY IF EXISTS "Users can view chats of their projects" ON public.project_chats;

-- Nova política para visualização de chats: proprietários + participantes + admins
CREATE POLICY "Users can view accessible chats, admins view all" ON public.project_chats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_chats.project_id 
    AND projects.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_participants.chat_id = project_chats.id 
    AND chat_participants.user_id = auth.uid() 
    AND chat_participants.status = 'active'
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nova política para criação de chats: proprietários + admins
CREATE POLICY "Project owners and admins can create chats" ON public.project_chats
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_chats.project_id 
    AND projects.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 3. CHAT PARTICIPANTS: Atualizar políticas para permitir acesso admin
DROP POLICY IF EXISTS "Users can view participants of accessible chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Project owners can manage participants" ON public.chat_participants;

-- Nova política para visualização de participantes: acessíveis + admins veem todos
CREATE POLICY "Users can view accessible participants, admins view all" ON public.chat_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_chats pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.id = chat_participants.chat_id 
    AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = chat_participants.chat_id 
    AND cp.user_id = auth.uid() 
    AND cp.status = 'active'
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nova política para gerenciamento de participantes: proprietários + admins
CREATE POLICY "Project owners and admins can manage participants" ON public.chat_participants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM project_chats pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.id = chat_participants.chat_id 
    AND p.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 4. CHAT MESSAGES: Atualizar políticas para permitir acesso admin
DROP POLICY IF EXISTS "Users can view messages of accessible chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants can send messages" ON public.chat_messages;

-- Nova política para visualização de mensagens: participantes + proprietários + admins
CREATE POLICY "Users can view accessible messages, admins view all" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = chat_messages.chat_id 
    AND cp.user_id = auth.uid() 
    AND cp.status = 'active'
  ) OR
  EXISTS (
    SELECT 1 FROM project_chats pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.id = chat_messages.chat_id 
    AND p.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nova política para envio de mensagens: participantes + proprietários + admins
CREATE POLICY "Participants, owners and admins can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = chat_messages.chat_id 
    AND cp.user_id = auth.uid() 
    AND cp.status = 'active'
  ) OR
  EXISTS (
    SELECT 1 FROM project_chats pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.id = chat_messages.chat_id 
    AND p.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 5. CHAT INVITATIONS: Permitir que admins gerenciem convites
DROP POLICY IF EXISTS "Project owners can manage chat invitations" ON public.chat_invitations;

CREATE POLICY "Project owners and admins can manage chat invitations" ON public.chat_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM project_chats pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.id = chat_invitations.chat_id 
    AND p.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 6. MESSAGE ATTACHMENTS: Permitir que admins vejam e gerenciem anexos
DROP POLICY IF EXISTS "Users can view attachments of accessible chats" ON public.message_attachments;
DROP POLICY IF EXISTS "Participants can upload attachments" ON public.message_attachments;

-- Nova política para visualização de anexos: participantes + proprietários + admins
CREATE POLICY "Users can view accessible attachments, admins view all" ON public.message_attachments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_messages cm
    JOIN project_chats pc ON cm.chat_id = pc.id
    JOIN projects p ON pc.project_id = p.id
    WHERE cm.id = message_attachments.message_id 
    AND (
      p.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM chat_participants cp
        WHERE cp.chat_id = cm.chat_id 
        AND cp.user_id = auth.uid() 
        AND cp.status = 'active'
      )
    )
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Nova política para upload de anexos: participantes + proprietários + admins
CREATE POLICY "Participants, owners and admins can upload attachments" ON public.message_attachments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_messages cm
    JOIN project_chats pc ON cm.chat_id = pc.id
    JOIN projects p ON pc.project_id = p.id
    WHERE cm.id = message_attachments.message_id 
    AND (
      p.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM chat_participants cp
        WHERE cp.chat_id = cm.chat_id 
        AND cp.user_id = auth.uid() 
        AND cp.status = 'active'
      )
    )
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);