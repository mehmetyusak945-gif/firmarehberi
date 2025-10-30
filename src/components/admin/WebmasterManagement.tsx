import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Globe } from "lucide-react";
import { useWebmasterSettings, useUpdateWebmasterSettings } from "@/hooks/useWebmasterSettings";

export const WebmasterManagement = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useWebmasterSettings();
  const updateSettings = useUpdateWebmasterSettings();

  const [formData, setFormData] = useState({
    google_search_console_meta: "",
    yandex_webmaster_meta: "",
    bing_webmaster_meta: "",
    google_analytics_code: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        google_search_console_meta: settings.google_search_console_meta || "",
        yandex_webmaster_meta: settings.yandex_webmaster_meta || "",
        bing_webmaster_meta: settings.bing_webmaster_meta || "",
        google_analytics_code: settings.google_analytics_code || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: "Başarılı!",
        description: "Webmaster ayarları güncellendi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken hata oluştu",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Webmaster Araçları
          </CardTitle>
          <CardDescription>
            Arama motorları için doğrulama kodlarını ve analitik kodlarını buradan yönetin.
            Kodları ekledikten sonra kaydedin ve sitenizin &lt;head&gt; etiketine otomatik olarak eklenecektir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Search Console */}
          <div className="space-y-2">
            <Label htmlFor="google_search_console">
              Google Search Console Doğrulama Meta Etiketi
            </Label>
            <Textarea
              id="google_search_console"
              value={formData.google_search_console_meta}
              onChange={(e) =>
                setFormData({ ...formData, google_search_console_meta: e.target.value })
              }
              placeholder='<meta name="google-site-verification" content="your-verification-code" />'
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Google Search Console'dan aldığınız meta doğrulama etiketini buraya yapıştırın.
            </p>
          </div>

          {/* Yandex Webmaster */}
          <div className="space-y-2">
            <Label htmlFor="yandex_webmaster">
              Yandex Webmaster Doğrulama Meta Etiketi
            </Label>
            <Textarea
              id="yandex_webmaster"
              value={formData.yandex_webmaster_meta}
              onChange={(e) =>
                setFormData({ ...formData, yandex_webmaster_meta: e.target.value })
              }
              placeholder='<meta name="yandex-verification" content="your-verification-code" />'
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Yandex Webmaster'dan aldığınız meta doğrulama etiketini buraya yapıştırın.
            </p>
          </div>

          {/* Bing Webmaster */}
          <div className="space-y-2">
            <Label htmlFor="bing_webmaster">
              Bing Webmaster Doğrulama Meta Etiketi
            </Label>
            <Textarea
              id="bing_webmaster"
              value={formData.bing_webmaster_meta}
              onChange={(e) =>
                setFormData({ ...formData, bing_webmaster_meta: e.target.value })
              }
              placeholder='<meta name="msvalidate.01" content="your-verification-code" />'
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Bing Webmaster Tools'dan aldığınız meta doğrulama etiketini buraya yapıştırın.
            </p>
          </div>

          {/* Google Analytics */}
          <div className="space-y-2">
            <Label htmlFor="google_analytics">
              Google Analytics Kodu
            </Label>
            <Textarea
              id="google_analytics"
              value={formData.google_analytics_code}
              onChange={(e) =>
                setFormData({ ...formData, google_analytics_code: e.target.value })
              }
              placeholder={`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Google Analytics'ten aldığınız tracking kodunu buraya yapıştırın.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="w-full"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
