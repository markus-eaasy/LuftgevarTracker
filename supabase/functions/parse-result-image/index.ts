import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY saknas' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { image_base64, media_type } = await req.json()
  if (!image_base64) {
    return new Response(JSON.stringify({ error: 'image_base64 saknas' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: media_type ?? 'image/jpeg',
              data: image_base64,
            },
          },
          {
            type: 'text',
            text: `Analysera denna resultatlista från luftgevärsskytte och extrahera ALLA deltagares resultat.

Returnera ENBART en giltig JSON-array utan förklaringar eller markdown:

[
  {
    "nr": 237,
    "namn": "Hans Narup",
    "bana": 8,
    "serie": "20 skott sittande",
    "seriepoang": [47, 47, 48, 48],
    "totalpoang": 190,
    "inner_tior": 8
  }
]

Om ett fält inte syns, sätt null. seriepoang är en array med de enskilda seriepoängen (t.ex. [42, 44, 40, 42]).`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')

  try {
    const results = JSON.parse(cleaned)
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Kunde inte tolka bilden', raw: text }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
