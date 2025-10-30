import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const PageManagement = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    meta_description: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
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

  const togglePublished = async (pageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("pages")
        .update({ is_published: !currentStatus })
        .eq("id", pageId);

      if (error) throw error;

      setPages((prev) =>
        prev.map((page) =>
          page.id === pageId ? { ...page, is_published: !currentStatus } : page
        )
      );

      toast({
        title: "Başarılı!",
        description: "Sayfa durumu güncellendi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      meta_description: page.meta_description || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    try {
      const { error } = await supabase
        .from("pages")
        .update({
          title: formData.title,
          content: formData.content,
          meta_description: formData.meta_description,
        })
        .eq("id", selectedPage.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Sayfa güncellendi.",
      });

      fetchPages();
      setIsModalOpen(false);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sayfa Yönetimi ({pages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Yayında</TableHead>
                  <TableHead className="w-[100px]">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Sayfa bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>/{page.slug}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={page.is_published}
                            onCheckedChange={() => togglePublished(page.id, page.is_published)}
                          />
                          <span className="text-sm">
                            {page.is_published ? "Yayında" : "Taslak"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(page)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sayfa Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Açıklama</Label>
              <Input
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                placeholder="SEO için sayfa açıklaması"
              />
            </div>
            <div>
              <Label>İçerik</Label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSave}>Kaydet</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};