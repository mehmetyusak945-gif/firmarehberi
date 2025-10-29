import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { AdBox, AdLeaderboard } from "@/components/ads";
import { getFirmaBySlug, getRandomFirms } from "@/data/mockFirms";
import { MapPin, Phone, Globe, Star, ArrowLeft, ChevronRight } from "lucide-react";
import { formatPhone } from "@/lib/slugify";
import { useEffect, useState } from "react";

const FirmaDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const firma = slug ? getFirmaBySlug(slug) : undefined;
  const [aiDescription, setAiDescription] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  useEffect(() => {
    // AI ile firma açıklaması oluşturma simülasyonu
    // Gerçek implementasyonda burada Lovable AI çağrısı yapılacak
    if (firma) {
      setIsLoadingAI(true);
      // Simulated AI response
      setTimeout(() => {
        setAiDescription(
          `${firma.name}, ${firma.category} kategorisinde hizmet veren profesyonel bir firmadır. ` +
          `${firma.address} adresinde faaliyet gösteren ${firma.name}, müşteri memnuniyetini ön planda tutarak ` +
          `kaliteli ve güvenilir hizmet sunmaktadır. ${firma.rating} yıldız değerlendirme puanı ile ` +
          `bölgesindeki en beğenilen işletmeler arasında yer almaktadır. Deneyimli kadrosu ve modern ekipmanları ` +
          `ile ${firma.category} alanında ihtiyaç duyduğunuz her türlü hizmeti profesyonel bir şekilde gerçekleştirmektedir. ` +
          `Müşteri odaklı yaklaşımı ve rekabetçi fiyatları ile tercih edilen ${firma.name}, ` +
          `sizlere en iyi hizmeti sunmak için çalışmaktadır.`
        );
        setIsLoadingAI(false);
      }, 1500);
    }
  }, [firma]);

  if (!firma) {
    return (
      <>
        <SEOHead
          title="Firma Bulunamadı - Firma Rehberim"
          description="Aradığınız firma bulunamadı."
        />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Firma Bulunamadı</h1>
            <p className="text-muted-foreground mb-8">
              Aradığınız firma sistemimizde kayıtlı değil.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-base bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Schema.org yapısal veri
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": firma.name,
    "description": firma.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": firma.address
    },
    "telephone": firma.phone,
    "url": firma.website,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": firma.rating,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      <SEOHead
        title={`${firma.name} - ${firma.category} | Firma Rehberim`}
        description={`${firma.name} ${firma.category} hizmeti vermektedir. ${firma.address} adresinde yer alan ${firma.name} için detaylı bilgi ve iletişim.`}
        canonical={`https://firma-rehberim.lovable.app/firma/${firma.slug}`}
        ogType="business.business"
        keywords={`${firma.name}, ${firma.category}, ${firma.address}, firma rehberi`}
        schema={schema}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <nav className="container mx-auto px-4 py-4 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-fast">
                  Ana Sayfa
                </Link>
              </li>
              <ChevronRight className="h-4 w-4" />
              <li>
                <Link to={`/?kategori=${firma.category.toLowerCase()}`} className="hover:text-primary transition-fast">
                  {firma.category}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4" />
              <li className="text-foreground font-medium">{firma.name}</li>
            </ol>
          </nav>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Ana İçerik */}
              <div className="lg:col-span-8">
                {/* Hero Card */}
                <article className="bg-card rounded-xl border overflow-hidden shadow-lg mb-8">
                  {/* Header */}
                  <div className="gradient-primary p-8 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm mb-3">
                          {firma.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                          {firma.name}
                        </h1>
                      </div>
                      <div className="flex items-center space-x-1 bg-accent text-accent-foreground px-3 py-2 rounded-lg shadow-lg">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="text-lg font-bold">{firma.rating}</span>
                      </div>
                    </div>
                    <p className="text-white/90 text-lg">{firma.description}</p>
                  </div>

                  {/* İçerik */}
                  <div className="p-8">
                    {/* AI Generated Description */}
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        Hakkında
                      </h2>
                      {isLoadingAI ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                          <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
                        </div>
                      ) : (
                        <p className="text-muted-foreground leading-relaxed">
                          {aiDescription}
                        </p>
                      )}
                    </section>

                    {/* İletişim Bilgileri & CTA Butonlar */}
                    <section className="space-y-6 mb-8">
                      {/* Telefon */}
                      <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                        <Phone className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Telefon</h3>
                          <p className="text-sm text-muted-foreground mb-3">{formatPhone(firma.phone)}</p>
                          <a 
                            href={`tel:${firma.phone}`}
                            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-success text-white hover:bg-success/90 shadow-md w-full md:w-auto"
                            aria-label={`${firma.name} firmasını ara`}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Hemen Ara
                          </a>
                        </div>
                      </div>

                      {/* Web Sitesi */}
                      <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                        <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Web Sitesi</h3>
                          <p className="text-sm text-muted-foreground mb-3">{firma.website}</p>
                          <a 
                            href={`https://${firma.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md w-full md:w-auto"
                            aria-label={`${firma.name} web sitesini ziyaret et`}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Siteyi Ziyaret Et
                          </a>
                        </div>
                      </div>

                      {/* Adres */}
                      <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Adres</h3>
                          <p className="text-sm text-muted-foreground mb-3">{firma.address}</p>
                          <div className="flex flex-wrap gap-2">
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(firma.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md"
                              aria-label="Google Maps'te aç"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Google Maps
                            </a>
                            <a 
                              href={`https://yandex.com.tr/maps/?text=${encodeURIComponent(firma.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md"
                              aria-label="Yandex Maps'te aç"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Yandex Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Reklam Alanı */}
                    <div className="flex justify-center my-8">
                      <AdBox />
                    </div>
                  </div>
                </article>

                {/* Reklam Alanı */}
                <section className="mb-8">
                  <div className="flex justify-center">
                    <AdBox />
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Reklam Alanı 2 */}
                <div className="sticky top-20 space-y-6">
                  <AdBox />
                  
                  {/* CTA Card - 300x250 */}
                  <div className="bg-card rounded-xl border shadow-md w-[300px] h-[250px] flex flex-col p-4">
                    <h3 className="font-bold text-base mb-2">Firmanızı Ekleyin</h3>
                    <p className="text-xs text-muted-foreground mb-4 flex-1">
                      Siz de firmanızı rehberimize ekleyerek binlerce potansiyel müşteriye ulaşın!
                    </p>
                    <Link
                      to="/firma-ekle"
                      className="inline-flex items-center justify-center w-full rounded-lg px-4 py-2 text-sm font-medium transition-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                    >
                      Ücretsiz Firma Ekle
                    </Link>
                  </div>

                  <AdBox />
                </div>
              </aside>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FirmaDetail;
