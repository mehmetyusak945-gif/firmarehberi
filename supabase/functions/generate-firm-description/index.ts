import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, category, firmId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if description already exists in database
    if (firmId) {
      const { data: existingFirm } = await supabase
        .from("firms")
        .select("ai_description")
        .eq("id", firmId)
        .single();

      if (existingFirm?.ai_description) {
        return new Response(
          JSON.stringify({ description: existingFirm.ai_description }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    const model = aiSettings?.model || "google/gemini-2.5-flash-lite";

    let apiKey: string;
    let apiUrl: string;

    if (provider === "google" && aiSettings?.api_key) {
      apiKey = aiSettings.api_key;
      apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model.replace("google/", "") + ":generateContent";
    } else if (provider === "openai" && aiSettings?.api_key) {
      apiKey = aiSettings.api_key;
      apiUrl = "https://api.openai.com/v1/chat/completions";
    } else {
      // Use Lovable AI
      apiKey = Deno.env.get("LOVABLE_API_KEY")!;
      if (!apiKey) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    }

    let description: string;

    if (provider === "google" && aiSettings?.api_key) {
      // Direct Google API call
      const response = await fetch(apiUrl + "?key=" + apiKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `"${name}" adlı ${category} firması için benzersiz ve özgün bir açıklama yaz. 

ZORUNLU KURALLAR:
- Her firma için FARKLI bir açıklama yaz, genel şablonlar kullanma
- "${name}" firma adını ve "${category}" kategorisini MUTLAKA kullan
- Firmanın sunabileceği SPESIFIK hizmetleri detaylandır
- En az 5-6 cümle yaz
- "Kaliteli hizmet", "güvenilir firma" gibi KLİŞE ifadeler kullanma
- Sektöre özgü teknik detaylar ve uzmanlık alanları ekle
- Türkçe karakter kurallarına uy

Bu ${category} firması için profesyonel, detaylı ve BENZERSİZ bir açıklama yaz.`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 250,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Google API error:", response.status, errorText);
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      description = data.candidates?.[0]?.content?.parts?.[0]?.text || "Kaliteli hizmet sunan güvenilir bir firma.";
    } else if (provider === "openai" && aiSettings?.api_key) {
      // Direct OpenAI API call
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "Sen yaratıcı bir içerik yazarısın. Her firma için ÖZGÜN ve FARKLI açıklamalar yazıyorsun. ASLA genel şablonlar veya klişe ifadeler kullanmazsın. Her açıklama o firmaya özgü, detaylı ve benzersiz olmalıdır. Sektöre özel terimler ve detaylar kullanarak profesyonel ama samimi açıklamalar yazarsın.",
            },
            {
              role: "user",
              content: `"${name}" adlı ${category} firması için benzersiz bir açıklama yaz. Firma adını ve kategorisini mutlaka kullan. ${category} sektörüne özgü hizmetleri, uzmanlık alanlarını DETAYLI anlat. En az 5-6 cümle. "Kaliteli hizmet", "güvenilir" gibi KLİŞE ifadelerden KAÇIN. Sektöre özgü teknik detaylar ekle. Bu firma için ÖZGÜN bir metin yaz.`,
            },
          ],
          max_completion_tokens: 250,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      description = data.choices?.[0]?.message?.content || "Kaliteli hizmet sunan güvenilir bir firma.";
    } else {
      // Use Lovable AI Gateway
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "Sen yaratıcı bir içerik yazarısın. Her firma için ÖZGÜN ve FARKLI açıklamalar yazıyorsun. ASLA genel şablonlar veya klişe ifadeler kullanmazsın. Her açıklama o firmaya özgü, detaylı ve benzersiz olmalıdır. Sektöre özel terimler ve detaylar kullanarak profesyonel ama samimi açıklamalar yazarsın.",
            },
            {
              role: "user",
              content: `"${name}" adlı ${category} firması için benzersiz bir açıklama yaz. Firma adını ve kategorisini mutlaka kullan. ${category} sektörüne özgü hizmetleri, uzmanlık alanlarını DETAYLI anlat. En az 5-6 cümle. "Kaliteli hizmet", "güvenilir" gibi KLİŞE ifadelerden KAÇIN. Sektöre özgü teknik detaylar ekle. Bu firma için ÖZGÜN bir metin yaz.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", response.status, errorText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      description = data.choices?.[0]?.message?.content || "Kaliteli hizmet sunan güvenilir bir firma.";
    }

    // Save description to database if firmId is provided
    if (firmId && description) {
      await supabase
        .from("firms")
        .update({ ai_description: description })
        .eq("id", firmId);
    }

    return new Response(
      JSON.stringify({ description }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-firm-description:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
