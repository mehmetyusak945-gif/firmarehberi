import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Upload, Plus } from "lucide-react";
import { categories } from "@/data/mockFirms";
import { slugify } from "@/lib/slugify";
import { SEOHead } from "@/components/SEOHead";

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const generateAIDescription = async (firmName: string, firmCategory: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-firm-description", {
        body: { name: firmName, category: firmCategory },
      });

      if (error) throw error;
      return data.description;
    } catch (error: any) {
      console.error("AI açıklama hatası:", error);
      return "";
    }
  };

  const handleAddFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      let finalDescription = description;
      
      if (!finalDescription || finalDescription.trim() === "") {
        toast.info("AI ile açıklama oluşturuluyor...");
        finalDescription = await generateAIDescription(name, category);
      }

      const slug = slugify(name);
      const createdAt = customDate ? new Date(customDate).toISOString() : new Date().toISOString();

      const { error } = await supabase.from("firms").insert({
        name,
        category,
        address,
        phone,
        website,
        email,
        description: finalDescription,
        slug,
        added_by: user.id,
        is_approved: isAdmin,
        created_at: createdAt,
      });

      if (error) throw error;

      toast.success("Firma başarıyla eklendi!");
      
      // Reset form
      setName("");
      setCategory("");
      setAddress("");
      setPhone("");
      setWebsite("");
      setEmail("");
      setDescription("");
      setCustomDate("");
    } catch (error: any) {
      toast.error(error.message || "Firma eklenirken hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingExcel(true);
    try {
      const text = await file.text();

      const { data: result, error } = await supabase.functions.invoke("upload-firms-excel", {
        body: { 
          fileContent: text, 
          userId: user.id,
          isAdmin 
        },
      });

      if (error) throw error;

      toast.success(`${result.count} firma başarıyla yüklendi!`);
    } catch (error: any) {
      toast.error(error.message || "Dosya yüklenirken hata oluştu");
    } finally {
      setUploadingExcel(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <>
      <SEOHead 
        title="Yönetim Paneli - Firma Rehberi"
        description="Firma rehberi yönetim paneli"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="add-firm">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="add-firm">
                <Plus className="w-4 h-4 mr-2" />
                Firma Ekle
              </TabsTrigger>
              <TabsTrigger value="upload-excel">
                <Upload className="w-4 h-4 mr-2" />
                CSV Yükle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add-firm">
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Firma Ekle</CardTitle>
                  <CardDescription>
                    Firma bilgilerini girin. Açıklama boş bırakılırsa AI otomatik oluşturacak.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddFirm} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Firma Adı *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Kategori *</Label>
                        <Select value={category} onValueChange={setCategory} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Web Sitesi</Label>
                        <Input
                          id="website"
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-date">Eklenme Tarihi (Özel)</Label>
                        <Input
                          id="custom-date"
                          type="datetime-local"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Açıklama (Boş bırakılırsa AI oluşturacak)
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="AI otomatik açıklama oluşturacak..."
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? "Ekleniyor..." : "Firma Ekle"}
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
                    CSV dosyanızda şu sütunlar olmalı: name, category, address, phone, website, email, created_at (opsiyonel)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleExcelUpload}
                        disabled={uploadingExcel}
                        className="max-w-xs mx-auto"
                      />
                      {uploadingExcel && (
                        <p className="mt-4 text-sm text-muted-foreground">
                          Yükleniyor ve AI açıklamaları oluşturuluyor...
                        </p>
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
}
