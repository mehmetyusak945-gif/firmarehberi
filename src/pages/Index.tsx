import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FirmaCard } from "@/components/FirmaCard";
import { AdBox, AdLeaderboard } from "@/components/ads";
import { SEOHead } from "@/components/SEOHead";
import { useFirms } from "@/hooks/useFirms";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { data: firms, isLoading: firmsLoading } = useFirms();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === "all") {
      setSelectedCategory("all");
    } else {
      navigate(`/kategori/${categorySlug}`);
    }
  };

  // Filtrelenmiş firmalar
  const filteredFirms = useMemo(() => {
    if (!firms) return [];
    if (selectedCategory === "all") return firms;
    return firms.filter(firma => firma.category_id === selectedCategory);
  }, [firms, selectedCategory]);

  if (firmsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Grid için karışık içerik (firma + reklam) - 16 alan: 12 firma + 4 reklam
  const gridItems = useMemo(() => {
    const items: Array<{ type: "firma" | "ad"; data?: any; id: string }> = [];
    const firmsToShow = filteredFirms.slice(0, 12); // İlk 12 firma
    
    // 16 pozisyon oluştur (4x4 grid)
    const positions = Array.from({ length: 16 }, (_, i) => i);
    
    // Rastgele 4 pozisyon seç reklam için
    const shuffled = [...positions].sort(() => Math.random() - 0.5);
    const adPositions = new Set(shuffled.slice(0, 4));
    
    let firmaIndex = 0;
    let adIndex = 0;
    
    // Her pozisyonu doldur
    positions.forEach((pos) => {
      if (adPositions.has(pos)) {
        // Reklam ekle
        items.push({ 
          type: "ad", 
          id: `ad-${adIndex++}` 
        });
      } else if (firmaIndex < firmsToShow.length) {
        // Firma ekle
        items.push({ 
          type: "firma", 
          data: firmsToShow[firmaIndex], 
          id: firmsToShow[firmaIndex].id 
        });
        firmaIndex++;
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
                    onClick={() => handleCategoryClick("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-base shadow-md ${
                      selectedCategory === "all"
                        ? "gradient-accent text-white"
                        : "bg-white/95 text-foreground hover:bg-white hover:scale-105"
                    }`}
                  >
                    Tümü
                  </button>
                  {categories?.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.slug)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-base shadow-md bg-white/95 text-foreground hover:bg-white hover:scale-105"
                    >
                      {category.name}
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
                  : `${categories?.find(c => c.id === selectedCategory)?.name} Kategorisi`}
              </h2>
              <p className="text-muted-foreground">
                {filteredFirms?.length || 0} firma listeleniyor
              </p>
            </div>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1320px] mx-auto">
              {gridItems.map((item) => (
                item.type === "firma" ? (
                  <FirmaCard key={item.id} firma={item.data} />
                ) : (
                  <div key={item.id} className="flex items-center justify-center">
                    <AdBox />
                  </div>
                )
              ))}
            </div>

            {/* Leaderboard Reklam */}
            <div className="mt-12 flex justify-center">
              <AdLeaderboard />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
