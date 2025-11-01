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
import { Building2, Upload, LogOut, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { slugify } from "@/lib/slugify";
import { FirmList } from "@/components/admin/FirmList";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { CategoryMerge } from "@/components/admin/CategoryMerge";
import { AdManagement } from "@/components/admin/AdManagement";
import { PendingFirms } from "@/components/admin/PendingFirms";
import { DatabaseBackup } from "@/components/admin/DatabaseBackup";
import { DatabaseConnection } from "@/components/admin/DatabaseConnection";
import { ContactMessages } from "@/components/admin/ContactMessages";
import { PageManagement } from "@/components/admin/PageManagement";
import { DataClear } from "@/components/admin/DataClear";
import { FirmReports } from "@/components/admin/FirmReports";
import { WebmasterManagement } from "@/components/admin/WebmasterManagement";
import { AISettings } from "@/components/admin/AISettings";
import { SerperSettings } from "@/components/admin/SerperSettings";
import { SerperSearch } from "@/components/admin/SerperSearch";
import { Dashboard } from "@/components/admin/Dashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  
  const [activeTab, setActiveTab] = useState("dashboard");
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

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 flex flex-col">
            <header className="border-b sticky top-0 bg-background z-10">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold flex items-center">
                    <Building2 className="mr-2" />
                    Yönetim Paneli
                  </h1>
                </div>
                <Button onClick={handleLogout} variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "firms" && <FirmList />}
              {activeTab === "pending" && <PendingFirms />}
              {activeTab === "categories" && <CategoryManagement />}
              {activeTab === "category-merge" && <CategoryMerge />}
              {activeTab === "ads" && <AdManagement />}
              {activeTab === "backup" && <DatabaseBackup />}
              {activeTab === "db-connection" && <DatabaseConnection />}
              {activeTab === "clear-data" && <DataClear />}
              {activeTab === "messages" && <ContactMessages />}
              {activeTab === "firm-reports" && <FirmReports />}
              {activeTab === "pages" && <PageManagement />}
              {activeTab === "webmaster" && <WebmasterManagement />}
              {activeTab === "ai-settings" && <AISettings />}
              {activeTab === "serper-settings" && <SerperSettings />}
              {activeTab === "serper-search" && <SerperSearch />}
              
              {activeTab === "add-firm" && (
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
              )}

              {activeTab === "upload-excel" && (
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
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Admin;
