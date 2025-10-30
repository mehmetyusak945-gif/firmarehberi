import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, maxPages = 1, city, district } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Şehir ve ilçe varsa query'ye ekle (daha kesin filtreleme için)
    let enhancedQuery = query;
    if (city) {
      enhancedQuery += ` ${city}`;
      if (district) {
        enhancedQuery += ` ${district}`;
      }
    }

    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    if (!SERPER_API_KEY) {
      throw new Error('SERPER_API_KEY not configured');
    }

    // Get settings from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from('serper_settings')
      .select('*')
      .single();

    const gl = settings?.gl || 'tr';
    const hl = settings?.hl || 'tr';
    const defaultLocation = settings?.location || 'Turkey';

    // Collect results from multiple pages
    const allPlaces: any[] = [];
    const pagesToFetch = Math.min(Math.max(1, maxPages), 20); // Limit to 20 pages max
    
    console.log(`Fetching ${pagesToFetch} pages for query: ${enhancedQuery} (original: ${query})`);

    for (let page = 1; page <= pagesToFetch; page++) {
      console.log(`Fetching page ${page}...`);
      
      const response = await fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: enhancedQuery,
          location: location || defaultLocation,
          gl,
          hl,
          page,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Serper API error on page ${page}:`, response.status, errorText);
        continue; // Skip this page but continue with others
      }

      const data = await response.json();
      
      if (data.places && Array.isArray(data.places)) {
        allPlaces.push(...data.places);
        console.log(`Page ${page}: Found ${data.places.length} places`);
      }

      // Small delay to avoid rate limiting
      if (page < pagesToFetch) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Total places collected: ${allPlaces.length}`);

    return new Response(
      JSON.stringify({ places: allPlaces }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in serper-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});