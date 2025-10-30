import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Trash2, Eye } from "lucide-react";
import { FirmDetailModal } from "./FirmDetailModal";

interface FirmReport {
  id: string;
  firm_id: string;
  reporter_name: string;
  reporter_phone: string;
  description: string;
  status: string;
  created_at: string;
  firms: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    mobile_phone: string | null;
    landline_phone: string | null;
    website: string | null;
    email: string | null;
    description: string | null;
    rating: number | null;
    category_id: string | null;
    suggested_category: string | null;
    is_approved: boolean | null;
  } | null;
}

export const FirmReports = () => {
  const [reports, setReports] = useState<FirmReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<FirmReport | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [firmModalOpen, setFirmModalOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<any>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("firm_reports")
        .select(`
          *,
          firms (
            id,
            name,
            slug,
            address,
            mobile_phone,
            landline_phone,
            website,
            email,
            description,
            rating,
            category_id,
            suggested_category,
            is_approved
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Hata",
        description: "Bildirimler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("firm_reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      toast({
        title: "Başarılı",
        description: "Durum güncellendi.",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("Bu bildirimi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("firm_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      setReports(reports.filter(r => r.id !== reportId));
      toast({
        title: "Başarılı",
        description: "Bildirim silindi.",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Hata",
        description: "Bildirim silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      unread: "destructive",
      read: "secondary",
      resolved: "default",
    };
    const labels: Record<string, string> = {
      unread: "Okunmadı",
      read: "Okundu",
      resolved: "Çözüldü",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const handleViewDetails = (report: FirmReport) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
    if (report.status === "unread") {
      updateStatus(report.id, "read");
    }
  };

  const handleEditFirm = (firm: any) => {
    setSelectedFirm(firm);
    setFirmModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Yükleniyor...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Firma Bildirimleri ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>İşletme</TableHead>
                <TableHead>Bildiren</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Henüz bildirim bulunmuyor.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{report.firms?.name || "Bilinmiyor"}</span>
                        {report.firms && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFirm(report.firms)}
                            title="Firmayı düzenle"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>{report.reporter_phone}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={report.status}
                          onValueChange={(value) => updateStatus(report.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unread">Okunmadı</SelectItem>
                            <SelectItem value="read">Okundu</SelectItem>
                            <SelectItem value="resolved">Çözüldü</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bildirim Detayı</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label>İşletme</Label>
                <p className="font-semibold">{selectedReport.firms?.name || "Bilinmiyor"}</p>
              </div>
              <div>
                <Label>Bildiren</Label>
                <p>{selectedReport.reporter_name}</p>
              </div>
              <div>
                <Label>Telefon</Label>
                <p>{selectedReport.reporter_phone}</p>
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={selectedReport.description}
                  readOnly
                  className="min-h-[150px]"
                />
              </div>
              <div>
                <Label>Tarih</Label>
                <p>{new Date(selectedReport.created_at).toLocaleString("tr-TR")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FirmDetailModal
        firm={selectedFirm}
        isOpen={firmModalOpen}
        onClose={() => {
          setFirmModalOpen(false);
          setSelectedFirm(null);
        }}
        onUpdate={() => {
          fetchReports();
        }}
      />
    </>
  );
};
