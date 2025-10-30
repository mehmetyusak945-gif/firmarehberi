import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

interface Firm {
  id: string;
  name: string;
  category_id: string;
  is_approved: boolean;
  phone?: string;
  email?: string;
  website?: string;
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
        firm.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        firm.phone?.includes(searchTerm)
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Firma adı, email veya telefon ile ara..."
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
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFirms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Firma bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFirms.map((firm) => (
                    <TableRow key={firm.id}>
                      <TableCell className="font-medium">{firm.name}</TableCell>
                      <TableCell>{getCategoryName(firm.category_id)}</TableCell>
                      <TableCell>{firm.phone || "-"}</TableCell>
                      <TableCell>{firm.email || "-"}</TableCell>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
