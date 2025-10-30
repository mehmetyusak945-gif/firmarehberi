import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface FirmReportDialogProps {
  firmId: string;
  firmName: string;
}

export const FirmReportDialog = ({ firmId, firmName }: FirmReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reporter_name: "",
    reporter_phone: "",
    description: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reporter_name.trim() || !formData.reporter_phone.trim() || !formData.description.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("firm_reports")
        .insert({
          firm_id: firmId,
          reporter_name: formData.reporter_name.trim(),
          reporter_phone: formData.reporter_phone.trim(),
          description: formData.description.trim(),
        });

      if (error) throw error;

      toast({
        title: "Bildirim Gönderildi",
        description: "Bildiriminiz başarıyla iletildi. En kısa sürede değerlendireceğiz.",
      });

      setFormData({ reporter_name: "", reporter_phone: "", description: "" });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Hata",
        description: "Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <AlertCircle className="h-4 w-4" />
          İşletme Hakkında Bildirim Gönder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>İşletme Hakkında Bildirim</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{firmName}</span> işletmesi hakkında bildirimde bulunun. 
            Hatalı bilgiler veya güncellemeler için bize ulaşın.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reporter_name">İsim & Soyisim *</Label>
            <Input
              id="reporter_name"
              value={formData.reporter_name}
              onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
              placeholder="Adınız ve soyadınız"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reporter_phone">Telefon *</Label>
            <Input
              id="reporter_phone"
              value={formData.reporter_phone}
              onChange={(e) => setFormData({ ...formData, reporter_phone: e.target.value })}
              placeholder="05xx xxx xx xx"
              maxLength={20}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Lütfen bildiriminizi detaylı bir şekilde açıklayın..."
              className="min-h-[120px]"
              maxLength={1000}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Gönderiliyor..." : "Bildirim Gönder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
