import { Link } from "react-router-dom";
import { Building2, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4" aria-label="Firma Rehberim Ana Sayfa">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                Firma Rehberim
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Türkiye'nin en kapsamlı firma rehberi. İhtiyacınız olan hizmeti sunan firmaları kolayca bulun, 
              güvenilir işletmelerle tanışın.
            </p>
            
            {/* Sosyal Medya */}
            <div className="flex space-x-4 mt-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-base"
                aria-label="Facebook sayfamızı ziyaret edin"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-base"
                aria-label="Twitter sayfamızı ziyaret edin"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-base"
                aria-label="Instagram sayfamızı ziyaret edin"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-base"
                aria-label="LinkedIn sayfamızı ziyaret edin"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-fast">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/firma-ekle" className="hover:text-primary transition-fast">
                  Firma Ekle
                </Link>
              </li>
              <li>
                <Link to="/iletisim" className="hover:text-primary transition-fast">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/?kategori=elektrikci" className="hover:text-primary transition-fast">
                  Elektrikçi
                </Link>
              </li>
              <li>
                <Link to="/?kategori=restoran" className="hover:text-primary transition-fast">
                  Restoran
                </Link>
              </li>
              <li>
                <Link to="/?kategori=lokanta" className="hover:text-primary transition-fast">
                  Lokanta
                </Link>
              </li>
              <li>
                <Link to="/?kategori=tesisatci" className="hover:text-primary transition-fast">
                  Tesisatçı
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Firma Rehberim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};
