import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/slugify";

interface Firm {
  id: string;
  name: string;
  address: string | null;
  landline_phone: string | null;
  mobile_phone: string | null;
  website: string | null;
  description: string | null;
  rating: number | null;
  category_id: string | null;
  suggested_category: string | null;
  slug: string;
}

interface FirmDetailModalProps {
  firm: Firm | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const FirmDetailModal = ({ firm, isOpen, onClose, onUpdate }: FirmDetailModalProps) => {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    landline_phone: "",
    mobile_phone: "",
    website: "",
    description: "",
    rating: "",
    category_id: "",
    suggested_category: "",
    new_category_name: "",
  });

  useEffect(() => {
    if (firm) {
      setFormData({
        name: firm.name || "",
        address: firm.address || "",
        landline_phone: firm.landline_phone || "",
        mobile_phone: firm.mobile_phone || "",
        website: firm.website || "",
        description: firm.description || "",
        rating: firm.rating?.toString() || "",
        category_id: firm.category_id || "",
        suggested_category: firm.suggested_category || "",
        new_category_name: "",
      });
      setIsEditing(false);
    }
  }, [firm]);

  const handleSave = async () => {
    if (!firm) return;

    setIsSaving(true);
    try {
      let finalCategoryId = formData.category_id;

      // Eğer yeni kategori oluşturma seçilmişse
      if (formData.new_category_name.trim()) {
        const categorySlug = slugify(formData.new_category_name.trim());
        
        // Yeni kategoriyi oluştur
        const { data: newCategory, error: categoryError } = await supabase
          .from("categories")
          .insert({
            name: formData.new_category_name.trim(),
            slug: categorySlug,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        finalCategoryId = newCategory.id;

        toast({
          title: "Kategori Oluşturuldu!",
          description: `"${formData.new_category_name}" kategorisi başarıyla oluşturuldu.`,
        });
      }

      const updateData: any = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        landline_phone: formData.landline_phone.trim() || null,
        mobile_phone: formData.mobile_phone.trim() || null,
        website: formData.website.trim() || null,
        description: formData.description.trim() || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        category_id: finalCategoryId,
        suggested_category: null, // Kategori atandıktan sonra öneriyi temizle
        slug: slugify(formData.name.trim()),
      };

      const { error } = await supabase
        .from("firms")
        .update(updateData)
        .eq("id", firm.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Firma bilgileri güncellendi.",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (firm) {
      setFormData({
        name: firm.name || "",
        address: firm.address || "",
        landline_phone: firm.landline_phone || "",
        mobile_phone: firm.mobile_phone || "",
        website: firm.website || "",
        description: firm.description || "",
        rating: firm.rating?.toString() || "",
        category_id: firm.category_id || "",
        suggested_category: firm.suggested_category || "",
        new_category_name: "",
      });
    }
    setIsEditing(false);
  };

  if (!firm) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Firma Detayları</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Firma Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <SearchableSelect
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              options={categories?.map((cat) => ({ value: cat.id, label: cat.name })) || []}
              placeholder="Kategori seçin"
              searchPlaceholder="Kategori ara..."
              disabled={!isEditing}
            />
          </div>

          {/* Kategori Önerisi varsa göster */}
          {formData.suggested_category && (
            <div className="space-y-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <Label className="text-yellow-800 dark:text-yellow-200">
                Kullanıcı Kategori Önerisi
              </Label>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                "{formData.suggested_category}"
              </p>
              {isEditing && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="new_category">Yeni Kategori Olarak Oluştur</Label>
                  <Input
                    id="new_category"
                    value={formData.new_category_name}
                    onChange={(e) => setFormData({ ...formData, new_category_name: e.target.value })}
                    placeholder={formData.suggested_category}
                  />
                  <p className="text-xs text-muted-foreground">
                    Bu alanı doldurursanız yeni bir kategori oluşturulacak ve firma bu kategoriye atanacaktır.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landline_phone">Sabit Telefon</Label>
              <Input
                id="landline_phone"
                value={formData.landline_phone}
                onChange={(e) => setFormData({ ...formData, landline_phone: e.target.value })}
                disabled={!isEditing}
                placeholder="0216 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_phone">Mobil Telefon</Label>
              <Input
                id="mobile_phone"
                value={formData.mobile_phone}
                onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                disabled={!isEditing}
                placeholder="0532 123 45 67"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Puan</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              disabled={!isEditing}
              placeholder="5.0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={!isEditing}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Firma hakkında açıklama..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  Kapat
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Düzenle
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  İptal
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    "Kaydet"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
