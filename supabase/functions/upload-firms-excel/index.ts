import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function generateAIDescription(name: string, category: string): Promise<string> {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return "Kaliteli hizmet sunan güvenilir bir firma.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Sen bir firma açıklaması yazan profesyonel bir yazarsın. Kısa, özlü ve ilgi çekici açıklamalar yazarsın. Açıklamalar 2-3 cümle olmalı ve firmanın hizmetlerini vurgulamalı.",
          },
          {
            role: "user",
            content: `${category} kategorisindeki "${name}" firması için kısa ve profesyonel bir açıklama yaz. Türkçe olmalı.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return "Kaliteli hizmet sunan güvenilir bir firma.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Kaliteli hizmet sunan güvenilir bir firma.";
  } catch (error) {
    console.error("Error generating AI description:", error);
    return "Kaliteli hizmet sunan güvenilir bir firma.";
  }
}

function parseCSV(text: string): any[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, userId, isAdmin } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const rows = parseCSV(fileContent);

    let successCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const name = row.name || row.Name || row.NAME;
        const category = row.category || row.Category || row.CATEGORY;
        
        if (!name || !category) {
          errors.push(`Satır atlandı: İsim veya kategori eksik`);
          continue;
        }

        // Generate AI description
        const description = await generateAIDescription(name, category);
        
        const slug = slugify(name);
        const createdAt = row.created_at || row.Created_at || new Date().toISOString();

        const { error } = await supabase.from("firms").insert({
          name,
          category,
          address: row.address || row.Address || "",
          phone: row.phone || row.Phone || "",
          website: row.website || row.Website || "",
          email: row.email || row.Email || "",
          description,
          slug: `${slug}-${Date.now()}`,
          added_by: userId,
          is_approved: isAdmin,
          created_at: createdAt,
        });

        if (error) {
          errors.push(`${name}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (error: any) {
        errors.push(`Satır hatası: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        count: successCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in upload-firms-excel:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
