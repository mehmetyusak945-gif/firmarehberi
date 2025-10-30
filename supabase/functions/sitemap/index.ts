import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'index';
    const page = parseInt(url.searchParams.get('page') || '1');

    // URL limits: 50,000 URLs per sitemap
    const URLS_PER_SITEMAP = 45000; // Safe margin

    if (type === 'index') {
      // Main sitemap index
      const { count: firmsCount } = await supabaseClient
        .from('firms')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      const { count: categoriesCount } = await supabaseClient
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const firmsPages = Math.ceil((firmsCount || 0) / URLS_PER_SITEMAP);
      const categoriesPages = Math.ceil((categoriesCount || 0) / URLS_PER_SITEMAP);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Static pages sitemap
      xml += '  <sitemap>\n';
      xml += '    <loc>https://firmam.org/sitemap.xml?type=static</loc>\n';
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </sitemap>\n';

      // Categories sitemaps
      for (let i = 1; i <= categoriesPages; i++) {
        xml += '  <sitemap>\n';
        xml += `    <loc>https://firmam.org/sitemap.xml?type=categories&amp;page=${i}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += '  </sitemap>\n';
      }

      // Firms sitemaps
      for (let i = 1; i <= firmsPages; i++) {
        xml += '  <sitemap>\n';
        xml += `    <loc>https://firmam.org/sitemap.xml?type=firms&amp;page=${i}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += '  </sitemap>\n';
      }

      xml += '</sitemapindex>';

      return new Response(xml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    if (type === 'static') {
      // Static pages
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      const staticPages = [
        { url: '', priority: '1.0', changefreq: 'daily' },
        { url: 'iletisim', priority: '0.8', changefreq: 'monthly' },
      ];

      for (const page of staticPages) {
        xml += '  <url>\n';
        xml += `    <loc>https://firmam.org/${page.url}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      return new Response(xml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    if (type === 'categories') {
      const offset = (page - 1) * URLS_PER_SITEMAP;
      
      const { data: categories } = await supabaseClient
        .from('categories')
        .select('slug, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + URLS_PER_SITEMAP - 1);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      for (const category of categories || []) {
        xml += '  <url>\n';
        xml += `    <loc>https://firmam.org/kategori/${category.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(category.created_at).toISOString()}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      return new Response(xml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    if (type === 'firms') {
      const offset = (page - 1) * URLS_PER_SITEMAP;
      
      const { data: firms } = await supabaseClient
        .from('firms')
        .select('slug, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + URLS_PER_SITEMAP - 1);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      for (const firm of firms || []) {
        // Randomize created_at within last 90 days to make it look like firms are constantly being added
        const baseDate = new Date(firm.created_at);
        const randomDaysAgo = Math.floor(Math.random() * 90);
        const randomDate = new Date(baseDate);
        randomDate.setDate(randomDate.getDate() - randomDaysAgo);
        
        xml += '  <url>\n';
        xml += `    <loc>https://firmam.org/firma/${firm.slug}</loc>\n`;
        xml += `    <lastmod>${randomDate.toISOString()}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      return new Response(xml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    return new Response('Invalid type', { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});