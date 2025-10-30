import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FirmaCard } from "@/components/FirmaCard";
import { AdBox } from "@/components/ads";
import { SEOHead } from "@/components/SEOHead";
import { Pagination } from "@/components/Pagination";
import { useFirms } from "@/hooks/useFirms";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";
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
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Kategoriyi doğrula
  const validCategory = categories?.find(
    (c) => c.slug === category
  );

  const { data: firms, isLoading: firmsLoading, error: firmsError } = useFirms(validCategory?.id);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("random");
  const [randomSeed, setRandomSeed] = useState(Math.random());

  // Kategoriye göre firmaları filtrele
  const categoryFirms = useMemo(() => {
    return firms || [];
  }, [firms]);

  // Sıralama
  const sortedFirms = useMemo(() => {
    const firmsList = [...categoryFirms];

    switch (sortOption) {
      case "newest":
        return firmsList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return firmsList.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "highest":
        return firmsList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "lowest":
        return firmsList.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case "random":
      default:
        // Stable random sort using seed
        return firmsList.sort((a, b) => {
          const hashA = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const hashB = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return ((hashA + randomSeed) % 1) - ((hashB + randomSeed) % 1);
        });
    }
  }, [categoryFirms, sortOption, randomSeed]);

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
    
    // Stable random positions using page number as seed
    const seed = currentPage * 12345;
    const shuffled = [...positions].sort((a, b) => {
      const hashA = (a + seed) % 16;
      const hashB = (b + seed) % 16;
      return hashA - hashB;
    });
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
  }, [paginatedFirms, currentPage]);

  useEffect(() => {
    if (!categoriesLoading && categories && !validCategory) {
      navigate("/404");
    }
  }, [validCategory, categoriesLoading, categories, navigate]);

  if (categoriesError || firmsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Bir hata oluştu</p>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Ana sayfaya dön
          </button>
        </div>
      </div>
    );
  }

  if (firmsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!validCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    setCurrentPage(1);
    if (value === "random") {
      setRandomSeed(Math.random()); // New random seed when switching to random sort
    }
  };

  // Schema.org yapısal veri
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${validCategory.name} Firmaları - Firmam.org`,
    "description": `${validCategory.name} kategorisinde güvenilir firmalar. ${categoryFirms.length} onaylı işletme.`,
    "url": `https://firmam.org/kategori/${category}`
  };

  return (
    <>
      <SEOHead
        title={`${validCategory.name} Firmaları - Firmam.org`}
        description={`${validCategory.name} kategorisinde güvenilir ve kaliteli firmalar. ${categoryFirms.length} onaylı işletme arasından seçim yapın.`}
        canonical={`https://firmam.org/kategori/${category}`}
        keywords={`${validCategory.name}, ${validCategory.name.toLowerCase()} firmaları, güvenilir ${validCategory.name.toLowerCase()}, firma rehberi`}
        schema={schema}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="gradient-primary py-16 md:py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
                {validCategory.name} Firmaları
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Güvenilir ve kaliteli {validCategory.name.toLowerCase()} hizmeti veren firmalar
              </p>
            </div>
          </section>

          {/* Sıralama ve Firma Grid */}
          <section className="container mx-auto px-4 py-12">
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {validCategory.name} Kategorisi
                </h2>
                <p className="text-muted-foreground">
                  {sortedFirms.length} firma listeleniyor
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <label className="text-sm font-medium whitespace-nowrap">Sırala:</label>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full md:w-[180px]">
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

            {/* Sayfalama */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Category;
