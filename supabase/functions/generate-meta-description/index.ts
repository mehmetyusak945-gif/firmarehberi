import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { firmName, categoryName, firmId } = await req.json()

    if (!firmName || !categoryName) {
      throw new Error('Firma ismi ve kategori gerekli')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if meta description already exists in database
    if (firmId) {
      const { data: existingFirm } = await supabase
        .from("firms")
        .select("ai_meta_description")
        .eq("id", firmId)
        .single();

      if (existingFirm?.ai_meta_description) {
        return new Response(
          JSON.stringify({ 
            metaDescription: existingFirm.ai_meta_description,
            length: existingFirm.ai_meta_description.length 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Get AI settings
    const { data: aiSettings } = await supabase
      .from("ai_settings")
      .select("*")
      .single();

    const provider = aiSettings?.provider || "lovable";
    const model = aiSettings?.model || "google/gemini-2.5-flash";

    console.log(`Generating meta description for: ${firmName} - ${categoryName}`)

    let metaDescription: string;

    if (provider === "google" && aiSettings?.api_key) {
      // Direct Google API call
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model.replace("google/", "") + ":generateContent";
      const response = await fetch(apiUrl + "?key=" + aiSettings.api_key, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `"${firmName}" firması için SEO meta description yaz. Kategori: ${categoryName}. 

ZORUNLU KURALLAR:
- 130-155 karakter arası olmalı
- Düz metin olarak yaz, hiçbir özel karakter kullanma
- Markdown formatı kullanma (**, *, _, #, vb.)
- Tırnak işareti, yıldız, nokta virgül gibi özel karakterler kullanma
- Sadece normal cümle yazımı, nokta ve virgül kullanabilirsin
- Firma adı ve kategori içermeli
- Türkçe olmalı`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limit exceeded')
          throw new Error('AI hizmetinde yoğunluk var, lütfen daha sonra tekrar deneyin')
        }
        const errorText = await response.text()
        console.error('Google API error:', response.status, errorText)
        throw new Error('AI hizmetinde bir hata oluştu')
      }

      const data = await response.json()
      metaDescription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } else if (provider === "openai" && aiSettings?.api_key) {
      // Direct OpenAI API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiSettings.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: "Sen bir SEO uzmanısın. Meta description yazıyorsun. ÇOK ÖNEMLİ: Sadece düz metin yaz. Markdown formatı kullanma (**, *, _, # gibi). Hiçbir özel karakter kullanma. 130-155 karakter arasında olmalı. Firma adı ve kategori içermeli.",
            },
            {
              role: 'user',
              content: `"${firmName}" firması için meta description yaz. Kategori: ${categoryName}. 

ZORUNLU KURALLAR:
- 130-155 karakter arası
- Düz metin, hiçbir markdown formatı yok (**, *, _, # yasak)
- Hiçbir özel karakter kullanma (sadece normal nokta ve virgül kullan)
- Firma adı ve kategori içermeli
- Türkçe`,
            },
          ],
          max_completion_tokens: 100,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limit exceeded')
          throw new Error('AI hizmetinde yoğunluk var, lütfen daha sonra tekrar deneyin')
        }
        const errorText = await response.text()
        console.error('OpenAI API error:', response.status, errorText)
        throw new Error('AI hizmetinde bir hata oluştu')
      }

      const data = await response.json()
      metaDescription = data.choices?.[0]?.message?.content?.trim() || '';
    } else {
      // Use Lovable AI Gateway
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured')
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: "Sen bir SEO uzmanısın. Meta description yazıyorsun. ÇOK ÖNEMLİ: Sadece düz metin yaz. Markdown formatı kullanma (**, *, _, # gibi). Hiçbir özel karakter kullanma. 130-155 karakter arasında olmalı. Firma adı ve kategori içermeli.",
            },
            {
              role: 'user',
              content: `"${firmName}" firması için meta description yaz. Kategori: ${categoryName}. 

ZORUNLU KURALLAR:
- 130-155 karakter arası
- Düz metin, hiçbir markdown formatı yok (**, *, _, # yasak)
- Hiçbir özel karakter kullanma (sadece normal nokta ve virgül kullan)
- Firma adı ve kategori içermeli
- Türkçe`,
            },
          ],
          temperature: 0.9,
          max_tokens: 100,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limit exceeded')
          throw new Error('AI hizmetinde yoğunluk var, lütfen daha sonra tekrar deneyin')
        }
        if (response.status === 402) {
          console.error('Payment required')
          throw new Error('AI kredisi yetersiz')
        }
        const errorText = await response.text()
        console.error('AI gateway error:', response.status, errorText)
        throw new Error('AI hizmetinde bir hata oluştu')
      }

      const data = await response.json()
      metaDescription = data.choices?.[0]?.message?.content?.trim() || '';
    }

    if (!metaDescription) {
      throw new Error('Meta açıklama oluşturulamadı')
    }

    // Özel karakterleri temizle (markdown formatlarını kaldır)
    let finalDescription = metaDescription
      .replace(/\*\*/g, '') // ** işaretlerini kaldır
      .replace(/\*/g, '')   // * işaretlerini kaldır
      .replace(/_/g, '')    // _ işaretlerini kaldır
      .replace(/#/g, '')    // # işaretlerini kaldır
      .replace(/\[/g, '')   // [ işaretlerini kaldır
      .replace(/\]/g, '')   // ] işaretlerini kaldır
      .replace(/`/g, '')    // ` işaretlerini kaldır
      .trim();
    
    // Karakter sayısını kontrol et ve gerekirse kısalt
    if (finalDescription.length > 155) {
      finalDescription = finalDescription.substring(0, 152) + '...'
    } else if (finalDescription.length < 130) {
      // Çok kısa ise basit bir meta açıklama oluştur
      finalDescription = `${firmName} - ${categoryName} hizmetleri için güvenilir ve kaliteli çözümler. Detaylı bilgi ve iletişim için hemen inceleyin!`
      if (finalDescription.length > 155) {
        finalDescription = finalDescription.substring(0, 152) + '...'
      }
    }

    console.log(`Generated meta description (${finalDescription.length} chars): ${finalDescription}`)

    // Save meta description to database if firmId is provided
    if (firmId && finalDescription) {
      await supabase
        .from("firms")
        .update({ ai_meta_description: finalDescription })
        .eq("id", firmId);
    }

    return new Response(
      JSON.stringify({ 
        metaDescription: finalDescription,
        length: finalDescription.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error generating meta description:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
