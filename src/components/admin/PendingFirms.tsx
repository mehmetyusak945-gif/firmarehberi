import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { FirmDetailModal } from "./FirmDetailModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PendingFirm {
  id: string;
  name: string;
  address: string;
  landline_phone: string | null;
  mobile_phone: string | null;
  website: string | null;
  category_id: string | null;
  suggested_category: string | null;
  description: string | null;
  created_at: string;
  categories: {
    name: string;
  } | null;
}

export const PendingFirms = () => {
  const { toast } = useToast();
  const [firms, setFirms] = useState<PendingFirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState<PendingFirm | null>(null);

  useEffect(() => {
    fetchPendingFirms();
  }, []);

  const fetchPendingFirms = async () => {
    try {
      const { data, error } = await supabase
        .from("firms")
        .select(`
          id,
          name,
          address,
          landline_phone,
          mobile_phone,
          website,
          category_id,
          suggested_category,
          description,
          created_at,
          categories (
            name
          )
        `)
        .eq("is_approved", false)
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

  const handleApproveFirm = async (firmId: string, firmName: string) => {
    try {
      const { error } = await supabase
        .from("firms")
        .update({ is_approved: true })
        .eq("id", firmId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `"${firmName}" firması onaylandı ve yayına alındı.`,
      });

      await fetchPendingFirms();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const handleRejectFirm = async (firmId: string, firmName: string) => {
    try {
      const { error } = await supabase
        .from("firms")
        .delete()
        .eq("id", firmId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `"${firmName}" firması reddedildi ve silindi.`,
      });

      await fetchPendingFirms();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcıların Eklediği Firmalar</CardTitle>
          <CardDescription>
            Onay bekleyen firmalar. Kontrol edip onaylayabilir veya reddedebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {firms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Onay bekleyen firma bulunmuyor.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firma Adı</TableHead>
                    <TableHead>Kategori / Öneri</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="w-[180px]">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firms.map((firm) => (
                    <TableRow key={firm.id}>
                      <TableCell className="font-medium">{firm.name}</TableCell>
                      <TableCell>
                        <div>
                          {firm.categories?.name || "-"}
                          {firm.suggested_category && (
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                              Öneri: {firm.suggested_category}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{firm.landline_phone || firm.mobile_phone || "-"}</TableCell>
                      <TableCell>
                        {new Date(firm.created_at).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFirm(firm)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Firmayı Onayla</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{firm.name}" firmasını onaylayıp yayına almak istediğinizden emin misiniz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApproveFirm(firm.id, firm.name)}
                                  className="bg-success text-white hover:bg-success/90"
                                >
                                  Onayla
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Firmayı Reddet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{firm.name}" firmasını reddetmek ve silmek istediğinizden emin misiniz?
                                  Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRejectFirm(firm.id, firm.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Reddet ve Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFirm && (
        <FirmDetailModal
          firm={selectedFirm as any}
          isOpen={!!selectedFirm}
          onClose={() => setSelectedFirm(null)}
          onUpdate={fetchPendingFirms}
        />
      )}
    </>
  );
};
