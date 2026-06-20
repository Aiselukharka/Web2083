import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { publicId } = await req.json()

    if (!publicId) {
      throw new Error("Missing parameter: publicId is required.")
    }

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME")
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY")
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET")

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Missing Cloudinary configurations in server environmental variables.")
    }

    // Explicitly uses 'image' resource type and Admin API endpoints
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?public_ids[]=${encodeURIComponent(publicId)}`
    const basicAuth = btoa(`${apiKey}:${apiSecret}`)

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json"
      }
    })

    const result = await res.json()
    console.log("Cloudinary Material Delete Result:", result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})