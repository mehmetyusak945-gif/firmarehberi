import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Türkçe karakter dönüşümü ve slug oluşturma
function slugify(text: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  
  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Kategori adından kategori slug'ı tahmin et
function guessCategory(name: string, types: string[], query?: string): string {
  const nameLower = name.toLowerCase();
  const typesStr = types.join(' ').toLowerCase();
  
  // Yaygın kategori eşleştirmeleri
  const categoryMap: { [key: string]: string[] } = {
    'restoran': ['restoran', 'restaurant', 'yemek', 'lokanta', 'food'],
    'kafe': ['kafe', 'cafe', 'kahve', 'coffee'],
    'otel': ['otel', 'hotel', 'konaklama', 'lodging'],
    'market': ['market', 'supermarket', 'bakkal', 'grocery'],
    'eczane': ['eczane', 'pharmacy', 'ilac'],
    'hastane': ['hastane', 'hospital', 'saglik', 'health', 'klinik', 'clinic'],
    'okul': ['okul', 'school', 'egitim', 'education'],
    'spor-salonu': ['spor', 'gym', 'fitness', 'health_club'],
    'kuafor': ['kuafor', 'berber', 'hair', 'beauty', 'guzellik'],
    'oto-tamir': ['oto', 'car_repair', 'araba', 'tamir', 'mechanic'],
    'telefon-tamircisi': ['telefon', 'phone', 'gsm', 'mobile', 'electronics'],
    'avukat': ['avukat', 'lawyer', 'hukuk', 'legal'],
    'doktor': ['doktor', 'doctor', 'dr'],
    'dis-hekimi': ['dis', 'dentist', 'dental'],
    'muhasebe': ['muhasebe', 'accounting', 'muhasebecilik'],
    'emlak': ['emlak', 'real_estate', 'gayrimenkul'],
    'banka': ['banka', 'bank', 'atm'],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword) || typesStr.includes(keyword)) {
        return category;
      }
    }
  }

  // Eğer eşleşme yoksa ve query varsa, query'den kategori oluştur
  if (query) {
    return slugify(query);
  }

  return 'diger'; // Default category
}

// Telefon numarasının mobil mi sabit hat mı olduğunu kontrol et
function isMobilePhone(phone: string): boolean {
  if (!phone) return false;
  // Türkiye mobil operatörleri: 50x, 51x, 52x, 53x, 54x, 55x, 56x
  const cleaned = phone.replace(/\D/g, '');
  const turkishMobile = /^(90)?(5[0-9]{2})/;
  return turkishMobile.test(cleaned);
}

// Konum filtreleme - adres belirtilen şehir/ilçeyi içeriyor mu?
function matchesLocation(address: string, city?: string, district?: string): boolean {
  if (!address) return true; // Adres yoksa filtrele
  
  const addressLower = address.toLowerCase();
  
  if (district) {
    const districtLower = district.toLowerCase();
    if (!addressLower.includes(districtLower)) {
      return false;
    }
  }
  
  if (city) {
    const cityLower = city.toLowerCase();
    if (!addressLower.includes(cityLower)) {
      return false;
    }
  }
  
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firms, userId, query, city, district } = await req.json();
    
    if (!firms || !Array.isArray(firms) || firms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Firms array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${firms.length} firms with query: ${query}, city: ${city}, district: ${district}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all existing categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, name, slug');

    const categoryMap = new Map(
      existingCategories?.map(c => [c.slug, c.id]) || []
    );

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      categoriesCreated: [] as string[],
    };

    for (const firm of firms) {
      try {
        // Konum filtrele
        if (!matchesLocation(firm.address, city, district)) {
          console.log(`Skipping ${firm.title} - location mismatch: ${firm.address}`);
          results.failed++;
          results.errors.push(`${firm.title}: Konum eşleşmedi (${firm.address})`);
          continue;
        }

        // Kategori slug'ı tahmin et
        const categorySlug = guessCategory(
          firm.title || '',
          firm.types || [],
          query
        );

        // Kategori yoksa oluştur
        let categoryId = categoryMap.get(categorySlug);
        
        if (!categoryId) {
          const categoryName = categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: categoryName, slug: categorySlug })
            .select('id')
            .single();

          if (categoryError) {
            console.error('Category creation error:', categoryError);
          } else if (newCategory) {
            categoryId = newCategory.id;
            categoryMap.set(categorySlug, categoryId);
            results.categoriesCreated.push(categoryName);
          }
        }

        // Firma slug oluştur
        const firmSlug = slugify(firm.title || 'firma');
        
        // Telefon numarasını mobil ve sabit hat olarak ayır
        const phoneNumber = firm.phoneNumber || '';
        const isMobile = isMobilePhone(phoneNumber);
        
        // Firma ekle (otomatik onaylı)
        const { error: firmError } = await supabase
          .from('firms')
          .insert({
            name: firm.title || 'İsimsiz Firma',
            slug: firmSlug,
            address: firm.address || null,
            landline_phone: isMobile ? null : phoneNumber,
            mobile_phone: isMobile ? phoneNumber : null,
            website: firm.website || null,
            email: null,
            description: null,
            rating: firm.rating || null,
            category_id: categoryId,
            is_approved: true, // Otomatik onaylı
            added_by: userId || null,
            external_id: firm.position?.toString() || null,
          });

        if (firmError) {
          console.error('Firm insertion error:', firmError);
          results.failed++;
          results.errors.push(`${firm.title}: ${firmError.message}`);
        } else {
          results.success++;
        }
      } catch (error) {
        console.error('Error processing firm:', error);
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${firm.title}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in add-serper-firms function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});