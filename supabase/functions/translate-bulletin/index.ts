// Translates bulletin item titles and descriptions into a target language
// using Lovable AI (Gemini Flash). Caches results in bulletin_translations table.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  hi: "Hindi",
  pa: "Punjabi",
  bn: "Bengali",
  ta: "Tamil",
  en: "English",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { items, language } = await req.json() as {
      items: Array<{ id: string; title: string; description: string }>;
      language: string;
    };

    if (!items?.length || !language || language === "en") {
      return new Response(JSON.stringify({ translated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = LANG_NAMES[language] || language;

    // Check which items already have translations
    const ids = items.map((i) => i.id);
    const { data: existing } = await supabase
      .from("bulletin_translations")
      .select("bulletin_id")
      .in("bulletin_id", ids)
      .eq("language", language);

    const existingIds = new Set((existing || []).map((e) => e.bulletin_id));
    const toTranslate = items.filter((i) => !existingIds.has(i.id));

    if (toTranslate.length === 0) {
      return new Response(JSON.stringify({ translated: 0, skipped: items.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch translate up to 10 at a time
    const batch = toTranslate.slice(0, 10);
    const prompt = `Translate the following news headlines and descriptions into ${langName}. 
Return a JSON array with objects having "id", "title", "description" fields.
Keep translations simple and natural for rural Indian readers.
Only return the JSON array, nothing else.

Items to translate:
${JSON.stringify(batch.map((b) => ({ id: b.id, title: b.title, description: b.description.slice(0, 200) })))}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a professional translator for Indian languages. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI translation failed:", aiResp.status, errText);
      return new Response(JSON.stringify({ error: "Translation API failed", status: aiResp.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse AI translation response:", content.slice(0, 500));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const translations: Array<{ id: string; title: string; description: string }> = JSON.parse(jsonMatch[0]);

    // Upsert translations
    const rows = translations
      .filter((t) => t.id && t.title)
      .map((t) => ({
        bulletin_id: t.id,
        language,
        title: t.title,
        description: t.description || "",
      }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from("bulletin_translations")
        .upsert(rows, { onConflict: "bulletin_id,language", ignoreDuplicates: true });
      if (error) console.error("Translation upsert error:", error);
    }

    return new Response(JSON.stringify({ translated: rows.length, total: batch.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-bulletin error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
