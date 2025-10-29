import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FirmaCard } from "@/components/FirmaCard";
import { AdBox, AdLeaderboard } from "@/components/ads";
import { SEOHead } from "@/components/SEOHead";
import { Pagination } from "@/components/Pagination";
import { mockFirms, categories, type Category as CategoryType } from "@/data/mockFirms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "random" | "newest" | "oldest" | "highest" | "lowest";

const ITEMS_PER_PAGE = 12;

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  // Kategoriyi doğrula
  const validCategory = categories.find(
    (c) => c.toLowerCase().replace(/\s+/g, "-") === category
  );

  if (!validCategory) {
    navigate("/404");
    return null;
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("random");

  // Kategoriye göre firmaları filtrele
  const categoryFirms = useMemo(() => {
    return mockFirms.filter((firma) => firma.category === validCategory);
  }, [validCategory]);

  // Sıralama
  const sortedFirms = useMemo(() => {
    const firms = [...categoryFirms];

    switch (sortOption) {
      case "newest":
        return firms.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return firms.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "highest":
        return firms.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return firms.sort((a, b) => a.rating - b.rating);
      case "random":
      default:
        return firms.sort(() => Math.random() - 0.5);
    }
  }, [categoryFirms, sortOption]);

  // Sayfalama
  const totalPages = Math.ceil(sortedFirms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFirms = sortedFirms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Grid için karışık içerik (firma + reklam) - 16 alan: 12 firma + 4 reklam
  const gridItems = useMemo(() => {
    const items: Array<{ type: "firma" | "ad"; data?: any; id: string }> = [];
    const firmsToShow = paginatedFirms;
    
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
        items.push({ 
          type: "ad", 
          id: `ad-${adIndex++}` 
        });
      } else if (firmaIndex < firmsToShow.length) {
        items.push({ 
          type: "firma", 
          data: firmsToShow[firmaIndex], 
          id: firmsToShow[firmaIndex].id 
        });
        firmaIndex++;
      }
    });

    return items;
  }, [paginatedFirms]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Schema.org yapısal veri
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${validCategory} Firmaları - Firma Rehberim`,
    "description": `${validCategory} kategorisinde güvenilir firmalar. ${categoryFirms.length} onaylı işletme.`,
    "url": `https://firma-rehberim.lovable.app/kategori/${category}`
  };

  return (
    <>
      <SEOHead
        title={`${validCategory} Firmaları - Firma Rehberim`}
        description={`${validCategory} kategorisinde güvenilir ve kaliteli firmalar. ${categoryFirms.length} onaylı işletme arasından seçim yapın.`}
        canonical={`https://firma-rehberim.lovable.app/kategori/${category}`}
        keywords={`${validCategory}, ${validCategory.toLowerCase()} firmaları, güvenilir ${validCategory.toLowerCase()}, firma rehberi`}
        schema={schema}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="gradient-primary py-16 md:py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
                {validCategory} Firmaları
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Güvenilir ve kaliteli {validCategory.toLowerCase()} hizmeti veren firmalar
              </p>
            </div>
          </section>

          {/* Sıralama ve Firma Grid */}
          <section className="container mx-auto px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {validCategory} Kategorisi
                </h2>
                <p className="text-muted-foreground">
                  {sortedFirms.length} firma listeleniyor
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Sırala:</label>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Rastgele</SelectItem>
                    <SelectItem value="newest">En Yeniler</SelectItem>
                    <SelectItem value="oldest">En Eskiler</SelectItem>
                    <SelectItem value="highest">En Yüksek Puanlı</SelectItem>
                    <SelectItem value="lowest">En Düşük Puanlı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 4x4 Grid Layout - 300x250px cards */}
            <div className="grid grid-cols-4 gap-6 max-w-[1320px] mx-auto">
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

            {/* Sayfalama */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

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

export default Category;
