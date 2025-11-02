import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getRandomDateThisYear(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const randomTime = startOfYear.getTime() + Math.random() * (now.getTime() - startOfYear.getTime());
  return new Date(randomTime).toISOString();
}

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
    const pathMatch = url.pathname.match(/\/sitemap\/(.*)/);
    const file = pathMatch ? pathMatch[1] : 'sitemap_index.xml';

    console.log('Sitemap request for:', file);

    // Main sitemap index
    if (file === 'sitemap_index.xml' || file === '') {
      const { data: categories } = await supabaseClient
        .from('categories')
        .select('slug')
        .order('name');

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      const baseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const sitemapBaseUrl = `${baseUrl}/functions/v1/sitemap`;

      // Static pages sitemap
      xml += '  <sitemap>\n';
      xml += `    <loc>${sitemapBaseUrl}/static.xml</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </sitemap>\n';

      // Category sitemaps
      for (const category of categories || []) {
        xml += '  <sitemap>\n';
        xml += `    <loc>${sitemapBaseUrl}/${category.slug}.xml</loc>\n`;
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

    // Static pages sitemap
    if (file === 'static.xml') {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      const staticPages = [
        { url: '', priority: '1.0', changefreq: 'daily' },
        { url: 'iletisim', priority: '0.8', changefreq: 'monthly' },
        { url: 'firma-ekle', priority: '0.7', changefreq: 'monthly' },
      ];

      for (const page of staticPages) {
        const pageUrl = page.url ? `https://firmam.org/${page.url}` : 'https://firmam.org/';
        xml += '  <url>\n';
        xml += `    <loc>${pageUrl}</loc>\n`;
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

    // Category sitemap
    const categorySlug = file.replace('.xml', '');
    
    // Get category
    const { data: category } = await supabaseClient
      .from('categories')
      .select('id, slug')
      .eq('slug', categorySlug)
      .single();

    if (!category) {
      return new Response('Category not found', { status: 404, headers: corsHeaders });
    }

    // Get firms in this category
    const { data: firms } = await supabaseClient
      .from('firms')
      .select('slug, created_at')
      .eq('category_id', category.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add category page itself
    xml += '  <url>\n';
    xml += `    <loc>https://firmam.org/kategori/${category.slug}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';

    // Add firms with random dates within this year
    for (const firm of firms || []) {
      xml += '  <url>\n';
      xml += `    <loc>https://firmam.org/firma/${firm.slug}</loc>\n`;
      xml += `    <lastmod>${getRandomDateThisYear()}</lastmod>\n`;
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

  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});