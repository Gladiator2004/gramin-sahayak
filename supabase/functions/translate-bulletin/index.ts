// Translates bulletin item titles and descriptions into a target language
// using Lovable AI (Gemini Flash). Caches results in bulletin_translations
// and returns the translated rows so callers can apply them immediately.
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

const BATCH_SIZE = 30;

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
      return new Response(JSON.stringify({ translations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured", translations: [] }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = LANG_NAMES[language] || language;
    const ids = items.map((i) => i.id);

    // Pull existing translations (return them as-is)
    const { data: existing } = await supabase
      .from("bulletin_translations")
      .select("bulletin_id, title, description")
      .in("bulletin_id", ids)
      .eq("language", language);

    const existingMap = new Map<string, { title: string; description: string }>();
    for (const r of existing || []) existingMap.set(r.bulletin_id, { title: r.title, description: r.description });

    const toTranslate = items.filter((i) => !existingMap.has(i.id)).slice(0, BATCH_SIZE);

    let newRows: Array<{ bulletin_id: string; language: string; title: string; description: string }> = [];

    if (toTranslate.length > 0) {
      const prompt = `Translate each item's title and description into ${langName}.
Return ONLY a JSON array (no markdown, no commentary). Each element must have keys: "id", "title", "description".
Keep translations natural and simple for rural Indian readers. Preserve any proper nouns.

Input:
${JSON.stringify(toTranslate.map((b) => ({ id: b.id, title: b.title, description: (b.description || "").slice(0, 300) })))}`;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a professional translator for Indian languages. Output strictly valid JSON arrays, no prose." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("AI translation failed:", aiResp.status, errText.slice(0, 300));
      } else {
        const aiData = await aiResp.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            const parsed: Array<{ id: string; title: string; description: string }> = JSON.parse(jsonMatch[0]);
            newRows = parsed
              .filter((t) => t.id && t.title)
              .map((t) => ({
                bulletin_id: t.id,
                language,
                title: String(t.title).slice(0, 500),
                description: String(t.description || "").slice(0, 1000),
              }));

            if (newRows.length > 0) {
              const { error } = await supabase
                .from("bulletin_translations")
                .upsert(newRows, { onConflict: "bulletin_id,language" });
              if (error) console.error("Translation upsert error:", error);
            }
          } catch (e) {
            console.error("JSON parse failed:", (e as Error).message, content.slice(0, 300));
          }
        } else {
          console.error("No JSON array in AI response:", content.slice(0, 300));
        }
      }
    }

    // Combine existing + new translations into a single response array
    const translations = [
      ...Array.from(existingMap.entries()).map(([bulletin_id, v]) => ({ bulletin_id, ...v })),
      ...newRows.map((r) => ({ bulletin_id: r.bulletin_id, title: r.title, description: r.description })),
    ];

    return new Response(JSON.stringify({ translations, translated: newRows.length, cached: existingMap.size }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-bulletin error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message, translations: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
