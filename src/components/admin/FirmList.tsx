import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Eye, ExternalLink } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { FirmDetailModal } from "./FirmDetailModal";

interface Firm {
  id: string;
  name: string;
  address: string | null;
  landline_phone: string | null;
  mobile_phone: string | null;
  website: string | null;
  description: string | null;
  rating: number | null;
  category_id: string;
  suggested_category: string | null;
  slug: string;
  is_approved: boolean;
  created_at: string;
}

export const FirmList = () => {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [filteredFirms, setFilteredFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchFirms();
  }, []);

  useEffect(() => {
    filterFirms();
  }, [searchTerm, selectedCategory, firms]);

  const fetchFirms = async () => {
    try {
      const { data, error } = await supabase
        .from("firms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFirms(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFirms = () => {
    let filtered = [...firms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((firm) =>
        firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        firm.landline_phone?.includes(searchTerm) ||
        firm.mobile_phone?.includes(searchTerm)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((firm) => firm.category_id === selectedCategory);
    }

    setFilteredFirms(filtered);
  };

  const toggleFirmStatus = async (firmId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("firms")
        .update({ is_approved: !currentStatus })
        .eq("id", firmId);

      if (error) throw error;

      setFirms((prev) =>
        prev.map((firm) =>
          firm.id === firmId ? { ...firm, is_approved: !currentStatus } : firm
        )
      );

      toast({
        title: "Başarılı!",
        description: "Firma durumu güncellendi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((cat) => cat.id === categoryId)?.name || "-";
  };

  const handleViewDetails = (firm: Firm) => {
    setSelectedFirm(firm);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFirm(null);
  };

  const handleFirmUpdate = () => {
    fetchFirms();
  };

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFirms = filteredFirms.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firma Listesi ({filteredFirms.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Firma adı veya telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">Sayfa başı:</label>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="75">75</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[150px]">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFirms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Firma bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFirms.map((firm) => (
                    <TableRow key={firm.id}>
                      <TableCell className="font-medium">{firm.name}</TableCell>
                      <TableCell>{getCategoryName(firm.category_id)}</TableCell>
                      <TableCell>{firm.landline_phone || firm.mobile_phone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={firm.is_approved}
                            onCheckedChange={() => toggleFirmStatus(firm.id, firm.is_approved)}
                          />
                          <span className="text-sm">
                            {firm.is_approved ? "Aktif" : "Pasif"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(firm)}
                            title="Detayları Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/firma/${firm.slug}`, '_blank')}
                            title="Sitede Görüntüle"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground">
                Sayfa {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <FirmDetailModal
        firm={selectedFirm}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleFirmUpdate}
      />
    </Card>
  );
};
