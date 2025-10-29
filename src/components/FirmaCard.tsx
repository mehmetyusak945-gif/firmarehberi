import { Link } from "react-router-dom";
import { MapPin, Phone, Star, ExternalLink } from "lucide-react";
import { Firma } from "@/data/mockFirms";
import { formatPhone } from "@/lib/slugify";

interface FirmaCardProps {
  firma: Firma;
}

export const FirmaCard = ({ firma }: FirmaCardProps) => {
  return (
    <article 
      className="group relative bg-card rounded-xl border border-border overflow-hidden hover-lift shadow-md hover:shadow-primary transition-all duration-300 flex flex-col"
      style={{ minHeight: '250px', maxHeight: '250px', width: '300px' }}
    >
      {/* Kategori badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm">
          {firma.category}
        </span>
      </div>

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
        <Link to={`/firma/${firma.slug}`}>
          <h2 className="text-sm font-bold mb-1.5 group-hover:text-primary transition-fast line-clamp-1">
            {firma.name}
          </h2>
        </Link>

        {/* Açıklama */}
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">
          {firma.description}
        </p>

        {/* İletişim bilgileri */}
        <div className="space-y-1 mb-2">
          <div className="flex items-start space-x-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-secondary" />
            <span className="line-clamp-1">{firma.address}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 flex-shrink-0 text-success" />
            <a 
              href={`tel:${firma.phone}`}
              className="hover:text-primary transition-fast"
            >
              {formatPhone(firma.phone)}
            </a>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to={`/firma/${firma.slug}`}
          className="inline-flex items-center justify-center w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-base gradient-accent text-white hover:opacity-90 shadow-md"
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
