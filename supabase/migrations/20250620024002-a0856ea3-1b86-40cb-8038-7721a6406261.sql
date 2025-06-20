
-- Adicionar apenas as colunas que não existem na tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person_email TEXT,
ADD COLUMN IF NOT EXISTS contact_person_phone TEXT;

-- Criar tabela para convites de projeto
CREATE TABLE IF NOT EXISTS public.project_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('client', 'contact_person')),
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS na tabela project_invites
ALTER TABLE public.project_invites ENABLE ROW LEVEL SECURITY;

-- Política para visualizar convites dos próprios projetos
CREATE POLICY "Users can view invites of their projects" 
  ON public.project_invites 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_invites.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Política para criar convites nos próprios projetos
CREATE POLICY "Users can create invites for their projects" 
  ON public.project_invites 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_invites.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Política para atualizar convites dos próprios projetos
CREATE POLICY "Users can update invites of their projects" 
  ON public.project_invites 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_invites.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Adicionar constraints de foreign key
ALTER TABLE public.project_invites 
ADD CONSTRAINT fk_project_invites_project_id 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.project_invites 
ADD CONSTRAINT fk_project_invites_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Trigger para updated_at
CREATE TRIGGER update_project_invites_updated_at
    BEFORE UPDATE ON public.project_invites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
