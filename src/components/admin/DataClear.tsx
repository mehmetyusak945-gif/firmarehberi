import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DataClear = () => {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Generate random 6-digit verification code
  const [generatedCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const handleClearData = async () => {
    if (verificationCode !== generatedCode) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Doğrulama kodu yanlış. Lütfen tekrar deneyin.",
      });
      return;
    }

    setIsClearing(true);
    try {
      // Delete all firms
      const { error: firmsError } = await supabase
        .from("firms")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (firmsError) throw firmsError;

      // Delete all categories
      const { error: categoriesError } = await supabase
        .from("categories")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (categoriesError) throw categoriesError;

      toast({
        title: "Başarılı!",
        description: "Tüm firmalar ve kategoriler başarıyla temizlendi.",
      });

      setVerificationCode("");
      setIsDialogOpen(false);
      
      // Reload page to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Veriler temizlenirken hata oluştu",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Tehlikeli Bölge - İçeriği Temizle
        </CardTitle>
        <CardDescription>
          Bu işlem tüm firmaları ve kategorileri kalıcı olarak silecektir. Bu işlem geri alınamaz!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-destructive">
                ⚠️ UYARI: Bu İşlem Geri Alınamaz!
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Tüm firmalar silinecek</li>
                <li>• Tüm kategoriler silinecek</li>
                <li>• Bu işlem geri alınamaz</li>
                <li>• İşleme devam etmeden önce mutlaka yedek alın</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Güvenlik Önlemi:</p>
          <p className="text-xs text-muted-foreground">
            İşleme devam etmek için aşağıdaki doğrulama kodunu girmeniz gerekmektedir:
          </p>
          <p className="text-2xl font-mono font-bold text-center my-4 p-3 bg-background rounded border-2 border-primary">
            {generatedCode}
          </p>
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={isClearing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Tüm İçeriği Temizle
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Bu işlem <span className="font-bold text-destructive">TÜM FİRMALARI</span> ve{" "}
                  <span className="font-bold text-destructive">TÜM KATEGORİLERİ</span> kalıcı olarak silecektir.
                </p>
                <p className="text-sm">
                  Devam etmek için lütfen yukarıda gösterilen{" "}
                  <span className="font-mono font-bold">{generatedCode}</span> kodunu girin:
                </p>
                <div className="space-y-2">
                  <Label htmlFor="verification">Doğrulama Kodu</Label>
                  <Input
                    id="verification"
                    type="text"
                    placeholder="6 haneli kodu girin"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="font-mono text-center text-lg"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setVerificationCode("")}>
                İptal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                disabled={isClearing || verificationCode !== generatedCode}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Temizleniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Evet, Tüm İçeriği Sil
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-center text-muted-foreground">
          Bu işlemi yapmadan önce mutlaka "Yedek" sekmesinden tam bir yedek alın.
        </p>
      </CardContent>
    </Card>
  );
};
