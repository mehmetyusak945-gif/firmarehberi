-- Add AI-generated text columns to firms table
ALTER TABLE public.firms
ADD COLUMN IF NOT EXISTS ai_description text,
ADD COLUMN IF NOT EXISTS ai_meta_description text;

-- Create AI settings table
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'lovable',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash-lite',
  api_key text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ai_settings
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage AI settings
CREATE POLICY "Admins can view AI settings"
  ON public.ai_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert AI settings"
  ON public.ai_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update AI settings"
  ON public.ai_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete AI settings"
  ON public.ai_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.ai_settings (provider, model)
VALUES ('lovable', 'google/gemini-2.5-flash-lite')
ON CONFLICT DO NOTHING;