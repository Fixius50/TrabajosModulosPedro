
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, method = 'GET', headers = {}, body } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Missing "url" parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Proxying request to ${url} [${method}]`);

    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    // Read response as text first to handle both JSON and XML (RSS)
    const responseText = await response.text()
    const responseType = response.headers.get('content-type') || 'text/plain'

    return new Response(
      responseText,
      {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': responseType
        }
      }
    )
  } catch (error) {
    const requestError = error as Error;
    return new Response(
      JSON.stringify({ error: requestError.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
