import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get("per_page") || "9")));
    const category = url.searchParams.get("category") || "All";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Build query for count
    let countQuery = supabase.from("bulletin_items").select("*", { count: "exact", head: true });
    if (category !== "All") {
      countQuery = countQuery.eq("category", category);
    }
    const { count } = await countQuery;
    const total = count || 0;
    const totalPages = Math.ceil(total / perPage);

    // Build data query
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let dataQuery = supabase
      .from("bulletin_items")
      .select("*")
      .order("publish_date", { ascending: false })
      .range(from, to);

    if (category !== "All") {
      dataQuery = dataQuery.eq("category", category);
    }

    const { data, error } = await dataQuery;
    if (error) throw error;

    return new Response(
      JSON.stringify({ items: data || [], total, page, totalPages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
