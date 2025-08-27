-- Drop existing policies to fix infinite recursion
DROP POLICY IF EXISTS "Users can view project chats they participate in" ON public.project_chats;
DROP POLICY IF EXISTS "Users can create project chats" ON public.project_chats;

-- Create corrected policies without recursion
CREATE POLICY "Users can view project chats for their projects" 
ON public.project_chats 
FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create project chats for their projects" 
ON public.project_chats 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update project chats for their projects" 
ON public.project_chats 
FOR UPDATE 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = auth.uid()
  )
);

-- Fix chat_messages policies as well
DROP POLICY IF EXISTS "Users can view messages in their project chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their project chats" ON public.chat_messages;

CREATE POLICY "Users can view messages in their project chats" 
ON public.chat_messages 
FOR SELECT 
USING (
  chat_id IN (
    SELECT id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their project chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Fix chat_participants policies
DROP POLICY IF EXISTS "Users can view participants in their project chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can insert participants in their project chats" ON public.chat_participants;

CREATE POLICY "Users can view participants in their project chats" 
ON public.chat_participants 
FOR SELECT 
USING (
  chat_id IN (
    SELECT id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert participants in their project chats" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT id FROM public.project_chats pc
    JOIN public.projects p ON pc.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);