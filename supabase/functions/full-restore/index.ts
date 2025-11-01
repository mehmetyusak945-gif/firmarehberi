import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Now use service role key for database operations (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )

    const { backupData } = await req.json()

    if (!backupData || !backupData.data) {
      throw new Error('Invalid backup data format')
    }

    console.log('Starting full database restore...')

    // Order matters for foreign key constraints
    // Delete in reverse order of dependencies
    const deleteOrder = [
      'firm_reports',
      'contact_messages',
      'firms',
      'pages',
      'categories',
      'ad_codes',
      'ai_settings',
      'serper_settings',
      'webmaster_settings',
      'user_roles',
      'profiles',
    ]

    // Delete existing data
    for (const table of deleteOrder) {
      console.log(`Deleting existing data from ${table}...`)
      const { error } = await supabaseClient
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        console.error(`Error deleting ${table}:`, error)
        // Continue with other tables even if one fails
      }
    }

    // Insert in correct order (respecting foreign keys)
    const insertOrder = [
      'profiles',
      'user_roles',
      'categories',
      'firms',
      'ad_codes',
      'ai_settings',
      'contact_messages',
      'firm_reports',
      'pages',
      'serper_settings',
      'webmaster_settings',
    ]

    // Insert data for each table
    for (const table of insertOrder) {
      if (backupData.data[table] && backupData.data[table].length > 0) {
        console.log(`Inserting ${backupData.data[table].length} rows into ${table}...`)
        
        // Insert in batches of 100 to avoid size limits
        const batchSize = 100
        const data = backupData.data[table]
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)
          const { error } = await supabaseClient
            .from(table)
            .insert(batch)

          if (error) {
            console.error(`Error inserting into ${table} batch ${i / batchSize + 1}:`, error)
            throw error
          }
          console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(data.length / batchSize)} for ${table}`)
        }
      }
    }

    console.log('Full database restore completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Veritabanı başarıyla geri yüklendi'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error restoring database:', error)
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
