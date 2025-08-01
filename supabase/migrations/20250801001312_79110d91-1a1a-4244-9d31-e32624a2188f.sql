-- Add missing RLS policies for chat_invitations
CREATE POLICY "Project owners can manage chat invitations" 
ON public.chat_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM project_chats pc 
    JOIN projects p ON pc.project_id = p.id 
    WHERE pc.id = chat_invitations.chat_id 
    AND p.user_id = auth.uid()
  )
);

-- Add missing RLS policies for message_attachments  
CREATE POLICY "Users can view attachments of accessible chats" 
ON public.message_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM chat_messages cm 
    JOIN project_chats pc ON cm.chat_id = pc.id 
    JOIN projects p ON pc.project_id = p.id 
    WHERE cm.id = message_attachments.message_id 
    AND (
      p.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM chat_participants cp 
        WHERE cp.chat_id = cm.chat_id 
        AND cp.user_id = auth.uid() 
        AND cp.status = 'active'
      )
    )
  )
);

CREATE POLICY "Participants can upload attachments" 
ON public.message_attachments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM chat_messages cm 
    JOIN project_chats pc ON cm.chat_id = pc.id 
    JOIN projects p ON pc.project_id = p.id 
    WHERE cm.id = message_attachments.message_id 
    AND (
      p.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM chat_participants cp 
        WHERE cp.chat_id = cm.chat_id 
        AND cp.user_id = auth.uid() 
        AND cp.status = 'active'
      )
    )
  )
);