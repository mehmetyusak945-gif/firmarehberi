import { useState, useEffect } from "react";
import { adConfig } from "./AdConfig";

interface AdLeaderboardProps {
  className?: string;
}

// 728x90 yatay banner reklam
export const AdLeaderboard = ({ className = "" }: AdLeaderboardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Gerçek reklam kodu buraya gelecek
  if (!adConfig.showPlaceholder) {
    return (
      <div className={className} style={{ width: 728, height: 90 }}>
        {/* Google AdSense veya başka reklam kodu buraya */}
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={adConfig.slots.leaderboard728x90}
          data-ad-format="auto"
        />
      </div>
    );
  }

  // Placeholder görünümü
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${className}`}
      style={{
        minWidth: 728,
        minHeight: 90,
        maxWidth: 728,
        maxHeight: 90,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse" />
      
      <div className="relative z-10 text-center p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          REKLAM ALANI
        </div>
        <div className="text-sm text-muted-foreground/70">
          728 × 90
        </div>
        
        <div className="mt-2 flex justify-center space-x-1">
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
