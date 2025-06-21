
-- Primeiro, vamos remover todas as políticas existentes de forma mais cuidadosa
DROP POLICY IF EXISTS "Anyone can view invites by token" ON public.project_invites;
DROP POLICY IF EXISTS "Users can view invites of their projects" ON public.project_invites;
DROP POLICY IF EXISTS "Users can create invites for their projects" ON public.project_invites;
DROP POLICY IF EXISTS "Users can update invites of their projects" ON public.project_invites;

-- Criar uma política que permite acesso público total para leitura
CREATE POLICY "Public access to invites by token" 
  ON public.project_invites 
  FOR SELECT 
  TO public
  USING (true);

-- Recriar as políticas para usuários autenticados
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
