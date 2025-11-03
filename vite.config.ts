import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
    proxy: {
      // Proxy sitemap requests to Supabase function
      '/sitemap.xml': {
        target: process.env.VITE_SUPABASE_URL || 'https://wzpjmnjzfismjozhapmq.supabase.co',
        changeOrigin: true,
        rewrite: (path) => '/functions/v1/sitemap/sitemap_index.xml',
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['content-type'] = 'application/xml; charset=utf-8';
          });
        },
      },
      '/sitemap_index.xml': {
        target: process.env.VITE_SUPABASE_URL || 'https://wzpjmnjzfismjozhapmq.supabase.co',
        changeOrigin: true,
        rewrite: (path) => '/functions/v1/sitemap/sitemap_index.xml',
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['content-type'] = 'application/xml; charset=utf-8';
          });
        },
      },
      '/sitemap': {
        target: process.env.VITE_SUPABASE_URL || 'https://wzpjmnjzfismjozhapmq.supabase.co',
        changeOrigin: true,
        rewrite: (path) => `/functions/v1/sitemap${path.replace('/sitemap', '')}`,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['content-type'] = 'application/xml; charset=utf-8';
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
