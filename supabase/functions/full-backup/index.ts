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

    console.log('Starting full database backup...')

    // List of all tables to backup
    const tables = [
      'firms',
      'categories',
      'ad_codes',
      'ai_settings',
      'contact_messages',
      'firm_reports',
      'pages',
      'profiles',
      'serper_settings',
      'user_roles',
      'webmaster_settings'
    ]

    const backupData: Record<string, any[]> = {}

    // Fetch data from each table
    for (const table of tables) {
      console.log(`Backing up table: ${table}`)
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')

      if (error) {
        console.error(`Error backing up ${table}:`, error)
        throw new Error(`Failed to backup ${table}: ${error.message}`)
      }

      backupData[table] = data || []
      console.log(`Backed up ${data?.length || 0} rows from ${table}`)
    }

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: tables,
      data: backupData,
    }

    console.log('Full database backup completed successfully')

    return new Response(
      JSON.stringify(backup),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating full backup:', error)
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
