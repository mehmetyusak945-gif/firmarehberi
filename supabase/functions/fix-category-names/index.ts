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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get AI settings
    const { data: aiSettings } = await supabase
      .from("ai_settings")
      .select("*")
      .single();

    const provider = aiSettings?.provider || "lovable";
    const model = aiSettings?.model || "google/gemini-2.5-flash-lite";

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name");

    if (categoriesError) {
      throw new Error(`Kategoriler alınamadı: ${categoriesError.message}`);
    }

    const results = [];
    let apiKey: string;
    let apiUrl: string;

    if (provider === "google" && aiSettings?.api_key) {
      apiKey = aiSettings.api_key;
      apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model.replace("google/", "") + ":generateContent";
    } else if (provider === "openai" && aiSettings?.api_key) {
      apiKey = aiSettings.api_key;
      apiUrl = "https://api.openai.com/v1/chat/completions";
    } else {
      apiKey = Deno.env.get("LOVABLE_API_KEY")!;
      if (!apiKey) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    }

    // Fix each category name
    for (const category of categories || []) {
      try {
        let fixedName: string;

        if (provider === "google" && aiSettings?.api_key) {
          const response = await fetch(apiUrl + "?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `"${category.name}" kelimesini Türkçe yazım kurallarına göre düzelt. SADECE düzeltilmiş kelimeyi yaz, başka bir şey yazma. Örnek: "Kuafor" -> "Kuaför", "Elektrikci" -> "Elektrikçi"`
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 50,
              }
            }),
          });

          if (!response.ok) {
            console.error(`Google API error for ${category.name}:`, response.status);
            fixedName = category.name;
          } else {
            const data = await response.json();
            fixedName = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || category.name;
          }
        } else if (provider === "openai" && aiSettings?.api_key) {
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
                  content: "Sen bir Türkçe dil uzmanısın. Verilen kelimenin Türkçe yazım kurallarına uygun halini yazıyorsun. SADECE düzeltilmiş kelimeyi yaz, başka bir şey yazma.",
                },
                {
                  role: "user",
                  content: `"${category.name}" kelimesini Türkçe yazım kurallarına göre düzelt. Örnek: "Kuafor" -> "Kuaför", "Elektrikci" -> "Elektrikçi"`,
                },
              ],
              max_completion_tokens: 50,
            }),
          });

          if (!response.ok) {
            console.error(`OpenAI API error for ${category.name}:`, response.status);
            fixedName = category.name;
          } else {
            const data = await response.json();
            fixedName = data.choices?.[0]?.message?.content?.trim() || category.name;
          }
        } else {
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
                  content: "Sen bir Türkçe dil uzmanısın. Verilen kelimenin Türkçe yazım kurallarına uygun halini yazıyorsun. SADECE düzeltilmiş kelimeyi yaz, başka bir şey yazma.",
                },
                {
                  role: "user",
                  content: `"${category.name}" kelimesini Türkçe yazım kurallarına göre düzelt. Örnek: "Kuafor" -> "Kuaför", "Elektrikci" -> "Elektrikçi"`,
                },
              ],
            }),
          });

          if (!response.ok) {
            console.error(`AI API error for ${category.name}:`, response.status);
            fixedName = category.name;
          } else {
            const data = await response.json();
            fixedName = data.choices?.[0]?.message?.content?.trim() || category.name;
          }
        }

        // Clean up the response (remove quotes, extra text)
        fixedName = fixedName.replace(/["""'']/g, '').trim();
        
        // Only update if name actually changed
        if (fixedName !== category.name && fixedName.length > 0) {
          const { error: updateError } = await supabase
            .from("categories")
            .update({ name: fixedName })
            .eq("id", category.id);

          if (updateError) {
            console.error(`Error updating ${category.name}:`, updateError);
            results.push({
              id: category.id,
              oldName: category.name,
              newName: category.name,
              status: "error",
              error: updateError.message
            });
          } else {
            console.log(`Updated: ${category.name} -> ${fixedName}`);
            results.push({
              id: category.id,
              oldName: category.name,
              newName: fixedName,
              status: "updated"
            });
          }
        } else {
          results.push({
            id: category.id,
            oldName: category.name,
            newName: category.name,
            status: "unchanged"
          });
        }
      } catch (error: any) {
        console.error(`Error processing ${category.name}:`, error);
        results.push({
          id: category.id,
          oldName: category.name,
          newName: category.name,
          status: "error",
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        summary: {
          total: results.length,
          updated: results.filter(r => r.status === "updated").length,
          unchanged: results.filter(r => r.status === "unchanged").length,
          errors: results.filter(r => r.status === "error").length,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in fix-category-names:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
