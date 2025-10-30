import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSerperSettings, useUpdateSerperSettings } from "@/hooks/useSerperSettings";
import { Loader2, Key, AlertTriangle, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const SerperSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSerperSettings();
  const updateSettings = useUpdateSerperSettings();
  const [showApiKeyInfo, setShowApiKeyInfo] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);

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

  const fetchAccountInfo = async () => {
    setLoadingAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke('serper-account');
      
      if (error) throw error;
      
      setAccountInfo(data);
      toast({
        title: "Başarılı",
        description: "Hesap bilgileri güncellendi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Hesap bilgileri alınırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoadingAccount(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Serper API Key</CardTitle>
          <CardDescription>
            Google Places API için Serper API anahtarınızı yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Key className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">API Anahtarı Durumu</p>
                <p className="text-xs text-muted-foreground">
                  Serper API anahtarınız güvenli bir şekilde saklanmaktadır
                </p>
              </div>
            </div>

            {accountInfo && (
              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">API Bakiyesi</p>
                  <p className="text-xs text-muted-foreground">
                    Kalan Arama Hakkı: <span className="font-semibold text-primary">{accountInfo.credits || 0}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAccountInfo}
                  disabled={loadingAccount}
                >
                  {loadingAccount ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yenile"
                  )}
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowApiKeyInfo(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                API Key Nasıl Alınır?
              </Button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    API Key Değiştirme
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    API anahtarınızı değiştirmek için lütfen Lovable ekibine başvurun. 
                    Güvenlik nedeniyle API anahtarları doğrudan değiştirilemez.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

    <AlertDialog open={showApiKeyInfo} onOpenChange={setShowApiKeyInfo}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Serper API Key Nasıl Alınır?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>
              1. <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                serper.dev
              </a> adresine gidin
            </p>
            <p>
              2. Ücretsiz bir hesap oluşturun (2,500 ücretsiz arama hakkı)
            </p>
            <p>
              3. Dashboard'dan API anahtarınızı kopyalayın
            </p>
            <p>
              4. Lovable ekibi ile iletişime geçerek API anahtarınızı güvenli bir şekilde ekletin
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowApiKeyInfo(false)}>
            Anladım
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
  );
};