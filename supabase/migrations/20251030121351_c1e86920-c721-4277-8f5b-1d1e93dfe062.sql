-- Fix RLS policy for firms table to allow admins to insert any firm
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert one firm only" ON public.firms;

-- Create separate policies for admins and regular users
CREATE POLICY "Admins can insert any firm"
ON public.firms
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert one firm"
ON public.firms
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = added_by 
  AND user_firm_count(auth.uid()) < 1
  AND NOT has_role(auth.uid(), 'admin'::app_role)
);