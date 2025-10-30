-- Create serper_settings table for API configuration
CREATE TABLE IF NOT EXISTS public.serper_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gl TEXT NOT NULL DEFAULT 'tr',
  hl TEXT NOT NULL DEFAULT 'tr',
  location TEXT NOT NULL DEFAULT 'Turkey',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serper_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view settings
CREATE POLICY "Admins can view serper settings"
  ON public.serper_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update settings
CREATE POLICY "Admins can update serper settings"
  ON public.serper_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert settings
CREATE POLICY "Admins can insert serper settings"
  ON public.serper_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_serper_settings_updated_at
  BEFORE UPDATE ON public.serper_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings
INSERT INTO public.serper_settings (gl, hl, location)
VALUES ('tr', 'tr', 'Turkey')
ON CONFLICT DO NOTHING;