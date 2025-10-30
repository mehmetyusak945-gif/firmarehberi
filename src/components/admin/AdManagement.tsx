import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

interface AdCode {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export const AdManagement = () => {
  const { toast } = useToast();
  const [adCodes, setAdCodes] = useState<AdCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "" });

  useEffect(() => {
    fetchAdCodes();
  }, []);

  const fetchAdCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("ad_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdCodes(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (adCodes.length >= 5) {
      toast({
        variant: "destructive",
        title: "Limit Aşıldı",
        description: "En fazla 5 reklam kodu ekleyebilirsiniz.",
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase.from("ad_codes").insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Reklam kodu başarıyla eklendi.",
      });

      setFormData({ name: "", code: "" });
      await fetchAdCodes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("ad_codes")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `Reklam kodu ${!currentStatus ? "aktif" : "pasif"} edildi.`,
      });

      await fetchAdCodes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const handleDeleteAdCode = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("ad_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `"${name}" reklam kodu silindi.`,
      });

      await fetchAdCodes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Add Ad Code Form */}
      <Card>
        <CardHeader>
          <CardTitle>Yeni Reklam Kodu Ekle</CardTitle>
          <CardDescription>
            Sitede gösterilecek reklam kodunu ekleyin. En fazla 5 adet reklam kodu ekleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adName">Reklam Adı</Label>
              <Input
                id="adName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Google AdSense 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adCode">Reklam Kodu (HTML/Script)</Label>
              <Textarea
                id="adCode"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Reklam HTML kodunu veya script'ini buraya yapıştırın..."
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={isAdding || adCodes.length >= 5}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Reklam Ekle ({adCodes.length}/5)
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ad Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Reklam Kodları ({adCodes.length}/5)</CardTitle>
          <CardDescription>
            Tüm sitedeki reklam alanlarında bu kodlar rastgele gösterilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz reklam kodu eklenmemiş. Yukarıdaki formdan reklam kodu ekleyebilirsiniz.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="w-[120px]">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adCodes.map((adCode) => (
                    <TableRow key={adCode.id}>
                      <TableCell className="font-medium">{adCode.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={adCode.is_active}
                            onCheckedChange={() => handleToggleActive(adCode.id, adCode.is_active)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {adCode.is_active ? "Aktif" : "Pasif"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reklam Kodunu Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{adCode.name}" reklam kodunu silmek istediğinizden emin misiniz?
                                  Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAdCode(adCode.id, adCode.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
