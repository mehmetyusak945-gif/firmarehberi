// Merkezi reklam yönetimi
// Tüm reklam kodlarını buradan yönetebilirsiniz

export const adConfig = {
  // Google AdSense veya başka reklam ağı kodlarınızı buraya ekleyin
  enabled: true,
  
  // Reklam slot ID'leri (örnek)
  slots: {
    box300x250: "YOUR_AD_SLOT_ID_1",
    leaderboard728x90: "YOUR_AD_SLOT_ID_2",
  },
  
  // Placeholder göster (geliştirme modu için)
  showPlaceholder: true,
};

// Reklam script'i yüklensin mi?
export const loadAdScript = () => {
  if (!adConfig.enabled) return;
  
  // Google AdSense örneği:
  // const script = document.createElement('script');
  // script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
  // script.async = true;
  // script.crossOrigin = "anonymous";
  // document.head.appendChild(script);
};
