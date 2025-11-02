import { Link } from "react-router-dom";
import { MapPin, Phone, Smartphone, Globe, Star, ExternalLink } from "lucide-react";
import { formatPhone } from "@/lib/slugify";

interface FirmaCardProps {
  firma: {
    id: string;
    name: string;
    address: string;
    landline_phone?: string | null;
    mobile_phone?: string | null;
    website?: string | null;
    rating: number;
    category?: string;
    categories?: { name: string };
    description?: string | null;
    ai_description?: string | null;
    slug: string;
  };
}

export const FirmaCard = ({ firma }: FirmaCardProps) => {
  return (
    <article 
      className="group relative bg-card rounded-xl border border-border overflow-hidden hover-lift shadow-md hover:shadow-primary transition-all duration-300 flex flex-col"
      style={{ minHeight: '280px', maxHeight: '320px', width: '300px' }}
    >
      {/* Kategori badge */}
      {(firma.category || firma.categories?.name) && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm">
            {firma.category || firma.categories?.name}
          </span>
        </div>
      )}

      {/* Gradient header */}
      <div className="h-16 gradient-primary flex-shrink-0" />

      {/* Content */}
      <div className="p-3 -mt-5 relative flex flex-col flex-1">
        {/* Rating */}
        <div className="mb-1.5 flex items-center space-x-1">
          <div className="flex items-center space-x-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-md shadow-sm">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-semibold">{firma.rating}</span>
          </div>
        </div>

        {/* Firma ismi */}
        <Link to={`/firma/${firma.slug}`} aria-label={`${firma.name} firma detayları`}>
          <h2 className="text-sm font-bold mb-1.5 group-hover:text-primary transition-fast line-clamp-1">
            {firma.name}
          </h2>
        </Link>

        {/* Açıklama */}
        {(firma.description || firma.ai_description) && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">
            {firma.description || firma.ai_description}
          </p>
        )}

        {/* İletişim bilgileri */}
        <div className="space-y-1 mb-2">
          {firma.address && (
            <div className="flex items-start space-x-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-secondary" />
              <span className="line-clamp-1">{firma.address}</span>
            </div>
          )}
          
          {firma.landline_phone && (
            <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0 text-success" />
              <a 
                href={`tel:${firma.landline_phone}`}
                className="hover:text-primary transition-fast"
                aria-label={`${firma.name} sabit telefon numarasını ara`}
              >
                {formatPhone(firma.landline_phone)}
              </a>
            </div>
          )}
          
          {firma.mobile_phone && (
            <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3 flex-shrink-0 text-green-600" />
              <a 
                href={`https://wa.me/${firma.mobile_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-fast"
                aria-label={`${firma.name} WhatsApp ile iletişime geç`}
              >
                {formatPhone(firma.mobile_phone)}
              </a>
            </div>
          )}
          
          {firma.website && (
            <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
              <Globe className="h-3 w-3 flex-shrink-0 text-blue-600" />
              <a 
                href={firma.website.startsWith('http') ? firma.website : `https://${firma.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-fast line-clamp-1"
                aria-label={`${firma.name} web sitesini ziyaret et`}
              >
                {firma.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to={`/firma/${firma.slug}`}
          className="inline-flex items-center justify-center w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-base gradient-accent text-white hover:opacity-90 shadow-md"
          aria-label={`${firma.name} detaylı bilgi sayfasına git`}
        >
          Detaylı Bilgi
          <ExternalLink className="ml-1.5 h-3 w-3" />
        </Link>
      </div>

      {/* Hover efekti */}
      <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-fast pointer-events-none" />
    </article>
  );
};
