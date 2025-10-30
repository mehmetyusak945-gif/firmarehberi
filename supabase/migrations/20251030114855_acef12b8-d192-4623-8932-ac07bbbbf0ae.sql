-- Add mobile_phone column to firms table
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS mobile_phone TEXT;

-- Rename phone to landline_phone for clarity
ALTER TABLE public.firms RENAME COLUMN phone TO landline_phone;

COMMENT ON COLUMN public.firms.landline_phone IS 'Sabit telefon numarası';
COMMENT ON COLUMN public.firms.mobile_phone IS 'Mobil telefon numarası (WhatsApp için)';