-- Enable RLS on ai_settings table to protect API keys
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Create rate limiting function to prevent scraping
CREATE OR REPLACE FUNCTION public.check_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for rate limiting logic
  -- In production, you would implement actual rate limiting here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_firms_is_approved ON public.firms(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_firms_category_id ON public.firms(category_id);
CREATE INDEX IF NOT EXISTS idx_firms_slug ON public.firms(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);