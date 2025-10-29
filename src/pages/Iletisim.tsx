import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Iletisim = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "İsim zorunludur";
    } else if (formData.name.length < 2) {
      newErrors.name = "İsim en az 2 karakter olmalıdır";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-posta zorunludur";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Konu zorunludur";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Konu en az 5 karakter olmalıdır";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mesaj zorunludur";
    } else if (formData.message.length < 20) {
      newErrors.message = "Mesaj en az 20 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Form Hatası",
        description: "Lütfen tüm alanları doğru şekilde doldurun.",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulated API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Mesajınız Gönderildi!",
        description: "En kısa sürede size geri dönüş yapacağız.",
      });

      // Form reset
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <>
      <SEOHead
        title="İletişim - Firma Rehberim"
        description="Firma Rehberim ile iletişime geçin. Sorularınız, önerileriniz veya şikayetleriniz için bize ulaşın. Hızlı yanıt garantisi."
        canonical="https://firma-rehberim.lovable.app/iletisim"
        keywords="iletişim, firma rehberi iletişim, destek"
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="gradient-secondary py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Bize Ulaşın
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz. 
                Size yardımcı olmaktan mutluluk duyarız!
              </p>
            </div>
          </section>

          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* İletişim Bilgileri */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-card rounded-xl border p-6 shadow-lg">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">E-posta</h3>
                        <a 
                          href="mailto:info@firmarehberim.com" 
                          className="text-sm text-muted-foreground hover:text-primary transition-fast"
                        >
                          info@firmarehberim.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10">
                        <Phone className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Telefon</h3>
                        <a 
                          href="tel:+902125550101" 
                          className="text-sm text-muted-foreground hover:text-primary transition-fast"
                        >
                          0212 555 01 01
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
                        <MapPin className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Adres</h3>
                        <p className="text-sm text-muted-foreground">
                          Atatürk Bulvarı No:123<br />
                          Kadıköy / İstanbul
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Çalışma Saatleri */}
                  <div className="bg-card rounded-xl border p-6 shadow-lg">
                    <h3 className="font-bold mb-4">Çalışma Saatleri</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pazartesi - Cuma</span>
                        <span className="font-medium">09:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cumartesi</span>
                        <span className="font-medium">10:00 - 16:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pazar</span>
                        <span className="font-medium">Kapalı</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* İletişim Formu */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 md:p-8 shadow-lg space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2">Mesaj Gönderin</h2>
                      <p className="text-muted-foreground">
                        Formu doldurarak bize mesaj gönderebilirsiniz
                      </p>
                    </div>

                    {/* Ad Soyad ve E-posta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">
                          Ad Soyad <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Adınız ve soyadınız"
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">
                          E-posta <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="ornek@email.com"
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Konu */}
                    <div>
                      <Label htmlFor="subject">
                        Konu <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        placeholder="Mesajınızın konusu"
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                      )}
                    </div>

                    {/* Mesaj */}
                    <div>
                      <Label htmlFor="message">
                        Mesajınız <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Lütfen mesajınızı buraya yazın..."
                        rows={8}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive mt-1">{errors.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full gradient-primary text-white hover:opacity-90 transition-base shadow-lg"
                      size="lg"
                    >
                      {isSubmitting ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Mesajı Gönder
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      * işaretli alanlar zorunludur
                    </p>
                  </form>
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

export default Iletisim;
