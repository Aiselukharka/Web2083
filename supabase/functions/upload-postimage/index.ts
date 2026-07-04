import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get credentials from environment variables
    const apiKey = Deno.env.get('POSTIMAGES_API_KEY');
    const galleryId = Deno.env.get('POSTIMAGES_GALLERY_ID');

    if (!apiKey || !galleryId) {
      return new Response(
        JSON.stringify({ 
          error: 'PostImages credentials not configured',
          missing: {
            apiKey: apiKey ? '✅' : '❌',
            galleryId: galleryId ? '✅' : '❌'
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the form data from the request
    const formData = await req.formData();
    const file = formData.get('image');
    const filename = formData.get('filename') || `gallery_${Date.now()}.jpg`;

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'File must be an image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 5MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // High performance processing that never throws Maximum Call Stack errors 
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binaryString = "";
    const chunkSize = 0xffff; // Process in chunks of 65,535 bytes
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binaryString += String.fromCharCode.apply(
        null, 
        uint8Array.subarray(i, i + chunkSize)
      );
    }
    const base64Image = btoa(binaryString);

    // Prepare PostImages API request
    const postImageData = {
      key: apiKey,
      gallery: galleryId,
      o: '2b819584285c102318568238c7d4a4c7',
      m: '59c2ad4b46b0c1e12d5703302bff0120',
      version: '1.0.1',
      portable: '1',
      name: filename.split('.').slice(0, -1).join('.'),
      type: file.name.split('.').pop() || 'jpg',
      image: base64Image,
      adult: '0'
    };

    // Convert to form-urlencoded
    const formBody = Object.keys(postImageData)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(postImageData[key])}`)
      .join('&');

    // Send to PostImages API
    const response = await fetch('https://api.postimage.org/1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseText = await response.text();

    // Extract URL from XML response
    const urlMatch = responseText.match(/<hotlink>([^<]+)<\/hotlink>/);
    const pageMatch = responseText.match(/<page>([^<]+)<\/page>/);
    const deleteMatch = responseText.match(/<delete>([^<]+)<\/delete>/);

    if (urlMatch && urlMatch[1]) {
      return new Response(
        JSON.stringify({
          success: true,
          url: urlMatch[1],
          page: pageMatch ? pageMatch[1] : null,
          delete_url: deleteMatch ? deleteMatch[1] : null,
          filename: filename,
          original_name: file.name,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: 'PostImages upload failed - could not extract URL from response',
          raw_response: responseText.substring(0, 500), 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to upload image',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});