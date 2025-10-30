-- Create firm_reports table for user reports about firms
CREATE TABLE public.firm_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reporter_phone TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('unread', 'read', 'resolved'))
);

-- Enable RLS
ALTER TABLE public.firm_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can insert reports
CREATE POLICY "Anyone can insert firm reports"
ON public.firm_reports
FOR INSERT
WITH CHECK (true);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.firm_reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.firm_reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
ON public.firm_reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_firm_reports_updated_at
BEFORE UPDATE ON public.firm_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();