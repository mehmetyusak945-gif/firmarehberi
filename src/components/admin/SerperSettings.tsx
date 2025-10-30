import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSerperSettings, useUpdateSerperSettings } from "@/hooks/useSerperSettings";
import { Loader2 } from "lucide-react";

export const SerperSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSerperSettings();
  const updateSettings = useUpdateSerperSettings();

  const [formData, setFormData] = useState({
    gl: "tr",
    hl: "tr",
    location: "Turkey",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        gl: settings.gl,
        hl: settings.hl,
        location: settings.location,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: "Başarılı",
        description: "Serper API ayarları güncellendi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Serper API Ayarları</CardTitle>
        <CardDescription>
          Google Places arama için varsayılan parametreleri yapılandırın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gl">Ülke Kodu (gl)</Label>
            <Input
              id="gl"
              value={formData.gl}
              onChange={(e) => setFormData({ ...formData, gl: e.target.value })}
              placeholder="tr"
            />
            <p className="text-sm text-muted-foreground">
              Google arama ülke kodu (örn: tr, us, de)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hl">Dil Kodu (hl)</Label>
            <Input
              id="hl"
              value={formData.hl}
              onChange={(e) => setFormData({ ...formData, hl: e.target.value })}
              placeholder="tr"
            />
            <p className="text-sm text-muted-foreground">
              Arayüz dil kodu (örn: tr, en, de)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Varsayılan Konum</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Turkey"
            />
            <p className="text-sm text-muted-foreground">
              Varsayılan arama konumu (örn: Turkey, Istanbul, Ankara)
            </p>
          </div>

          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};