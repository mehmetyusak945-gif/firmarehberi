import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { csvData } = await req.json()

    if (!csvData) {
      throw new Error('CSV data is required')
    }

    console.log('Parsing CSV data...')

    // Parse CSV - Sütunlar: ID;İsim;Adres;Telefon;Website;Puan;Kategori
    const firms = parseCSV(csvData)

    console.log(`Parsed ${firms.length} firms from CSV`)

    // Get or create categories and prepare firms
    const categoryMap = new Map<string, string>()
    const uniqueCategories = [...new Set(firms.map(f => f.category))]

    console.log(`Found ${uniqueCategories.length} unique categories`)

    // Get existing categories
    const { data: existingCategories } = await supabaseClient
      .from('categories')
      .select('id, name, slug')

    existingCategories?.forEach(cat => {
      categoryMap.set(cat.name, cat.id)
    })

    // Create new categories if needed
    for (const categoryName of uniqueCategories) {
      if (!categoryMap.has(categoryName)) {
        const { data: newCategory, error: catError } = await supabaseClient
          .from('categories')
          .insert({ 
            name: categoryName, 
            slug: slugify(categoryName) 
          })
          .select()
          .single()

        if (!catError && newCategory) {
          categoryMap.set(categoryName, newCategory.id)
          console.log(`Created new category: ${categoryName}`)
        }
      }
    }

    // Prepare firms with category_id
    const firmsToInsert = firms.map(firm => ({
      external_id: firm.external_id,
      name: firm.name,
      slug: slugify(firm.name),
      address: firm.address || null,
      phone: firm.phone || null,
      website: firm.website || null,
      rating: firm.rating || 0,
      category_id: categoryMap.get(firm.category) || null,
      is_approved: true,
      added_by: null, // Admin import
    }))

    // Insert or update firms (upsert on external_id)
    const { data, error: insertError } = await supabaseClient
      .from('firms')
      .upsert(firmsToInsert, { 
        onConflict: 'external_id',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      console.error('Error inserting firms:', insertError)
      throw insertError
    }

    console.log(`Successfully processed ${data?.length || 0} firms`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data?.length || 0,
        message: `Successfully imported ${data?.length || 0} firms` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error uploading firms:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n')
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows')
  }
  
  // Skip header row - Sütunlar: ID;İsim;Adres;Telefon;Website;Puan;Kategori
  const dataLines = lines.slice(1)
  
  console.log(`Parsing ${dataLines.length} data rows`)
  
  return dataLines
    .filter(line => line.trim())
    .map((line, index) => {
      // Split by semicolon (Turkish Excel uses semicolon)
      const values = line.split(';').map(v => v.trim())
      
      if (values.length < 7) {
        console.warn(`Row ${index + 2} has insufficient columns:`, values.length)
        return null
      }
      
      // Parse rating - handle decimal comma (Turkish format)
      let rating = 0
      if (values[5]) {
        const ratingStr = values[5].replace(',', '.')
        rating = parseFloat(ratingStr) || 0
      }
      
      return {
        external_id: values[0] || null,
        name: values[1] || '',
        address: values[2] || null,
        phone: values[3] || null,
        website: values[4] || null,
        rating: rating,
        category: values[6] || '',
      }
    })
    .filter(firm => firm && firm.name && firm.category) // Only include valid firms
}
