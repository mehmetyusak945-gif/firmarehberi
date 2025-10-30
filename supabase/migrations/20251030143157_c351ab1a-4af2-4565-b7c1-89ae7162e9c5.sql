-- Create webmaster_settings table for storing verification codes
CREATE TABLE IF NOT EXISTS public.webmaster_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_search_console_meta TEXT,
  yandex_webmaster_meta TEXT,
  bing_webmaster_meta TEXT,
  google_analytics_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.webmaster_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage webmaster settings
CREATE POLICY "Admins can view webmaster settings"
  ON public.webmaster_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert webmaster settings"
  ON public.webmaster_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update webmaster settings"
  ON public.webmaster_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_webmaster_settings_updated_at
  BEFORE UPDATE ON public.webmaster_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add suggested_category field to firms table
ALTER TABLE public.firms 
ADD COLUMN IF NOT EXISTS suggested_category TEXT;

-- Insert default row if not exists
INSERT INTO public.webmaster_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.webmaster_settings);