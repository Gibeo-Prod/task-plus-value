
-- Política para permitir que qualquer pessoa veja um convite usando o token
-- Isso é necessário para que convites possam ser acessados por links públicos
CREATE POLICY "Anyone can view invites by token" 
  ON public.project_invites 
  FOR SELECT 
  USING (token IS NOT NULL);

-- Remover a política restritiva existente se houver
DROP POLICY IF EXISTS "Users can view invites of their projects" ON public.project_invites;
