-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop old category column if exists
ALTER TABLE public.firms DROP COLUMN IF EXISTS category;

-- Add category_id as foreign key
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Add external_id for CSV import tracking
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS external_id text UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_firms_category_id ON public.firms(category_id);
CREATE INDEX IF NOT EXISTS idx_firms_external_id ON public.firms(external_id);

-- Function to check if user has already added a firm
CREATE OR REPLACE FUNCTION public.user_firm_count(user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.firms
  WHERE added_by = user_id
$$;

-- Update RLS policy for non-admin users to limit to 1 firm
DROP POLICY IF EXISTS "Authenticated users can insert firms" ON public.firms;

CREATE POLICY "Users can insert one firm only"
ON public.firms
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = added_by AND 
  (
    has_role(auth.uid(), 'admin'::app_role) OR 
    user_firm_count(auth.uid()) < 1
  )
);