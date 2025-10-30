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

// Kategori adından kategori slug'ı tahmin et - Google Places types'a göre
function guessCategory(name: string, types: string[], query?: string): string {
  const nameLower = name.toLowerCase();
  const typesStr = types.join(' ').toLowerCase();
  
  // Google Places types'a göre genişletilmiş kategori eşleştirmeleri
  const categoryMap: { [key: string]: string[] } = {
    'restoran': ['restaurant', 'restoran', 'yemek', 'lokanta', 'food', 'meal_delivery', 'meal_takeaway'],
    'kafe': ['cafe', 'kafe', 'kahve', 'coffee', 'coffee_shop'],
    'otel': ['lodging', 'otel', 'hotel', 'konaklama', 'motel', 'resort'],
    'market': ['supermarket', 'market', 'bakkal', 'grocery', 'grocery_or_supermarket', 'convenience_store'],
    'eczane': ['pharmacy', 'eczane', 'ilac', 'drugstore'],
    'hastane': ['hospital', 'hastane', 'saglik', 'health', 'doctor', 'clinic', 'medical'],
    'okul': ['school', 'okul', 'egitim', 'education', 'university', 'primary_school', 'secondary_school'],
    'spor-salonu': ['gym', 'spor', 'fitness', 'health_club', 'fitness_center'],
    'kuafor': ['hair_care', 'kuafor', 'berber', 'hair', 'beauty', 'beauty_salon', 'guzellik', 'barber'],
    'oto-tamir': ['car_repair', 'oto', 'araba', 'tamir', 'mechanic', 'auto_repair'],
    'telefon-tamircisi': ['electronics_store', 'telefon', 'phone', 'gsm', 'mobile', 'electronics', 'cell_phone_store'],
    'avukat': ['lawyer', 'avukat', 'hukuk', 'legal', 'attorney'],
    'doktor': ['doctor', 'doktor', 'dr', 'physician'],
    'dis-hekimi': ['dentist', 'dis', 'dental', 'dis_hekimi'],
    'muhasebe': ['accounting', 'muhasebe', 'muhasebecilik', 'accountant'],
    'emlak': ['real_estate_agency', 'emlak', 'gayrimenkul', 'real_estate'],
    'banka': ['bank', 'banka', 'atm', 'finance'],
    'alisveris-merkezi': ['shopping_mall', 'alisveris', 'avm', 'mall', 'shopping_center'],
    'kuyumcu': ['jewelry_store', 'kuyumcu', 'jewelry', 'jeweler'],
    'pastane': ['bakery', 'pastane', 'firin', 'patisserie'],
    'otopark': ['parking', 'otopark', 'park'],
    'sinema': ['movie_theater', 'sinema', 'cinema'],
    'kütüphane': ['library', 'kütüphane', 'kutuphane'],
    'müze': ['museum', 'müze', 'muze'],
    'park': ['park', 'park'],
    'benzin-istasyonu': ['gas_station', 'benzin', 'fuel', 'petrol'],
    'oto-yikama': ['car_wash', 'oto_yikama', 'yikama'],
    'veteriner': ['veterinary_care', 'veteriner', 'vet'],
    'evcil-hayvan': ['pet_store', 'evcil', 'pet'],
    'cicekci': ['florist', 'cicekci', 'cicek', 'flower'],
    'ayakkabi': ['shoe_store', 'ayakkabi'],
    'giyim': ['clothing_store', 'giyim', 'butik', 'fashion'],
    'mobilya': ['furniture_store', 'mobilya', 'furniture'],
    'ev-esyalari': ['home_goods_store', 'ev_esyalari', 'home'],
    'berber': ['barber', 'berber'],
    'guzellik-salonu': ['beauty_salon', 'guzellik', 'beauty'],
    'spa': ['spa', 'spa', 'massage'],
    'sigara': ['tobacco_shop', 'sigara', 'tobacco'],
    'kirtasiye': ['book_store', 'kirtasiye', 'stationery'],
    'cami': ['mosque', 'cami'],
    'kilise': ['church', 'kilise'],
    'postane': ['post_office', 'postane', 'ptt'],
    'belediye': ['local_government_office', 'belediye', 'government'],
    'polis': ['police', 'polis', 'karakol'],
  };

  // Önce types'ta eşleşme ara (daha doğru sonuç verir)
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (typesStr.includes(keyword)) {
        return category;
      }
    }
  }

  // Types'ta bulamazsa isme bak
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
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
  // Adres yoksa
  if (!address) {
    // Şehir veya ilçe belirtilmemişse kabul et
    return !city && !district;
  }
  
  const addressLower = address.toLowerCase();
  
  // Şehir kontrolü - daha esnek
  if (city) {
    const cityLower = city.toLowerCase();
    
    // İstanbul için özel kontrol - posta kodu ile de kontrol et (34xxx = İstanbul)
    if (cityLower === 'istanbul' || cityLower === 'i̇stanbul') {
      const hasIstanbul = addressLower.includes('istanbul') || addressLower.includes('i̇stanbul');
      const hasIstanbulPostalCode = /\b34\d{3}\b/.test(address);
      
      if (!hasIstanbul && !hasIstanbulPostalCode) {
        console.log(`City mismatch: looking for "${city}" in "${address}"`);
        return false;
      }
    } else {
      // Diğer şehirler için normal kontrol
      if (!addressLower.includes(cityLower)) {
        console.log(`City mismatch: looking for "${city}" in "${address}"`);
        return false;
      }
    }
  }
  
  // İlçe kontrolü - OPSIYONEL ve daha esnek
  // Google Places yakındaki ilçelerdeki firmaları da döndürebilir
  // O yüzden ilçe kontrolünü gevşek tutuyoruz
  if (district) {
    const districtLower = district.toLowerCase();
    // İlçe kontrolü yapmıyoruz, sadece log alıyoruz
    if (!addressLower.includes(districtLower)) {
      console.log(`District info: "${district}" not in "${address}" but accepting (Google may return nearby)`);
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
          // Kategori adı olarak query'yi kullan (Türkçe karakterler korunur)
          // Eğer query yoksa slug'dan oluştur
          const categoryName = query || categorySlug
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
        const externalId = `${timestamp}-${firm.position || Math.random().toString(36).substr(2, 9)}`;
        
        // Firma slug oluştur - ID + Firma İsmi + İl + İlçe
        const nameSlug = slugify(firm.title || 'firma');
        const locationParts = [];
        if (city) locationParts.push(slugify(city));
        if (district) locationParts.push(slugify(district));
        
        // ID slug'ın başına ekleniyor
        const idPrefix = `${timestamp}-${firm.position || Math.random().toString(36).substr(2, 9)}`;
        const locationSuffix = locationParts.length > 0 ? `-${locationParts.join('-')}` : '';

        let finalSlug = `${idPrefix}-${nameSlug}${locationSuffix}`;
        
        // Eğer çakışma varsa sayı ekle
        let counter = 1;
        let tempSlug = finalSlug;
        while (existingSlugs.has(tempSlug)) {
          tempSlug = `${idPrefix}-${nameSlug}${locationSuffix}-${counter}`;
          counter++;
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