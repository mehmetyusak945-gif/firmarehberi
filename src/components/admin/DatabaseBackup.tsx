import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Database } from "lucide-react";

export const DatabaseBackup = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Veritabanı Yedeği
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
  );
};
