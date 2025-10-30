import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
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

export const CategoryMerge = () => {
  const { toast } = useToast();
  const { data: categories, refetch } = useCategories();
  const [sourceCategory, setSourceCategory] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firmCounts, setFirmCounts] = useState<{ source: number; target: number }>({ source: 0, target: 0 });

  const handleCheckMerge = async () => {
    if (!sourceCategory || !targetCategory) {
      toast({
        variant: "destructive",
        title: "Eksik Seçim",
        description: "Lütfen birleştirilecek ve hedef kategorileri seçin.",
      });
      return;
    }

    if (sourceCategory === targetCategory) {
      toast({
        variant: "destructive",
        title: "Geçersiz Seçim",
        description: "Aynı kategoriyi birleştiremezsiniz.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get firm counts
      const { count: sourceCount } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("category_id", sourceCategory);

      const { count: targetCount } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("category_id", targetCategory);

      setFirmCounts({ source: sourceCount || 0, target: targetCount || 0 });
      setShowConfirm(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    setIsLoading(true);
    try {
      // Tüm firmaları kaynak kategoriden hedef kategoriye taşı
      const { error: updateError } = await supabase
        .from("firms")
        .update({ category_id: targetCategory })
        .eq("category_id", sourceCategory);

      if (updateError) throw updateError;

      // Kaynak kategoriyi sil
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", sourceCategory);

      if (deleteError) throw deleteError;

      const sourceName = categories?.find(c => c.id === sourceCategory)?.name;
      const targetName = categories?.find(c => c.id === targetCategory)?.name;

      toast({
        title: "Başarılı!",
        description: `"${sourceName}" kategorisi "${targetName}" ile birleştirildi. ${firmCounts.source} firma taşındı.`,
      });

      setSourceCategory("");
      setTargetCategory("");
      setShowConfirm(false);
      await refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = categories?.map(cat => ({
    value: cat.id,
    label: cat.name,
  })) || [];

  const sourceName = categories?.find(c => c.id === sourceCategory)?.name || "";
  const targetName = categories?.find(c => c.id === targetCategory)?.name || "";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kategori Birleştir</CardTitle>
          <CardDescription>
            İki kategoriyi birleştirin. Birleştirilecek kategorideki tüm firmalar hedef kategoriye taşınır ve kaynak kategori silinir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Birleştirilecek Kategori (Silinecek)</Label>
                <SearchableSelect
                  value={sourceCategory}
                  onValueChange={setSourceCategory}
                  options={categoryOptions.filter(opt => opt.value !== targetCategory)}
                  placeholder="Kategori seçin"
                  searchPlaceholder="Kategori ara..."
                />
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <Label>Hedef Kategori (Kalacak)</Label>
                <SearchableSelect
                  value={targetCategory}
                  onValueChange={setTargetCategory}
                  options={categoryOptions.filter(opt => opt.value !== sourceCategory)}
                  placeholder="Kategori seçin"
                  searchPlaceholder="Kategori ara..."
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleCheckMerge}
                disabled={!sourceCategory || !targetCategory || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kontrol Ediliyor...
                  </>
                ) : (
                  "Birleştir"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategorileri Birleştir</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <span className="font-semibold text-destructive">"{sourceName}"</span> kategorisi{" "}
                <span className="font-semibold text-primary">"{targetName}"</span> kategorisi ile birleştirilecek.
              </p>
              <div className="bg-muted p-3 rounded-md mt-3">
                <p className="text-sm">
                  • <span className="font-semibold">{firmCounts.source} firma</span> "{sourceName}" kategorisinden "{targetName}" kategorisine taşınacak
                </p>
                <p className="text-sm">
                  • Hedef kategoride toplam <span className="font-semibold">{firmCounts.source + firmCounts.target} firma</span> olacak
                </p>
                <p className="text-sm text-destructive">
                  • "{sourceName}" kategorisi kalıcı olarak silinecek
                </p>
              </div>
              <p className="font-semibold mt-3">Bu işlem geri alınamaz. Devam etmek istiyor musunuz?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMerge}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Birleştiriliyor...
                </>
              ) : (
                "Evet, Birleştir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};