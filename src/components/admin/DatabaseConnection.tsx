import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Download, Upload, Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DatabaseConnection() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Kopyalandı",
        description: "Bilgi panoya kopyalandı",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kopyalama başarısız oldu",
      });
    }
  };

  const exportFullDatabase = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("full-backup", {
        body: {},
      });

      if (error) throw error;

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `postgresql-full-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Başarılı!",
        description: "Tam veritabanı yedeği başarıyla indirildi",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yedek oluşturulurken hata oluştu",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen geçerli bir JSON dosyası seçin",
      });
    }
  };

  const restoreFullDatabase = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen önce bir yedek dosyası seçin",
      });
      return;
    }

    setIsRestoring(true);
    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      const { data, error } = await supabase.functions.invoke("full-restore", {
        body: { backupData },
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Veritabanı başarıyla geri yüklendi. Sayfa yenileniyor...",
      });

      // Reload the page after successful restore
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Geri yükleme sırasında hata oluştu",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Veritabanı Bağlantı Bilgileri
          </CardTitle>
          <CardDescription>
            PostgreSQL veritabanı bağlantı bilgileriniz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Proje ID</Label>
            <div className="flex gap-2">
              <Input value={projectId} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(projectId, "projectId")}
              >
                {copiedField === "projectId" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Veritabanı URL</Label>
            <div className="flex gap-2">
              <Input value={supabaseUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(supabaseUrl, "url")}
              >
                {copiedField === "url" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Anon Key (API Key)</Label>
            <div className="flex gap-2">
              <Input
                value={`${anonKey.substring(0, 20)}...${anonKey.substring(anonKey.length - 10)}`}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(anonKey, "anonKey")}
              >
                {copiedField === "anonKey" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Güvenlik nedeniyle kısaltılmış gösterilmektedir. Tamamını kopyalamak için butona tıklayın.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Full Database Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Tam Veritabanı Yedeği
          </CardTitle>
          <CardDescription>
            Tüm PostgreSQL tablolarının tam yedeğini alın (JSON formatında)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Bu yedek, tüm tabloları içerir: firmalar, kategoriler, reklamlar, ayarlar, mesajlar, sayfalar, kullanıcı rolleri ve daha fazlası.
            </AlertDescription>
          </Alert>

          <Button
            onClick={exportFullDatabase}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yedek Alınıyor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Tam Yedek Al
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Full Database Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Tam Yedeği Geri Yükle
          </CardTitle>
          <CardDescription>
            Daha önce alınmış tam veritabanı yedeğini geri yükleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dikkat:</strong> Bu işlem mevcut tüm verileri silecek ve yedekteki verilerle değiştirecektir. 
              Bu işlem geri alınamaz!
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="backup-file">Yedek Dosyası Seçin (JSON)</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isRestoring}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Seçilen dosya: {selectedFile.name}
              </p>
            )}
          </div>

          <Button
            onClick={restoreFullDatabase}
            disabled={isRestoring || !selectedFile}
            variant="destructive"
            className="w-full"
          >
            {isRestoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Geri Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Yedeği Geri Yükle
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
