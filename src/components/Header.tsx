import { Link } from "react-router-dom";
import { Building2, Plus, Mail, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift" aria-label="Firma Rehberim Ana Sayfa">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">
              Firma Rehberim
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Yönetim Paneli</span>
                <span className="sm:hidden">Panel</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Giriş Yap</span>
                <span className="sm:hidden">Giriş</span>
              </Link>
            )}
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
  );
};
