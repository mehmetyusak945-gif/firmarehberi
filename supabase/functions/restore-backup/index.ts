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

    // Now use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { backupData } = await req.json()

    if (!backupData || !backupData.data) {
      throw new Error('Invalid backup data format')
    }

    console.log('Starting database restore...')

    // Delete existing data
    console.log('Deleting existing firms...')
    const { error: deleteFirmsError } = await supabaseClient
      .from('firms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteFirmsError) {
      console.error('Error deleting firms:', deleteFirmsError)
      throw deleteFirmsError
    }

    console.log('Deleting existing categories...')
    const { error: deleteCategoriesError } = await supabaseClient
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteCategoriesError) {
      console.error('Error deleting categories:', deleteCategoriesError)
      throw deleteCategoriesError
    }

    console.log('Deleting existing ad codes...')
    const { error: deleteAdCodesError } = await supabaseClient
      .from('ad_codes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteAdCodesError) {
      console.error('Error deleting ad codes:', deleteAdCodesError)
      throw deleteAdCodesError
    }

    // Insert categories first (firms depend on categories)
    if (backupData.data.categories && backupData.data.categories.length > 0) {
      console.log(`Inserting ${backupData.data.categories.length} categories...`)
      const { error: insertCategoriesError } = await supabaseClient
        .from('categories')
        .insert(backupData.data.categories)

      if (insertCategoriesError) {
        console.error('Error inserting categories:', insertCategoriesError)
        throw insertCategoriesError
      }
    }

    // Insert firms
    if (backupData.data.firms && backupData.data.firms.length > 0) {
      console.log(`Inserting ${backupData.data.firms.length} firms...`)
      const { error: insertFirmsError } = await supabaseClient
        .from('firms')
        .insert(backupData.data.firms)

      if (insertFirmsError) {
        console.error('Error inserting firms:', insertFirmsError)
        throw insertFirmsError
      }
    }

    // Insert ad codes
    if (backupData.data.ad_codes && backupData.data.ad_codes.length > 0) {
      console.log(`Inserting ${backupData.data.ad_codes.length} ad codes...`)
      const { error: insertAdCodesError } = await supabaseClient
        .from('ad_codes')
        .insert(backupData.data.ad_codes)

      if (insertAdCodesError) {
        console.error('Error inserting ad codes:', insertAdCodesError)
        throw insertAdCodesError
      }
    }

    console.log('Database restore completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Yedek başarıyla geri yüklendi'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error restoring backup:', error)
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
