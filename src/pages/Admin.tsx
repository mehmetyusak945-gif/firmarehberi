import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Upload, LogOut, Loader2, List, FolderTree, Database, Megaphone, Clock, HardDrive } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { slugify } from "@/lib/slugify";
import { FirmList } from "@/components/admin/FirmList";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { AdManagement } from "@/components/admin/AdManagement";
import { PendingFirms } from "@/components/admin/PendingFirms";
import { DatabaseBackup } from "@/components/admin/DatabaseBackup";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    address: "",
    phone: "",
    website: "",
    email: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, loading, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("firms").insert({
        name: formData.name,
        category_id: formData.categoryId,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        email: formData.email,
        description: formData.description,
        slug: slugify(formData.name),
        added_by: user?.id,
        is_approved: true,
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Firma başarıyla eklendi.",
      });

      setFormData({
        name: "",
        categoryId: "",
        address: "",
        phone: "",
        website: "",
        email: "",
        description: "",
      });
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

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();

      const { data, error } = await supabase.functions.invoke("upload-firms-excel", {
        body: { 
          csvData: text
        },
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `${data.count} firma başarıyla yüklendi.`,
      });

      // Reset file input
      e.target.value = "";
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Dosya yüklenirken hata oluştu",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Yönetim Paneli - Firma Rehberim"
        description="Firma yönetim paneli"
      />

      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <Building2 className="mr-2" />
              Yönetim Paneli
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open('https://lovable.dev/projects/d11a00a7-84c9-46c6-9f4f-f3a0cc32a34b/backend', '_blank')}
                variant="outline"
              >
                <Database className="mr-2 h-4 w-4" />
                Backend'i Aç
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs defaultValue="firms" className="w-full">
            <TabsList className="grid w-full max-w-5xl grid-cols-3 md:grid-cols-7 gap-2">
              <TabsTrigger value="firms" className="text-xs md:text-sm">
                <List className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Firmalar</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs md:text-sm">
                <Clock className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Bekleyenler</span>
              </TabsTrigger>
              <TabsTrigger value="add-firm" className="text-xs md:text-sm">
                <Building2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Firma Ekle</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs md:text-sm">
                <FolderTree className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Kategoriler</span>
              </TabsTrigger>
              <TabsTrigger value="ads" className="text-xs md:text-sm">
                <Megaphone className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Reklamlar</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="text-xs md:text-sm">
                <HardDrive className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Yedek</span>
              </TabsTrigger>
              <TabsTrigger value="upload-excel" className="text-xs md:text-sm">
                <Upload className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Toplu Firma Ekle</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="firms">
              <FirmList />
            </TabsContent>

            <TabsContent value="pending">
              <PendingFirms />
            </TabsContent>

            <TabsContent value="categories">
              <CategoryManagement />
            </TabsContent>

            <TabsContent value="ads">
              <AdManagement />
            </TabsContent>

            <TabsContent value="backup">
              <DatabaseBackup />
            </TabsContent>

            <TabsContent value="add-firm">
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Firma Ekle</CardTitle>
                  <CardDescription>
                    Firma bilgilerini girin ve ekleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddFirm} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Firma Adı *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Kategori *</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Web Sitesi</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="www.firma.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Firma hakkında açıklama..."
                      />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        "Firma Ekle"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload-excel">
              <Card>
                <CardHeader>
                  <CardTitle>CSV ile Toplu Yükleme</CardTitle>
                  <CardDescription>
                    CSV dosyanızda şu sütunlar olmalı: ID;İsim;Adres;Telefon;Website;Puan;Kategori
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleExcelUpload}
                        disabled={isUploading}
                        className="max-w-xs mx-auto cursor-pointer"
                      />
                      {isUploading && (
                        <div className="mt-4 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <p className="text-sm text-muted-foreground">
                            Yükleniyor...
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      * CSV dosyası noktalı virgül (;) ile ayrılmış olmalıdır.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
