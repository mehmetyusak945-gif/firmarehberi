import { useState, useEffect } from "react";
import { useAdCodes } from "@/hooks/useAdCodes";

interface AdBoxProps {
  className?: string;
}

// 300x250 standart reklam kutusu
export const AdBox = ({ className = "" }: AdBoxProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [randomAdCode, setRandomAdCode] = useState<string | null>(null);
  const { data: adCodes, isLoading } = useAdCodes();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Rastgele bir reklam kodu seç
    if (adCodes && adCodes.length > 0) {
      const randomIndex = Math.floor(Math.random() * adCodes.length);
      setRandomAdCode(adCodes[randomIndex].code);
    }
  }, [adCodes]);

  // Gerçek reklam kodu varsa göster
  if (randomAdCode && !isLoading) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg transition-all duration-500 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${className}`}
        style={{ width: 300, height: 250 }}
        dangerouslySetInnerHTML={{ __html: randomAdCode }}
      />
    );
  }

  // Placeholder görünümü
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${className}`}
      style={{
        minWidth: 300,
        minHeight: 250,
        maxWidth: 300,
        maxHeight: 250,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse" />
      
      <div className="relative z-10 text-center p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          REKLAM ALANI
        </div>
        <div className="text-sm text-muted-foreground/70">
          300 × 250
        </div>
        
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-secondary/30 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-accent/30 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary/20 rounded-br-lg" />
    </div>
  );
};
