import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "processed";
  created_at: string;
  read_at: string | null;
  notes: string | null;
}

export const ContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages((data as ContactMessage[]) || []);
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

  const updateStatus = async (messageId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "read" || newStatus === "processed") {
        updateData.read_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("contact_messages")
        .update(updateData)
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updateData } : msg
        )
      );

      toast({
        title: "Başarılı!",
        description: "Mesaj durumu güncellendi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      toast({
        title: "Başarılı!",
        description: "Mesaj silindi.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setNotes(message.notes || "");
    setIsModalOpen(true);
    
    // Mark as read if unread
    if (message.status === "unread") {
      updateStatus(message.id, "read");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ notes })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === selectedMessage.id ? { ...msg, notes } : msg
        )
      );

      toast({
        title: "Başarılı!",
        description: "Notlar kaydedildi.",
      });

      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive">Okunmadı</Badge>;
      case "read":
        return <Badge variant="secondary">Okundu</Badge>;
      case "processed":
        return <Badge variant="default">İşleme Alındı</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
          <CardTitle>İletişim Mesajları ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Konu</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="w-[150px]">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Mesaj bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        {new Date(message.created_at).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={message.status}
                            onValueChange={(value) => updateStatus(message.id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unread">Okunmadı</SelectItem>
                              <SelectItem value="read">Okundu</SelectItem>
                              <SelectItem value="processed">İşleme Alındı</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mesaj Detayı</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label>Ad</Label>
                <p className="text-sm text-muted-foreground">{selectedMessage.name}</p>
              </div>
              <div>
                <Label>E-posta</Label>
                <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
              </div>
              <div>
                <Label>Konu</Label>
                <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
              </div>
              <div>
                <Label>Mesaj</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Bu mesaj hakkında notlar ekleyin..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Kapat
                </Button>
                <Button onClick={handleSaveNotes}>Kaydet</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};