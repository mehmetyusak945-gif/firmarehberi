import { NavLink } from "react-router-dom";
import {
  Building2,
  Upload,
  List,
  FolderTree,
  Megaphone,
  Clock,
  HardDrive,
  Mail,
  FileText,
  AlertTriangle,
  Globe,
  Brain,
  Search,
  Settings,
  AlertCircle,
  Merge,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = {
  overview: [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  firms: [
    { value: "firms", label: "Firmalar", icon: List },
    { value: "pending", label: "Bekleyenler", icon: Clock },
    { value: "add-firm", label: "Firma Ekle", icon: Building2 },
    { value: "upload-excel", label: "Toplu Ekle", icon: Upload },
  ],
  serper: [
    { value: "serper-search", label: "Firma Ara", icon: Search },
    { value: "serper-settings", label: "API Ayarları", icon: Settings },
  ],
  content: [
    { value: "categories", label: "Kategoriler", icon: FolderTree },
    { value: "category-merge", label: "Kategori Birleştir", icon: Merge },
    { value: "pages", label: "Sayfalar", icon: FileText },
    { value: "messages", label: "Mesajlar", icon: Mail },
    { value: "firm-reports", label: "Firma Bildirimleri", icon: AlertCircle },
    { value: "ads", label: "Reklamlar", icon: Megaphone },
  ],
  system: [
    { value: "ai-settings", label: "AI Ayarları", icon: Brain },
    { value: "webmaster", label: "Webmaster", icon: Globe },
    { value: "backup", label: "Yedekleme", icon: HardDrive },
    { value: "db-connection", label: "DB Bağlantısı", icon: Settings },
    { value: "clear-data", label: "Veri Temizle", icon: AlertTriangle, danger: true },
  ],
};

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Genel Bakış</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.overview.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Firma İşlemleri</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.firms.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Google Places API</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.serper.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>İçerik Yönetimi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.content.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistem Ayarları</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.system.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    className={`cursor-pointer ${
                      item.danger
                        ? "text-destructive hover:text-destructive data-[active=true]:text-destructive-foreground data-[active=true]:bg-destructive"
                        : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {state === "expanded" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
