-- Drop and recreate policies with proper table aliases to fix ambiguity
DROP POLICY IF EXISTS "Users can view messages in their project chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their project chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view participants in their project chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can insert participants in their project chats" ON public.chat_participants;

-- Fixed chat_messages policies with proper aliases
CREATE POLICY "Users can view messages in their project chats" 
ON public.chat_messages 
FOR SELECT 
USING (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their project chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Fixed chat_participants policies with proper aliases  
CREATE POLICY "Users can view participants in their project chats" 
ON public.chat_participants 
FOR SELECT 
USING (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert participants in their project chats" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT pc.id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);