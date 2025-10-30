import { useEffect } from "react";
import { useWebmasterSettings } from "@/hooks/useWebmasterSettings";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  schema?: object;
}

export const SEOHead = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = "https://firmam.org/og-image.jpg",
  keywords,
  schema
}: SEOHeadProps) => {
  const { data: webmasterSettings } = useWebmasterSettings();

  useEffect(() => {
    // Title
    document.title = title;

    // Meta tags
    const metaTags = [
      { name: "description", content: description },
      { name: "keywords", content: keywords || "firma rehberi, işletme rehberi, türkiye firmaları" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: ogType },
      { property: "og:image", content: ogImage },
      { property: "og:locale", content: "tr_TR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const attribute = property ? "property" : "name";
      const value = property || name;
      let meta = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, value);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Structured Data (Schema.org)
    if (schema) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    // Webmaster verification codes
    if (webmasterSettings) {
      // Google Search Console
      if (webmasterSettings.google_search_console_meta) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = webmasterSettings.google_search_console_meta.trim();
        const metaElement = tempDiv.querySelector('meta');
        if (metaElement) {
          const name = metaElement.getAttribute('name');
          const content = metaElement.getAttribute('content');
          if (name && content) {
            let existingMeta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
            if (!existingMeta) {
              existingMeta = document.createElement('meta');
              existingMeta.setAttribute('name', name);
              document.head.appendChild(existingMeta);
            }
            existingMeta.setAttribute('content', content);
          }
        }
      }

      // Yandex Webmaster
      if (webmasterSettings.yandex_webmaster_meta) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = webmasterSettings.yandex_webmaster_meta.trim();
        const metaElement = tempDiv.querySelector('meta');
        if (metaElement) {
          const name = metaElement.getAttribute('name');
          const content = metaElement.getAttribute('content');
          if (name && content) {
            let existingMeta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
            if (!existingMeta) {
              existingMeta = document.createElement('meta');
              existingMeta.setAttribute('name', name);
              document.head.appendChild(existingMeta);
            }
            existingMeta.setAttribute('content', content);
          }
        }
      }

      // Bing Webmaster
      if (webmasterSettings.bing_webmaster_meta) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = webmasterSettings.bing_webmaster_meta.trim();
        const metaElement = tempDiv.querySelector('meta');
        if (metaElement) {
          const name = metaElement.getAttribute('name');
          const content = metaElement.getAttribute('content');
          if (name && content) {
            let existingMeta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
            if (!existingMeta) {
              existingMeta = document.createElement('meta');
              existingMeta.setAttribute('name', name);
              document.head.appendChild(existingMeta);
            }
            existingMeta.setAttribute('content', content);
          }
        }
      }

      // Google Analytics
      if (webmasterSettings.google_analytics_code) {
        const existingGAScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
        if (existingGAScripts.length === 0) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = webmasterSettings.google_analytics_code.trim();
          const scripts = tempDiv.querySelectorAll('script');
          scripts.forEach((script) => {
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
              newScript.async = true;
            } else {
              newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript);
          });
        }
      }
    }
  }, [title, description, canonical, ogType, ogImage, keywords, schema, webmasterSettings]);

  return null;
};
