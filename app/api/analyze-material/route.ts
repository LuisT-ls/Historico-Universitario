import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const PROMPT = `Você é um assistente acadêmico. Analise este material PDF e sugira:
1. Um título conciso e descritivo em português (máximo 80 caracteres), sem mencionar o formato do arquivo.
2. Uma descrição breve em português (máximo 300 caracteres) com o conteúdo principal.

Responda APENAS com JSON válido, sem markdown:
{"titulo": "...", "descricao": "..."}`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key não configurada.' }, { status: 500 })
  }

  let fileBase64: string
  let mimeType: string

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 })
    }

    mimeType = file.type || 'application/pdf'
    const buffer = await file.arrayBuffer()
    fileBase64 = Buffer.from(buffer).toString('base64')
  } catch {
    return NextResponse.json({ error: 'Erro ao processar o arquivo.' }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      { inlineData: { mimeType, data: fileBase64 } },
      PROMPT,
    ])

    const text = result.response.text().trim()

    // Remove blocos de markdown caso o modelo os inclua mesmo instruído a não
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const json = JSON.parse(clean) as { titulo: string; descricao: string }

    if (!json.titulo || !json.descricao) {
      throw new Error('Resposta incompleta do modelo.')
    }

    return NextResponse.json({
      titulo:   json.titulo.slice(0, 100),
      descricao: json.descricao.slice(0, 500),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Falha na análise: ${message}` }, { status: 500 })
  }
}
