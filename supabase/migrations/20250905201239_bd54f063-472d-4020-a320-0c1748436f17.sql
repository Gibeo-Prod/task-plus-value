-- Fix critical security vulnerability: Update existing policy to remove public access

-- Drop the existing policy first
DROP POLICY "Secure invite access - no public exposure" ON public.project_invites;

-- Create secure function for token validation
CREATE OR REPLACE FUNCTION public.validate_invite_token_access(invite_token text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM project_invites 
    WHERE token = invite_token 
      AND expires_at > now() 
      AND used_at IS NULL
  );
$$;

-- Create new secure policy without public access
CREATE POLICY "Secure invite access - owners and admins only" 
ON public.project_invites 
FOR SELECT 
USING (
  -- Project owners can see their invites
  (EXISTS (
    SELECT 1
    FROM projects
    WHERE projects.id = project_invites.project_id 
      AND projects.user_id = auth.uid()
  )) 
  OR 
  -- Admins can see all invites
  has_role(auth.uid(), 'admin'::app_role)
  -- SECURITY FIX: Removed public access condition completely
  -- No more: ((auth.uid() IS NULL) AND (expires_at > now()) AND (used_at IS NULL))
);

-- Create secure function to get invite data by token
CREATE OR REPLACE FUNCTION public.get_invite_by_token(invite_token text)
RETURNS TABLE(
  id uuid,
  project_id uuid,
  client_id uuid,
  recipient_name text,
  contact_type text,
  expires_at timestamptz,
  used_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pi.id,
    pi.project_id,
    pi.client_id,
    pi.recipient_name,
    pi.contact_type,
    pi.expires_at,
    pi.used_at
  FROM project_invites pi
  WHERE pi.token = invite_token
    AND pi.expires_at > now()
    AND pi.used_at IS NULL;
$$;