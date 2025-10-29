import { useState, useEffect } from "react";

interface AdBannerProps {
  size: "small" | "medium" | "large" | "leaderboard" | "rectangle";
  className?: string;
}

// Standart reklam ölçüleri (IAB standartları)
const adSizes = {
  small: { width: 300, height: 250 }, // Medium Rectangle
  medium: { width: 336, height: 280 }, // Large Rectangle
  large: { width: 300, height: 600 }, // Half Page
  leaderboard: { width: 728, height: 90 }, // Leaderboard
  rectangle: { width: 250, height: 250 }, // Square
};

export const AdBanner = ({ size, className = "" }: AdBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const dimensions = adSizes[size];

  useEffect(() => {
    // Fade-in animasyonu için
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${className}`}
      style={{
        minWidth: dimensions.width,
        minHeight: dimensions.height,
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
      }}
    >
      {/* Animasyonlu gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse" />
      
      {/* İçerik */}
      <div className="relative z-10 text-center p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          REKLAM ALANI
        </div>
        <div className="text-sm text-muted-foreground/70">
          {dimensions.width} × {dimensions.height}
        </div>
        
        {/* Dekoratif elementler */}
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-secondary/30 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-accent/30 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Köşe süslemeleri */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary/20 rounded-br-lg" />
    </div>
  );
};
