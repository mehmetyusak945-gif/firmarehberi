import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/slugify";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    try {
      const { error } = await supabase.from("categories").insert({
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName.trim()),
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Kategori başarıyla eklendi.",
      });

      setNewCategoryName("");
      await fetchCategories();
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

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `"${categoryName}" kategorisi silindi.`,
      });

      await fetchCategories();
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
      {/* Add Category Form */}
      <Card>
        <CardHeader>
          <CardTitle>Yeni Kategori Ekle</CardTitle>
          <CardDescription>
            Firma eklerken kullanılacak kategori oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="categoryName">Kategori Adı</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Örn: Restoran, Oto Servis, Kuaför"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Ekle
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Kategoriler ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz kategori eklenmemiş. Yukarıdaki formdan kategori ekleyebilirsiniz.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-[100px]">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{category.name}" kategorisini silmek istediğinizden emin misiniz?
                                Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
