import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY saknas' })
  }

  const { image_base64, media_type } = req.body
  if (!image_base64) {
    return res.status(400).json({ error: 'image_base64 saknas' })
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
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')

  try {
    const results = JSON.parse(cleaned)
    return res.status(200).json({ results })
  } catch {
    return res.status(400).json({ error: 'Kunde inte tolka bilden', raw: text })
  }
}
