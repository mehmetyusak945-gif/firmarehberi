import { Link, useNavigate } from "react-router-dom";
import { Plus, Mail, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFirms } from "@/hooks/useFirms";
import { useState, useMemo } from "react";
import firmaLogo from "@/assets/firmam-logo.png";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: firms = [] } = useFirms();

  const filteredFirms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return firms
      .filter((firm) => firm.name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [firms, searchQuery]);

  const handleSelectFirm = (slug: string) => {
    setOpen(false);
    setSearchQuery("");
    navigate(`/firma/${slug}`);
  };
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover-lift" aria-label="Firmam.org Ana Sayfa">
              <img src={firmaLogo} alt="Firmam.org Logo" className="h-12 w-auto" />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Firma Ara"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Link
                to="/firma-ekle"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Firma Ekle</span>
                <span className="sm:hidden">Ekle</span>
              </Link>
              <Link
                to="/iletisim"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Mail className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">İletişim</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Firma ara..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          {filteredFirms.length > 0 && (
            <CommandGroup heading="Firmalar">
              {filteredFirms.map((firm) => (
                <CommandItem
                  key={firm.id}
                  value={firm.name}
                  onSelect={() => handleSelectFirm(firm.slug)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{firm.name}</span>
                    {firm.categories?.name && (
                      <span className="text-xs text-muted-foreground">
                        {firm.categories.name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
