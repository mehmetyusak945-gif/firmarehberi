import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Database, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DatabaseBackup = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      // Fetch all data from tables
      const [firmsRes, categoriesRes, adCodesRes] = await Promise.all([
        supabase.from("firms").select("*"),
        supabase.from("categories").select("*"),
        supabase.from("ad_codes").select("*"),
      ]);

      if (firmsRes.error) throw firmsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (adCodesRes.error) throw adCodesRes.error;

      const backupData = {
        backup_date: new Date().toISOString(),
        version: "1.0",
        data: {
          firms: firmsRes.data,
          categories: categoriesRes.data,
          ad_codes: adCodesRes.data,
        },
        stats: {
          total_firms: firmsRes.data?.length || 0,
          total_categories: categoriesRes.data?.length || 0,
          total_ad_codes: adCodesRes.data?.length || 0,
        },
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `firmam-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Başarılı!",
        description: "Veritabanı yedeği başarıyla indirildi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yedek alınırken hata oluştu",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen geçerli bir JSON dosyası seçin.",
      });
    }
  };

  const restoreFromJSON = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir yedek dosyası seçin.",
      });
      return;
    }

    setIsRestoring(true);
    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      if (!backupData.data) {
        throw new Error("Geçersiz yedek dosyası formatı");
      }

      // Call edge function to restore backup (uses service role key to bypass RLS)
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/restore-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ backupData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Yedek geri yüklenirken bir hata oluştu');
      }

      toast({
        title: "Başarılı!",
        description: "Veritabanı yedeği başarıyla geri yüklendi.",
      });

      setSelectedFile(null);
      
      // Reload page to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yedek geri yüklenirken hata oluştu",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Veritabanı Yedeği Al
          </CardTitle>
          <CardDescription>
            Tüm veritabanını JSON formatında yedekleyin. Firmalar, kategoriler ve reklam kodları dahil edilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Yedek İçeriği:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tüm firmalar ve detayları</li>
              <li>• Kategoriler</li>
              <li>• Reklam kodları</li>
              <li>• Yedekleme tarihi ve istatistikler</li>
            </ul>
          </div>

          <Button
            onClick={exportToJSON}
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yedek Alınıyor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Veritabanını Yedekle (JSON)
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Yedeğinizi düzenli aralıklarla alarak verilerinizi güvende tutun.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Yedeği Geri Yükle
          </CardTitle>
          <CardDescription>
            Daha önce aldığınız yedek dosyasını geri yükleyin. Mevcut veriler silinecektir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium">⚠️ Uyarı</p>
            <p className="text-xs text-muted-foreground mt-1">
              Yedek geri yükleme işlemi mevcut tüm verileri silecek ve yedek dosyasındaki verilerle değiştirecektir. Bu işlem geri alınamaz.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-file">Yedek Dosyası Seç (JSON)</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isRestoring}
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                Seçili dosya: {selectedFile.name}
              </p>
            )}
          </div>

          <Button
            onClick={restoreFromJSON}
            disabled={isRestoring || !selectedFile}
            className="w-full"
            size="lg"
            variant="destructive"
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
};
