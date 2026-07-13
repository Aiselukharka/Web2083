import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders })
  }

  try {
    const { publicId } = await req.json()

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "NOT_SET"
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY") || "NOT_SET"
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET") || "NOT_SET"

    // Mask secret strings slightly for security verification visibility
    const maskedKey = apiKey !== "NOT_SET" ? `${apiKey.substring(0, 4)}...` : "NOT_SET"
    const maskedSecret = apiSecret !== "NOT_SET" ? `${apiSecret.substring(0, 2)}...` : "NOT_SET"

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("resource_type", "image")

    const basicAuth = btoa(`${apiKey}:${apiSecret}`)

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`
      },
      body: formData
    })

    const result = await res.json()

    // Pass back debug configurations directly to your web frontend inspector console
    const debugResponse = {
      cloudinaryResult: result,
      debug: {
        cloudName,
        apiKeyLoaded: maskedKey,
        apiSecretLoaded: maskedSecret
      }
    }

    return new Response(JSON.stringify(debugResponse), {
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