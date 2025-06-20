
-- Create table for project chat messages
CREATE TABLE public.project_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.project_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for project chat messages
CREATE POLICY "Users can view messages of their projects" 
  ON public.project_chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_chat_messages.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their projects" 
  ON public.project_chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_chat_messages.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Add foreign key constraint
ALTER TABLE public.project_chat_messages 
ADD CONSTRAINT fk_project_chat_messages_project_id 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add trigger for updated_at
CREATE TRIGGER update_project_chat_messages_updated_at
    BEFORE UPDATE ON public.project_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
