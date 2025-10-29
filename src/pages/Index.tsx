import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FirmaCard } from "@/components/FirmaCard";
import { AdBanner } from "@/components/AdBanner";
import { SEOHead } from "@/components/SEOHead";
import { mockFirms, categories } from "@/data/mockFirms";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filtrelenmiş firmalar
  const filteredFirms = useMemo(() => {
    if (selectedCategory === "all") return mockFirms;
    return mockFirms.filter(firma => firma.category === selectedCategory);
  }, [selectedCategory]);

  // Grid için karışık içerik (firma + reklam)
  const gridItems = useMemo(() => {
    const items: Array<{ type: "firma" | "ad"; data?: any; adSize?: any; id: string }> = [];
    const firmsToShow = filteredFirms.slice(0, 20); // İlk 20 firma
    
    // Her 4 içerikten birini reklam yap
    firmsToShow.forEach((firma, index) => {
      items.push({ type: "firma", data: firma, id: firma.id });
      
      // Her 4 firmadan sonra reklam ekle (yaklaşık %25 reklam oranı)
      if ((index + 1) % 4 === 0 && items.length < 24) {
        const adSizes = ["small", "medium", "rectangle", "small"];
        const adSize = adSizes[Math.floor(Math.random() * adSizes.length)];
        items.push({ 
          type: "ad", 
          adSize: adSize as any,
          id: `ad-${index}` 
        });
      }
    });

    return items;
  }, [filteredFirms]);

  // Schema.org yapısal veri
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Firma Rehberim",
    "description": "Türkiye'nin en kapsamlı firma ve işletme rehberi. Güvenilir firmaları keşfedin.",
    "url": "https://firma-rehberim.lovable.app"
  };

  return (
    <>
      <SEOHead
        title="Firma Rehberim - Türkiye'nin En Kapsamlı Firma Rehberi"
        description="Elektrikçi, restoran, tesisatçı ve daha fazlası! Türkiye'nin güvenilir firma rehberinde aradığınız hizmeti kolayca bulun. 60+ onaylı işletme."
        canonical="https://firma-rehberim.lovable.app/"
        keywords="firma rehberi, işletme rehberi, elektrikçi, restoran, tesisatçı, lokanta, çeşmeci, sıhhi tesisat, türkiye firmaları"
        schema={schema}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="gradient-primary py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                Türkiye'nin Firma Rehberi
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Aradığınız hizmeti sunan güvenilir firmaları kolayca bulun. 
                Elektrikçiden restorana, tesisatçıdan çeşmeciye kadar her şey burada!
              </p>

              {/* Kategori Pills */}
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 flex-wrap px-4">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-base shadow-md ${
                      selectedCategory === "all"
                        ? "gradient-accent text-white"
                        : "bg-white/95 text-foreground hover:bg-white hover:scale-105"
                    }`}
                  >
                    Tümü
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-base shadow-md ${
                        selectedCategory === category
                          ? "gradient-accent text-white"
                          : "bg-white/95 text-foreground hover:bg-white hover:scale-105"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Firma Grid */}
          <section className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {selectedCategory === "all" 
                  ? "Öne Çıkan Firmalar" 
                  : `${selectedCategory} Kategorisi`}
              </h2>
              <p className="text-muted-foreground">
                {filteredFirms.length} firma listeleniyor
              </p>
            </div>

            {/* Masonry Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gridItems.map((item) => (
                item.type === "firma" ? (
                  <FirmaCard key={item.id} firma={item.data} />
                ) : (
                  <div key={item.id} className="flex items-center justify-center">
                    <AdBanner size={item.adSize} />
                  </div>
                )
              ))}
            </div>

            {/* Leaderboard Reklam */}
            {filteredFirms.length > 12 && (
              <div className="mt-12 flex justify-center">
                <AdBanner size="leaderboard" />
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
