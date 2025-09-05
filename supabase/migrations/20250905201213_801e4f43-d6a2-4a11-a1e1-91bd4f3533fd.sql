-- Fix critical security vulnerability: Remove public access to project_invites table
-- and implement secure token-based validation

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Secure invite access" ON public.project_invites;

-- Create a secure function to validate token access without exposing all data
CREATE OR REPLACE FUNCTION public.validate_invite_token_access(invite_token text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- This function validates that a specific token exists and is valid
  -- without exposing the actual invite data
  SELECT EXISTS (
    SELECT 1 
    FROM project_invites 
    WHERE token = invite_token 
      AND expires_at > now() 
      AND used_at IS NULL
  );
$$;

-- Create new secure RLS policy that removes public access
CREATE POLICY "Secure invite access - no public exposure" 
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
  -- Removed: OR ((auth.uid() IS NULL) AND (expires_at > now()) AND (used_at IS NULL))
  -- This was the security vulnerability - no more public access!
);

-- Update the invite validation function to be more specific
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
  -- This function allows secure access to invite data with a valid token
  -- It only returns data if the token is valid and not expired/used
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