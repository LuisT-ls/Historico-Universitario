export interface CertificadoOCRResult {
  titulo?: string
  instituicao?: string
  cargaHoraria?: number
  dataInicio?: string  // ISO YYYY-MM-DD
  dataFim?: string     // ISO YYYY-MM-DD
  camposEncontrados: string[]
}

function parseCargaHoraria(text: string): number | undefined {
  const patterns = [
    /carga\s+hor[aá]ria[:\s]+(\d+)/i,
    /dura[cç][aã]o[:\s]+(\d+)\s*h/i,
    /total[:\s]+(\d+)\s*horas?/i,
    /(\d{1,4})\s*horas?\s+(?:\/\s*)?aula/i,
    /(\d{1,4})\s*horas?(?!\s*\/\s*semana)(?!\s*por\s*semana)/i,
    /(\d{1,4})\s*h(?:s)?\b(?!\d)/i,
  ]
  for (const pattern of patterns) {
    const m = text.match(pattern)
    if (m) {
      const value = parseInt(m[1])
      if (value >= 1 && value <= 9999) return value
    }
  }
  return undefined
}

function parseDates(text: string): { dataInicio?: string; dataFim?: string } {
  const dates: Date[] = []

  // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const numPat = /(\d{2})[/\-.](\d{2})[/\-.](\d{4})/g
  let m: RegExpExecArray | null
  while ((m = numPat.exec(text)) !== null) {
    const year = parseInt(m[3])
    if (year < 2000 || year > 2099) continue
    const d = new Date(year, parseInt(m[2]) - 1, parseInt(m[1]))
    if (!isNaN(d.getTime())) dates.push(d)
  }

  // "15 de março de 2024"
  const monthMap: Record<string, number> = {
    janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  }
  const textPat = /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi
  while ((m = textPat.exec(text)) !== null) {
    const month = monthMap[m[2].toLowerCase()]
    const year = parseInt(m[3])
    if (!month || year < 2000 || year > 2099) continue
    const d = new Date(year, month - 1, parseInt(m[1]))
    if (!isNaN(d.getTime())) dates.push(d)
  }

  if (dates.length === 0) return {}
  dates.sort((a, b) => a.getTime() - b.getTime())
  const toISO = (d: Date) => d.toISOString().split('T')[0]
  if (dates.length === 1) return { dataInicio: toISO(dates[0]), dataFim: toISO(dates[0]) }
  return { dataInicio: toISO(dates[0]), dataFim: toISO(dates[dates.length - 1]) }
}

function parseTitulo(text: string): string | undefined {
  // Após verbos de conclusão + tipo de atividade
  const activityTypes = 'curso|workshop|palestra|evento|congresso|semin[aá]rio|treinamento|capacita[cç][aã]o|simpl[oó]sio'
  const verbPatterns = [
    new RegExp(`(?:participou\\s+d[oa]s?|concluiu|completou)\\s+(?:com\\s+\\S+\\s+)?(?:[oa]s?\\s+)?(?:${activityTypes})[:\\s]+"?([^"\\n]{5,200})`, 'i'),
    new RegExp(`(?:${activityTypes})[:\\s]+"([^"\\n]{5,200})"`, 'i'),
  ]
  for (const p of verbPatterns) {
    const match = text.match(p)
    if (match?.[1]) return match[1].trim().replace(/["""]/g, '').substring(0, 200)
  }

  // Fallback: primeira linha que contém uma palavra-chave de atividade
  const keywords = ['curso', 'workshop', 'palestra', 'evento', 'congresso', 'seminário', 'treinamento', 'capacitação']
  for (const line of text.split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 200)) {
    if (keywords.some(k => line.toLowerCase().includes(k))) return line.substring(0, 200)
  }

  return undefined
}

function parseInstituicao(text: string): string | undefined {
  const patterns = [
    /(?:promovido|realizado|oferecido|ministrado|organizado)\s+p(?:or|ela?|elo)\s+(?:a\s+)?([A-ZÀ-Úa-zà-ú][^\n.,]{5,120}?)(?:\n|,|\.|$)/i,
    /(?:da|do|pela|pelo)\s+((?:Universidade|Instituto|Faculdade|Centro|Escola|Funda[cç][aã]o|UFBA|USP|UNICAMP|UFRJ|UFMG|UFRGS|UFC|UFPE|UNB|UFSC|UFSM)[^\n.,]{0,100})(?:\n|,|\.|$)/i,
    /institui[cç][aã]o(?:\s+(?:de\s+)?ensino)?[:\s]+([^\n.,]{5,120})/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1].trim().substring(0, 200)
  }
  return undefined
}

export async function parseCertificadoPDF(file: File): Promise<CertificadoOCRResult> {
  const { extractTextFromPDF } = await import('./pdf-parser')
  const arrayBuffer = await file.arrayBuffer()
  const text = await extractTextFromPDF(arrayBuffer)
  const camposEncontrados: string[] = []

  const cargaHoraria = parseCargaHoraria(text)
  if (cargaHoraria) camposEncontrados.push('cargaHoraria')

  const { dataInicio, dataFim } = parseDates(text)
  if (dataInicio) camposEncontrados.push('dataInicio')
  if (dataFim && dataFim !== dataInicio) camposEncontrados.push('dataFim')

  const titulo = parseTitulo(text)
  if (titulo) camposEncontrados.push('titulo')

  const instituicao = parseInstituicao(text)
  if (instituicao) camposEncontrados.push('instituicao')

  return { titulo, instituicao, cargaHoraria, dataInicio, dataFim, camposEncontrados }
}
