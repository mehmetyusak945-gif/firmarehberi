-- Reklam kodları tablosu oluştur
CREATE TABLE IF NOT EXISTS public.ad_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS politikaları
ALTER TABLE public.ad_codes ENABLE ROW LEVEL SECURITY;

-- Herkes reklam kodlarını görebilir (aktif olanlar)
CREATE POLICY "Anyone can view active ad codes"
ON public.ad_codes
FOR SELECT
USING (is_active = true);

-- Sadece adminler ekleyebilir
CREATE POLICY "Admins can insert ad codes"
ON public.ad_codes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sadece adminler güncelleyebilir
CREATE POLICY "Admins can update ad codes"
ON public.ad_codes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sadece adminler silebilir
CREATE POLICY "Admins can delete ad codes"
ON public.ad_codes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_ad_codes_updated_at
BEFORE UPDATE ON public.ad_codes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();