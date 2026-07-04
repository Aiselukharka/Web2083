import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // List of images from your PostImages gallery
    // Update this list whenever you upload new images
    const images = [
      {
        name: 'School Logo',
        url: 'https://i.postimg.cc/1zQd38BM/school-logo.png',
        uploaded_at: '2026-07-01T00:00:00.000Z'
      },
      {
        name: 'Gallery Image 1',
        url: 'https://i.postimg.cc/wTgDcvd3/test-1783082538173.jpg',
        uploaded_at: '2026-07-02T00:00:00.000Z'
      },
      {
        name: 'Gallery Image 2',
        url: 'https://i.postimg.cc/HsRGJjKw/test-1783086223120.jpg',
        uploaded_at: '2026-07-03T00:00:00.000Z'
      },
      {
        name: 'Gallery Image 3',
        url: 'https://i.postimg.cc/ZnqRq0Q7/test-1783086562009.jpg',
        uploaded_at: '2026-07-03T00:00:00.000Z'
      }
    ];

    return new Response(
      JSON.stringify({
        success: true,
        images: images,
        count: images.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('List error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to list images',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 
