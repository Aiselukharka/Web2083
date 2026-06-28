import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  }

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { publicIds } = await req.json()

    // Validate that an array was passed
    if (!publicIds || !Array.isArray(publicIds)) {
      throw new Error("Missing parameter: publicIds array is required.")
    }

    // Safely exit if the array is empty
    if (publicIds.length === 0) {
      return new Response(JSON.stringify({ message: "No target assets requested. Skipping.", deleted: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME")
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY")
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET")

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Missing Cloudinary credentials inside server environment variables.")
    }

    // Construct Cloudinary Admin API multi-delete parameters: public_ids[]=id1&public_ids[]=id2
    const queryParams = publicIds.map(id => `public_ids[]=${encodeURIComponent(id)}`).join('&')
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${queryParams}`
    
    const basicAuth = btoa(`${apiKey}:${apiSecret}`)

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json"
      }
    })

    const result = await res.json()
    console.log("Cloudinary Class Bulk Purge Result:", result)

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