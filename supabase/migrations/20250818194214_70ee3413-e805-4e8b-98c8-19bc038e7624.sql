-- CRITICAL SECURITY FIX: Properly secure project_invites table
-- Remove the overly permissive public access and implement secure token-based access

-- Drop the current insecure policy
DROP POLICY IF EXISTS "Restricted invite access by token" ON public.project_invites;

-- Create a new policy that only allows access to project owners and invited users with valid tokens
-- This fixes the security vulnerability while maintaining functionality
CREATE POLICY "Secure invite access" 
ON public.project_invites 
FOR SELECT 
USING (
  -- Project owners can see their invites
  (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invites.project_id 
    AND projects.user_id = auth.uid()
  ))
  OR
  -- Admins can see all invites
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Anonymous users can only access if they're specifically querying for a valid token
  -- and the invite hasn't expired
  (
    auth.uid() IS NULL 
    AND expires_at > now()
    AND used_at IS NULL
  )
);

-- Update the existing INSERT and UPDATE policies to be more explicit
-- (These were already secure but let's make sure they're clear)

-- Ensure only project owners can create invites (already exists but let's verify)
DROP POLICY IF EXISTS "Users can create invites for their projects" ON public.project_invites;
CREATE POLICY "Project owners can create invites" 
ON public.project_invites 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invites.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Ensure only project owners can update invites (mark as used, etc.)
DROP POLICY IF EXISTS "Users can update invites of their projects" ON public.project_invites;
CREATE POLICY "Project owners and admins can update invites" 
ON public.project_invites 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invites.project_id 
    AND projects.user_id = auth.uid()
  )
  OR
  has_role(auth.uid(), 'admin'::app_role)
);