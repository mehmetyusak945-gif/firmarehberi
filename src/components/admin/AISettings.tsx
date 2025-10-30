import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAISettings, useUpdateAISettings } from "@/hooks/useAISettings";
import { Loader2, Save } from "lucide-react";

export const AISettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useAISettings();
  const updateSettings = useUpdateAISettings();

  const [provider, setProvider] = useState("lovable");
  const [model, setModel] = useState("google/gemini-2.5-flash-lite");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (settings) {
      setProvider(settings.provider || "lovable");
      setModel(settings.model || "google/gemini-2.5-flash-lite");
      setApiKey(settings.api_key || "");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        provider,
        model,
        api_key: provider === "google" ? apiKey : null,
      });

      toast({
        title: "Başarılı!",
        description: "AI ayarları kaydedildi.",
      });
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast({
        title: "Hata",
        description: "AI ayarları kaydedilemedi.",
        variant: "destructive",
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
    <Card>
      <CardHeader>
        <CardTitle>AI Ayarları</CardTitle>
        <CardDescription>
          Firma açıklamaları ve meta açıklamalar için kullanılacak AI modelini seçin.
          Lovable kullanarak otomatik ödeme yapabilir veya kendi Google API keyinizi kullanabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="provider">AI Sağlayıcı</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Sağlayıcı seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lovable">Lovable AI (Önerilen)</SelectItem>
              <SelectItem value="google">Google (Kendi API Key)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {provider === "lovable" 
              ? "Lovable AI otomatik olarak yapılandırılır ve kullanım bazlı ücretlendirilir."
              : "Kendi Google API keyinizi kullanarak ödemeleri kendiniz takip edebilirsiniz."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Model seçin" />
            </SelectTrigger>
            <SelectContent>
              {provider === "lovable" ? (
                <>
                  <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Hızlı & Ucuz)</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Dengeli)</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (En Güçlü)</SelectItem>
                  <SelectItem value="openai/gpt-5-nano">GPT-5 Nano (Hızlı)</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini (Dengeli)</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5 (En Güçlü)</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
                  <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Lite modeller daha hızlı ve ucuz, Pro modeller daha kaliteli sonuçlar verir.
          </p>
        </div>

        {provider === "google" && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
            />
            <p className="text-sm text-muted-foreground">
              Google Cloud Console'dan bir API key oluşturun ve Generative Language API'yi etkinleştirin.
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full">
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
  );
};
