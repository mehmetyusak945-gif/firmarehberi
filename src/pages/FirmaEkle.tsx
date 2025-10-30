import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { AdBox } from "@/components/ads";
import { useCategories } from "@/hooks/useCategories";
import { useUserFirmCount } from "@/hooks/useFirms";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";
import { useNavigate } from "react-router-dom";

const FirmaEkle = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const { data: userFirmCount } = useUserFirmCount(user?.id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    landline_phone: "",
    mobile_phone: "",
    website: "",
    categoryId: "",
    suggested_category: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Firma ismi zorunludur";
    } else if (formData.name.length < 3) {
      newErrors.name = "Firma ismi en az 3 karakter olmalıdır";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Adres zorunludur";
    } else if (formData.address.length < 10) {
      newErrors.address = "Lütfen detaylı adres giriniz";
    }

    if (!formData.landline_phone.trim()) {
      newErrors.landline_phone = "Sabit telefon numarası zorunludur";
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(formData.landline_phone)) {
      newErrors.landline_phone = "Geçerli bir telefon numarası giriniz";
    }

    if (!formData.mobile_phone.trim()) {
      newErrors.mobile_phone = "Mobil telefon numarası zorunludur";
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(formData.mobile_phone)) {
      newErrors.mobile_phone = "Geçerli bir telefon numarası giriniz";
    }

    if (formData.website && !/^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/.test(formData.website)) {
      newErrors.website = "Geçerli bir web sitesi adresi giriniz (örn: example.com)";
    }

    if (!formData.categoryId && !formData.suggested_category.trim()) {
      newErrors.category = "Kategori seçimi veya kategori önerisi zorunludur";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Firma açıklaması zorunludur";
    } else if (formData.description.length < 50) {
      newErrors.description = "Açıklama en az 50 karakter olmalıdır";
    } else if (formData.description.length > 500) {
      newErrors.description = "Açıklama en fazla 500 karakter olabilir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Firma eklemek için giriş yapmalısınız.",
      });
      navigate("/auth");
      return;
    }

    if (userFirmCount && userFirmCount >= 1) {
      toast({
        variant: "destructive",
        title: "Limit Aşıldı",
        description: "Her kullanıcı maksimum 1 firma ekleyebilir.",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Form Hatası",
        description: "Lütfen tüm zorunlu alanları doğru şekilde doldurun.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("firms").insert({
        name: formData.name,
        address: formData.address,
        landline_phone: formData.landline_phone,
        mobile_phone: formData.mobile_phone,
        website: formData.website || null,
        category_id: formData.categoryId || null,
        suggested_category: formData.suggested_category || null,
        description: formData.description,
        slug: slugify(formData.name),
        added_by: user.id,
        is_approved: false, // Normal kullanıcılar için onay beklemeli
      });

      if (error) throw error;

      setIsSuccess(true);
      
      toast({
        title: "Başarılı!",
        description: "Firmanız başarıyla gönderildi. Onaylandıktan sonra yayına alınacaktır.",
      });

      // Form reset
      setFormData({
        name: "",
        address: "",
        landline_phone: "",
        mobile_phone: "",
        website: "",
        categoryId: "",
        suggested_category: "",
        description: "",
      });

      // Success mesajını 5 saniye sonra kaldır
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Firma eklenirken hata oluştu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Eğer kullanıcı zaten firma eklemişse uyarı göster
  if (userFirmCount && userFirmCount >= 1) {
    return (
      <>
        <SEOHead
          title="Firma Ekle - Firma Rehberim"
          description="Firmanızı ücretsiz olarak rehberimize ekleyin."
        />
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Limit Aşıldı</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Her kullanıcı maksimum 1 firma ekleyebilir. Zaten bir firma eklediniz.
              </p>
              <Button onClick={() => navigate("/")} variant="default">
                Ana Sayfaya Dön
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Firma Ekle - Firmam.org"
        description="Firmanızı ücretsiz olarak rehberimize ekleyin. Binlerce potansiyel müşteriye ulaşın. Hızlı onay süreci ile hemen listelenin."
        canonical="https://firmam.org/firma-ekle"
        keywords="firma ekle, işletme ekle, ücretsiz firma kaydı, firma rehberi"
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Başlık */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Firmanızı Ekleyin
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Firmanızı ücretsiz olarak rehberimize ekleyerek binlerce potansiyel müşteriye ulaşın. 
                Formu doldurun, biz onaylayalım ve firmanız hemen yayına geçsin!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                {isSuccess && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-success mb-1">Başarıyla Gönderildi!</h3>
                      <p className="text-sm text-muted-foreground">
                        Firmanız incelemeye alındı. Onaylandıktan sonra yayına alınacaktır.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 md:p-8 shadow-lg space-y-6">
                  {/* Firma İsmi */}
                  <div>
                    <Label htmlFor="name">
                      Firma İsmi <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Örn: Aydınlatma Elektrik"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Adres */}
                  <div>
                    <Label htmlFor="address">
                      Firma Adresi <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Mahalle, Sokak, No, İlçe/İl"
                      rows={3}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Telefon Numaraları */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="landline_phone">
                        Sabit Telefon <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="landline_phone"
                        type="tel"
                        value={formData.landline_phone}
                        onChange={(e) => handleChange("landline_phone", e.target.value)}
                        placeholder="0212 555 01 01"
                        className={errors.landline_phone ? "border-destructive" : ""}
                      />
                      {errors.landline_phone && (
                        <p className="text-sm text-destructive mt-1">{errors.landline_phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: 0XXX XXX XX XX
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="mobile_phone">
                        Mobil Telefon <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="mobile_phone"
                        type="tel"
                        value={formData.mobile_phone}
                        onChange={(e) => handleChange("mobile_phone", e.target.value)}
                        placeholder="0532 123 45 67"
                        className={errors.mobile_phone ? "border-destructive" : ""}
                      />
                      {errors.mobile_phone && (
                        <p className="text-sm text-destructive mt-1">{errors.mobile_phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: 05XX XXX XX XX (WhatsApp için kullanılacak)
                      </p>
                    </div>
                  </div>

                  {/* Web Sitesi */}
                  <div>
                    <Label htmlFor="website">Web Sitesi</Label>
                    <Input
                      id="website"
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="www.firma.com"
                      className={errors.website ? "border-destructive" : ""}
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive mt-1">{errors.website}</p>
                    )}
                  </div>

                  {/* Kategori */}
                  <div>
                    <Label htmlFor="category">
                      Kategori <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive mt-1">{errors.category}</p>
                    )}
                  </div>

                  {/* Kategori Önerisi */}
                  <div>
                    <Label htmlFor="suggested_category">
                      Kategori Önerisi (Kategori listede yoksa)
                    </Label>
                    <Input
                      id="suggested_category"
                      value={formData.suggested_category}
                      onChange={(e) => handleChange("suggested_category", e.target.value)}
                      placeholder="Örn: Cam Balkon"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Eğer firmanızın kategorisi listede yoksa, önerinizi buraya yazabilirsiniz.
                    </p>
                  </div>

                  {/* Açıklama */}
                  <div>
                    <Label htmlFor="description">
                      Firma Açıklaması <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Firmanız hakkında detaylı bilgi verin (min. 50, max. 500 karakter)"
                      rows={6}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.description ? (
                        <p className="text-sm text-destructive">{errors.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {formData.description.length}/500 karakter
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gradient-accent text-accent-foreground hover:opacity-90 transition-base shadow-lg"
                    size="lg"
                  >
                    {isSubmitting ? "Gönderiliyor..." : "Firma Ekle"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    * işaretli alanlar zorunludur. Firmanız incelendikten sonra onaylanacaktır.
                  </p>
                </form>
              </div>

              {/* Sidebar - Reklam */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <AdBox />
                  
                  <div className="bg-card rounded-xl border p-6 shadow-md">
                    <h3 className="font-bold mb-3">Neden Firma Eklemeliyim?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0 mt-0.5" />
                        <span>Binlerce potansiyel müşteriye ulaşın</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0 mt-0.5" />
                        <span>Ücretsiz firma kaydı</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0 mt-0.5" />
                        <span>Hızlı onay süreci</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0 mt-0.5" />
                        <span>SEO dostu firma sayfası</span>
                      </li>
                    </ul>
                  </div>

                  <AdBox />
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FirmaEkle;
