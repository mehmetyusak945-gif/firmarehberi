import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Plus, CheckCircle2, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface SerperPlace {
  position: number;
  title: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  types?: string[];
}

interface AddResults {
  addedFirms: string[];
  failedFirms: string[];
  categoriesCreated: string[];
}

export const SerperSearch = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("Turkey");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [maxPages, setMaxPages] = useState(1);
  const [results, setResults] = useState<SerperPlace[]>([]);
  const [selectedFirms, setSelectedFirms] = useState<Set<number>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [addResults, setAddResults] = useState<AddResults | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen arama terimi girin",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedFirms(new Set());

    try {
      const location = [district, city, country].filter(Boolean).join(", ");
      
      const { data, error } = await supabase.functions.invoke("serper-search", {
        body: { 
          query, 
          location: location || undefined, 
          maxPages,
          city: city || undefined,
          district: district || undefined
        },
      });

      if (error) throw error;

      setResults(data.places || []);
      
      if (!data.places || data.places.length === 0) {
        toast({
          title: "Sonuç Bulunamadı",
          description: "Arama kriterlerine uygun firma bulunamadı",
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Hata",
        description: error.message || "Arama sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedFirms);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFirms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFirms.size === results.length) {
      setSelectedFirms(new Set());
    } else {
      setSelectedFirms(new Set(results.map((_, index) => index)));
    }
  };

  const handleAddFirms = async () => {
    if (selectedFirms.size === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir firma seçin",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const firmsToAdd = results.filter((_, index) => selectedFirms.has(index));

      const { data, error } = await supabase.functions.invoke("add-serper-firms", {
        body: { 
          firms: firmsToAdd,
          userId: user?.id,
          query,
          city: city || undefined,
          district: district || undefined
        },
      });

      if (error) throw error;

      // Başarılı ve başarısız firmaları ayır
      const failedFirmNames = data.errors.map((err: string) => {
        const colonIndex = err.indexOf(':');
        return colonIndex > -1 ? err.substring(0, colonIndex) : err;
      });
      
      const addedFirmNames = firmsToAdd
        .filter(firm => !failedFirmNames.includes(firm.title))
        .map(firm => firm.title);

      // Sonuç ekranını göster
      setAddResults({
        addedFirms: addedFirmNames,
        failedFirms: failedFirmNames,
        categoriesCreated: data.categoriesCreated || []
      });
      setShowResults(true);
      setResults([]);
      setSelectedFirms(new Set());
    } catch (error: any) {
      console.error("Add firms error:", error);
      toast({
        title: "Hata",
        description: error.message || "Firmalar eklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setAddResults(null);
    setQuery("");
    setCity("");
    setDistrict("");
    setResults([]);
    setSelectedFirms(new Set());
  };

  return (
    <div className="space-y-4">
      {showResults && addResults ? (
        <>
          {/* Üst Buton */}
          <Button onClick={handleNewSearch} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Arama Yap - Firma Ekle
          </Button>

          {/* Yeni Kategoriler */}
          {addResults.categoriesCreated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Yeni Oluşturulan Kategoriler</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {addResults.categoriesCreated.map((category, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-2 border rounded">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{category}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Eklenen Firmalar */}
          {addResults.addedFirms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Başarıyla Eklenen Firmalar ({addResults.addedFirms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {addResults.addedFirms.map((firmName, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-2 text-green-600 border border-green-200 bg-green-50 rounded">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{firmName}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Eklenemeyen Firmalar */}
          {addResults.failedFirms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Eklenemeyen Firmalar ({addResults.failedFirms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {addResults.failedFirms.map((firmName, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-2 text-red-600 border border-red-200 bg-red-50 rounded">
                      <span className="text-lg">✕</span>
                      <span>{firmName}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alt Buton */}
          <Button onClick={handleNewSearch} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Arama Yap - Firma Ekle
          </Button>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Firma Ara (Google Places)</CardTitle>
              <CardDescription>
                Serper API ile Google Places'ten firma arayın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="query">Arama Terimi *</Label>
                    <Input
                      id="query"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="örn: telefon tamircisi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPages">Kaç Sayfa Çekilecek *</Label>
                    <Input
                      id="maxPages"
                      type="number"
                      min="1"
                      max="20"
                      value={maxPages}
                      onChange={(e) => setMaxPages(parseInt(e.target.value) || 1)}
                      placeholder="örn: 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Ülke</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="örn: Turkey"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">İl (Opsiyonel)</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="örn: Antalya"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe (Opsiyonel)</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="örn: Alanya"
                    />
                  </div>
                </div>

                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aranıyor...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Ara
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Arama Sonuçları ({results.length})</CardTitle>
                    <CardDescription>
                      {selectedFirms.size} firma seçildi
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSelectAll}
                    >
                      {selectedFirms.size === results.length ? "Tümünü Kaldır" : "Tümünü Seç"}
                    </Button>
                    <Button
                      onClick={handleAddFirms}
                      disabled={isAdding || selectedFirms.size === 0}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Seçilenleri Ekle ({selectedFirms.size})
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((place, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedFirms.has(index)}
                        onCheckedChange={() => handleToggleSelect(index)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{place.title}</h4>
                        {place.address && (
                          <p className="text-sm text-muted-foreground truncate">
                            {place.address}
                          </p>
                        )}
                        {place.types && place.types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {place.types.slice(0, 3).map((type, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                {type.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          {place.phoneNumber && <span>📞 {place.phoneNumber}</span>}
                          {place.rating && <span>⭐ {place.rating}</span>}
                          {place.website && (
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              🌐 Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};