import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { firmName, categoryName } = await req.json()

    if (!firmName || !categoryName) {
      throw new Error('Firma ismi ve kategori gerekli')
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    console.log(`Generating meta description for: ${firmName} - ${categoryName}`)

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Sen profesyonel bir SEO uzmanısın. Görevin yerel işletmeler için SEO odaklı meta açıklamaları oluşturmak. 

KURALLAR:
- Meta açıklama tam olarak 130-155 karakter arasında olmalı
- Firma ismini ve kategoriyi mutlaka içermeli
- Harekete geçirici (call-to-action) bir ifade içermeli
- Doğal ve akıcı Türkçe kullan
- Anahtar kelimeleri doğal bir şekilde yerleştir
- Sadece meta açıklamayı döndür, başka hiçbir şey yazma`
          },
          {
            role: 'user',
            content: `Firma: ${firmName}\nKategori: ${categoryName}\n\nBu firma için 130-155 karakter arası SEO odaklı bir meta açıklama oluştur.`
          }
        ],
        temperature: 0.8,
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
    const metaDescription = data.choices?.[0]?.message?.content?.trim()

    if (!metaDescription) {
      throw new Error('Meta açıklama oluşturulamadı')
    }

    // Karakter sayısını kontrol et ve gerekirse kısalt
    let finalDescription = metaDescription
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
