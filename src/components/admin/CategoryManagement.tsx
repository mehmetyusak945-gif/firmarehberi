import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Search, CheckCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  firm_count?: number;
}

export const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFixing, setIsFixing] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter((category) => 
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

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

      // Fetch firm counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from("firms")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);
          
          return {
            ...category,
            firm_count: count || 0,
          };
        })
      );

      setCategories(categoriesWithCounts);
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

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: editCategoryName.trim(),
          slug: slugify(editCategoryName.trim()),
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Kategori başarıyla güncellendi.",
      });

      setEditingCategory(null);
      setEditCategoryName("");
      await fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setIsEditing(false);
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

  const handleFixCategories = async () => {
    setIsFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-category-names');

      if (error) throw error;

      if (data?.results) {
        const updated = data.summary.updated;
        const unchanged = data.summary.unchanged;
        const errors = data.summary.errors;

        toast({
          title: "Kontrol Tamamlandı!",
          description: `${updated} kategori güncellendi, ${unchanged} kategori zaten doğruydu${errors > 0 ? `, ${errors} kategoride hata oluştu` : ''}.`,
        });

        // Show details if there were updates
        if (updated > 0) {
          const updatedItems = data.results.filter((r: any) => r.status === "updated");
          console.log("Updated categories:", updatedItems);
        }

        await fetchCategories();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Kategoriler kontrol edilirken bir hata oluştu.",
      });
    } finally {
      setIsFixing(false);
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
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Mevcut Kategoriler ({categories.length})</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleFixCategories}
                disabled={isFixing}
                className="whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isFixing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kontrol Ediliyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Kategorileri Kontrol Et
                  </>
                )}
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kategori ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Arama sonucu bulunamadı." : "Henüz kategori eklenmemiş. Yukarıdaki formdan kategori ekleyebilirsiniz."}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Firma Sayısı</TableHead>
                    <TableHead className="w-[120px]">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-center font-medium">{category.firm_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setEditCategoryName(category.name);
                                }}
                              >
                                <Pencil className="h-4 w-4 text-primary" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Kategoriyi Düzenle</DialogTitle>
                                <DialogDescription>
                                  Kategori adını güncelleyin.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category">Kategori Adı</Label>
                                  <Input
                                    id="edit-category"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    placeholder="Kategori adı"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={handleEditCategory}
                                  disabled={isEditing || !editCategoryName.trim()}
                                >
                                  {isEditing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Güncelleniyor...
                                    </>
                                  ) : (
                                    "Güncelle"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
