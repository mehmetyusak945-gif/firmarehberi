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

// Konum filtreleme - adres belirtilen şehir/ilçeyi içeriyor mu?
function matchesLocation(address: string, city?: string, district?: string): boolean {
  if (!address) return false; // Adres yoksa filtrele
  
  const addressLower = address.toLowerCase();
  
  // Önce şehir kontrolü - bu zorunlu
  if (city) {
    const cityLower = city.toLowerCase();
    // Şehir adı adreste geçmiyorsa filtrele
    if (!addressLower.includes(cityLower)) {
      return false;
    }
  }
  
  // İlçe opsiyonel - belirtilmişse kontrol et
  if (district) {
    const districtLower = district.toLowerCase();
    if (!addressLower.includes(districtLower)) {
      console.log(`District mismatch: looking for "${district}" in "${address}"`);
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

    // Get existing slugs to avoid conflicts
    const { data: existingFirms } = await supabase
      .from('firms')
      .select('slug, external_id, name');
    
    const existingSlugs = new Set(existingFirms?.map(f => f.slug) || []);
    const existingExternalIds = new Set(existingFirms?.map(f => f.external_id) || []);
    // Also check by name to avoid exact duplicates
    const existingNames = new Set(existingFirms?.map(f => f.name.toLowerCase()) || []);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      categoriesCreated: [] as string[],
    };

    for (const firm of firms) {
      try {
        // İsim kontrolü - aynı isimde firma varsa atla
        const firmNameLower = (firm.title || '').toLowerCase();
        if (existingNames.has(firmNameLower)) {
          console.log(`Skipping ${firm.title} - firm with same name already exists`);
          results.failed++;
          results.errors.push(`${firm.title}: Aynı isimde firma zaten mevcut`);
          continue;
        }

        // Konum filtrele
        if (!matchesLocation(firm.address, city, district)) {
          console.log(`Skipping ${firm.title} - location mismatch: ${firm.address}`);
          results.failed++;
          results.errors.push(`${firm.title}: Konum eşleşmedi (${firm.address})`);
          continue;
        }

        // Kategori slug'ı tahmin et veya query'den oluştur
        const categorySlug = guessCategory(
          firm.title || '',
          firm.types || [],
          query
        );

        // Kategori yoksa oluştur (CSV ile aynı mantık)
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

        // External ID'yi benzersiz yap (timestamp + position)
        const timestamp = Date.now();
        const externalId = `serper-${timestamp}-${firm.position || Math.random().toString(36).substr(2, 9)}`;
        
        // Firma slug oluştur (CSV ile birebir aynı mantık)
        const nameSlug = slugify(firm.title || 'firma');
        let finalSlug: string;
        
        // External ID + isim slug formatı
        finalSlug = `${externalId}-${nameSlug}`;
        
        // Eğer çakışma varsa sayı ekle
        let counter = 0;
        let tempSlug = finalSlug;
        while (existingSlugs.has(tempSlug)) {
          counter++;
          tempSlug = `${finalSlug}-${counter}`;
        }
        finalSlug = tempSlug;
        
        existingSlugs.add(finalSlug); // Batch içinde çakışmayı önle
        existingNames.add(firmNameLower); // İsim kontrolü için ekle
        
        // Telefon numarasını mobil ve sabit hat olarak ayır (CSV ile aynı mantık)
        const phoneNumber = firm.phoneNumber || '';
        let landline_phone = null;
        let mobile_phone = null;
        
        if (phoneNumber) {
          const cleanPhone = phoneNumber.replace(/\D/g, '');
          if (cleanPhone.startsWith('05')) {
            mobile_phone = phoneNumber;
          } else {
            landline_phone = phoneNumber;
          }
        }
        
        // Firma ekle (CSV ile birebir aynı yapı)
        const { error: firmError } = await supabase
          .from('firms')
          .insert({
            external_id: externalId || finalSlug, // CSV ile aynı mantık
            name: firm.title || 'İsimsiz Firma',
            slug: finalSlug,
            address: firm.address || null,
            landline_phone: landline_phone,
            mobile_phone: mobile_phone,
            website: firm.website || null,
            email: null,
            description: null,
            rating: firm.rating || 0, // CSV'de default 0
            category_id: categoryId,
            is_approved: true,
            added_by: userId || null,
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