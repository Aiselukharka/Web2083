import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

serve(async (req: Request) => {

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  }

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    })
  }

  try {

  const { publicId } = await req.json()

  const cloudName = "dfsaihbk7"
  const apiKey = "246358477926496"
  const apiSecret = "4lkmAE_2kEOrxFls5yK73WfmKWo"

  const url =
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`

    const formData = new FormData()
    formData.append("public_id", publicId)

    const basicAuth =
      btoa(`${apiKey}:${apiSecret}`)

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`
      },
      body: formData
    })

    const result = await res.json()

    console.log(result)

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({
        error: String(err)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )
  }
})