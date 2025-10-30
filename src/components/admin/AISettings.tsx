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
        api_key: (provider === "google" || provider === "openai") ? apiKey : null,
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
          Lovable kullanarak otomatik ödeme yapabilir veya kendi API keyinizi kullanabilirsiniz.
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
              <SelectItem value="google">Google Gemini (Kendi API Key)</SelectItem>
              <SelectItem value="openai">OpenAI ChatGPT (Kendi API Key)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {provider === "lovable" 
              ? "Lovable AI otomatik olarak yapılandırılır ve kullanım bazlı ücretlendirilir."
              : provider === "google"
              ? "Kendi Google API keyinizi kullanarak ödemeleri kendiniz takip edebilirsiniz."
              : "Kendi OpenAI API keyinizi kullanarak ödemeleri kendiniz takip edebilirsiniz."}
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
              ) : provider === "google" ? (
                <>
                  <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
                  <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="gpt-5-2025-08-07">GPT-5 ($5/1M input, $15/1M output)</SelectItem>
                  <SelectItem value="gpt-5-mini-2025-08-07">GPT-5 Mini ($0.40/1M input, $1.20/1M output)</SelectItem>
                  <SelectItem value="gpt-5-nano-2025-08-07">GPT-5 Nano ($0.10/1M input, $0.30/1M output)</SelectItem>
                  <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 ($2.50/1M input, $10/1M output)</SelectItem>
                  <SelectItem value="gpt-4.1-mini-2025-04-14">GPT-4.1 Mini ($0.30/1M input, $1/1M output)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {provider === "openai" 
              ? "Fiyatlar 1 milyon token başına. Nano/Mini modeller daha ucuz, tam modeller daha kaliteli."
              : "Lite modeller daha hızlı ve ucuz, Pro modeller daha kaliteli sonuçlar verir."}
          </p>
        </div>

        {(provider === "google" || provider === "openai") && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              {provider === "google" ? "Google API Key" : "OpenAI API Key"}
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "google" ? "AIza..." : "sk-..."}
            />
            <p className="text-sm text-muted-foreground">
              {provider === "google" 
                ? "Google Cloud Console'dan bir API key oluşturun ve Generative Language API'yi etkinleştirin."
                : "OpenAI Platform'dan bir API key oluşturun. platform.openai.com/api-keys"}
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
