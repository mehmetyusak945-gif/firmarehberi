import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Upload, LogOut, Loader2, List, FolderTree, Database, Megaphone, Clock, HardDrive, Mail, FileText, AlertTriangle, Globe } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { slugify } from "@/lib/slugify";
import { FirmList } from "@/components/admin/FirmList";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { AdManagement } from "@/components/admin/AdManagement";
import { PendingFirms } from "@/components/admin/PendingFirms";
import { DatabaseBackup } from "@/components/admin/DatabaseBackup";
import { ContactMessages } from "@/components/admin/ContactMessages";
import { PageManagement } from "@/components/admin/PageManagement";
import { DataClear } from "@/components/admin/DataClear";
import { WebmasterManagement } from "@/components/admin/WebmasterManagement";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFormat, setUploadFormat] = useState<'csv' | 'json'>('csv');
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    address: "",
    landline_phone: "",
    mobile_phone: "",
    website: "",
    email: "",
    description: "",
    external_id: "",
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
      // Generate slug: ID-firma-ismi or just firma-ismi if no ID
      const slug = formData.external_id 
        ? `${formData.external_id}-${slugify(formData.name)}`
        : slugify(formData.name);

      const { error } = await supabase.from("firms").insert({
        name: formData.name,
        category_id: formData.categoryId,
        address: formData.address,
        landline_phone: formData.landline_phone,
        mobile_phone: formData.mobile_phone,
        website: formData.website,
        email: formData.email,
        description: formData.description,
        external_id: formData.external_id || null,
        slug: slug,
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
        landline_phone: "",
        mobile_phone: "",
        website: "",
        email: "",
        description: "",
        external_id: "",
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
      
      let body: any = { format: uploadFormat }
      
      if (uploadFormat === 'json') {
        try {
          const jsonData = JSON.parse(text);
          body.jsonData = Array.isArray(jsonData) ? jsonData : [jsonData];
        } catch (parseError) {
          throw new Error('Geçersiz JSON formatı');
        }
      } else {
        body.csvData = text;
      }

      const { data, error } = await supabase.functions.invoke("upload-firms-excel", {
        body
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
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <Tabs defaultValue="firms" className="w-full">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <TabsList className="grid w-full max-w-5xl grid-cols-3 md:grid-cols-10 gap-2">
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
                <TabsTrigger value="messages" className="text-xs md:text-sm">
                  <Mail className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Mesajlar</span>
                </TabsTrigger>
                <TabsTrigger value="pages" className="text-xs md:text-sm">
                  <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Sayfalar</span>
                </TabsTrigger>
                <TabsTrigger value="upload-excel" className="text-xs md:text-sm">
                  <Upload className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Toplu Firma Ekle</span>
                </TabsTrigger>
                <TabsTrigger value="webmaster" className="text-xs md:text-sm">
                  <Globe className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Webmaster</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Tehlikeli işlemler butonu - Ayrı bir yerde */}
              <div className="flex items-center">
                <TabsList className="h-auto">
                  <TabsTrigger 
                    value="clear-data" 
                    className="text-xs md:text-sm border border-destructive/50 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                  >
                    <AlertTriangle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">İçeriği Temizle</span>
                    <span className="sm:hidden">Temizle</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

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

            <TabsContent value="clear-data">
              <DataClear />
            </TabsContent>

            <TabsContent value="messages">
              <ContactMessages />
            </TabsContent>

            <TabsContent value="pages">
              <PageManagement />
            </TabsContent>

            <TabsContent value="webmaster">
              <WebmasterManagement />
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
                        <SearchableSelect
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                          options={categories?.map((cat) => ({ value: cat.id, label: cat.name })) || []}
                          placeholder="Kategori seçin"
                          searchPlaceholder="Kategori ara..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="external_id">Firma ID (Opsiyonel)</Label>
                        <Input
                          id="external_id"
                          value={formData.external_id}
                          onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
                          placeholder="Google Maps ID veya benzersiz ID"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="landline_phone">Sabit Telefon</Label>
                        <Input
                          id="landline_phone"
                          type="tel"
                          value={formData.landline_phone}
                          onChange={(e) => setFormData({ ...formData, landline_phone: e.target.value })}
                          placeholder="0216 123 45 67"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_phone">Mobil Telefon</Label>
                        <Input
                          id="mobile_phone"
                          type="tel"
                          value={formData.mobile_phone}
                          onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                          placeholder="0532 123 45 67"
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
                  <CardTitle>Toplu Firma Yükleme</CardTitle>
                  <CardDescription>
                    CSV veya JSON formatında toplu firma ekleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 mb-4">
                      <Button
                        type="button"
                        variant={uploadFormat === 'csv' ? 'default' : 'outline'}
                        onClick={() => setUploadFormat('csv')}
                        className="flex-1"
                      >
                        CSV Format
                      </Button>
                      <Button
                        type="button"
                        variant={uploadFormat === 'json' ? 'default' : 'outline'}
                        onClick={() => setUploadFormat('json')}
                        className="flex-1"
                      >
                        JSON Format
                      </Button>
                    </div>

                    {uploadFormat === 'csv' ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">CSV Format Örneği:</p>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`ID;İsim;Adres;Telefon;Website;Puan;Kategori
12345;Örnek Firma;Ankara Cad. No:1;05551234567;https://ornek.com;4.5;Elektrikçi
67890;Test Firma;İstanbul Sok. No:2;05559876543;;3.8;Tesisatçı`}
                        </pre>
                        <p className="text-xs text-muted-foreground">
                          * Noktalı virgül (;) ile ayrılmış olmalı
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">JSON Format Örneği:</p>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`[
  {
    "id": "12345",
    "name": "Örnek Firma",
    "address": "Ankara Cad. No:1",
    "phone": "05551234567",
    "website": "https://ornek.com",
    "rating": 4.5,
    "category": "Elektrikçi"
  },
  {
    "id": "67890",
    "name": "Test Firma",
    "address": "İstanbul Sok. No:2",
    "phone": "05559876543",
    "rating": 3.8,
    "category": "Tesisatçı"
  }
]`}
                        </pre>
                        <p className="text-xs text-muted-foreground">
                          * Türkçe alanlar da desteklenir: isim, adres, telefon, kategori, puan
                        </p>
                      </div>
                    )}

                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <Input
                        type="file"
                        accept={uploadFormat === 'csv' ? '.csv' : '.json'}
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
