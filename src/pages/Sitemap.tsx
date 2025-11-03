import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Sitemap = () => {
  const location = useLocation();

  useEffect(() => {
    // Get the sitemap file name from the path
    // /sitemap.xml -> sitemap_index.xml
    // /sitemap_index.xml -> sitemap_index.xml
    // /sitemap/something.xml -> something.xml
    let sitemapFile = 'sitemap_index.xml';
    
    if (location.pathname === '/sitemap.xml' || location.pathname === '/sitemap_index.xml') {
      sitemapFile = 'sitemap_index.xml';
    } else if (location.pathname.startsWith('/sitemap/')) {
      sitemapFile = location.pathname.replace('/sitemap/', '');
    }

    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('VITE_SUPABASE_URL is not defined');
      return;
    }

    // Redirect to Supabase function
    const sitemapUrl = `${supabaseUrl}/functions/v1/sitemap/${sitemapFile}`;
    
    // Use window.location.replace for a permanent redirect-like behavior
    // This ensures the URL changes but doesn't add to history
    window.location.replace(sitemapUrl);
  }, [location.pathname]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Yönlendiriliyor...</p>
    </div>
  );
};

export default Sitemap;

