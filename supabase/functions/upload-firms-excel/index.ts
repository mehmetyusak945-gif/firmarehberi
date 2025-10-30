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
    // Get JWT from authorization header
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Create client with user's token to check their role
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader || '' } } }
    )

    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await userClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: roleData } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Now use service role key for database operations
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

function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateAndTruncate(value: string, maxLength: number): string {
  const trimmed = value.trim()
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed
}

function parseCSV(csvText: string): any[] {
  // Validate file size (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (csvText.length > MAX_FILE_SIZE) {
    throw new Error('CSV file too large. Maximum size is 10MB.')
  }

  const lines = csvText.trim().split('\n')
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows')
  }
  
  // Skip header row - Sütunlar: ID;İsim;Adres;Telefon;Website;Puan;Kategori
  const dataLines = lines.slice(1)
  
  // Validate row count (10,000 row limit)
  const MAX_ROWS = 10000
  if (dataLines.length > MAX_ROWS) {
    throw new Error(`Too many rows. Maximum ${MAX_ROWS} rows allowed.`)
  }
  
  console.log(`Parsing ${dataLines.length} data rows`)
  
  // Field length limits
  const MAX_LENGTHS = {
    external_id: 100,
    name: 255,
    address: 500,
    phone: 50,
    website: 255,
    category: 100
  }
  
  return dataLines
    .filter(line => line.trim())
    .map((line, index) => {
      // Split by semicolon (Turkish Excel uses semicolon)
      const values = line.split(';').map(v => v.trim())
      
      if (values.length < 7) {
        console.warn(`Row ${index + 2} has insufficient columns:`, values.length)
        return null
      }
      
      // Validate and sanitize external_id
      const external_id = values[0] ? validateAndTruncate(values[0], MAX_LENGTHS.external_id) : null
      
      // Validate and sanitize name (required)
      const name = validateAndTruncate(values[1] || '', MAX_LENGTHS.name)
      if (!name || name.length < 2) {
        console.warn(`Row ${index + 2}: Name is too short or empty`)
        return null
      }
      
      // Validate and sanitize address
      const address = values[2] ? validateAndTruncate(values[2], MAX_LENGTHS.address) : null
      
      // Validate and sanitize phone
      let phone = values[3] ? validateAndTruncate(values[3], MAX_LENGTHS.phone) : null
      if (phone && !/^[0-9\s\-\+\(\)]+$/.test(phone)) {
        console.warn(`Row ${index + 2}: Invalid phone format, skipping phone`)
        phone = null
      }
      
      // Validate and sanitize website
      let website = values[4] ? validateAndTruncate(values[4], MAX_LENGTHS.website) : null
      if (website && !isValidURL(website)) {
        console.warn(`Row ${index + 2}: Invalid website URL, skipping website`)
        website = null
      }
      
      // Parse and validate rating (0-5 range)
      let rating = 0
      if (values[5]) {
        const ratingStr = values[5].replace(',', '.')
        rating = parseFloat(ratingStr) || 0
        // Clamp rating between 0 and 5
        rating = Math.max(0, Math.min(5, rating))
      }
      
      // Validate and sanitize category (required)
      const category = validateAndTruncate(values[6] || '', MAX_LENGTHS.category)
      if (!category || category.length < 2) {
        console.warn(`Row ${index + 2}: Category is too short or empty`)
        return null
      }
      
      return {
        external_id,
        name,
        address,
        phone,
        website,
        rating,
        category,
      }
    })
    .filter(firm => firm !== null) // Only include valid firms
}
