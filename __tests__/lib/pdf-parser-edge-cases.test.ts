// Mock pdfjs-dist (ESM module incompatible with Jest)
const mockGetDocument = jest.fn()
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: (...args: any[]) => mockGetDocument(...args),
}))

import { extractTextFromPDF, parseSigaaHistory } from '@/lib/pdf-parser'

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeItem(str: string, x: number, y: number) {
  return { str, transform: [1, 0, 0, 1, x, y] }
}

function makeTextContent(items: ReturnType<typeof makeItem>[]) {
  return { items }
}

function makePage(textContent: ReturnType<typeof makeTextContent>) {
  return { getTextContent: jest.fn().mockResolvedValue(textContent) }
}

function makePdf(pages: ReturnType<typeof makePage>[]) {
  return {
    numPages: pages.length,
    getPage: jest.fn().mockImplementation((i: number) => Promise.resolve(pages[i - 1])),
  }
}

function makeLoadingTask(pdf: ReturnType<typeof makePdf>) {
  return { promise: Promise.resolve(pdf) }
}

// ─── extractTextFromPDF ───────────────────────────────────────────────────────

describe('extractTextFromPDF — line grouping', () => {
  it('groups items on the same Y into one line', async () => {
    const page = makePage(makeTextContent([
      makeItem('Hello', 10, 100),
      makeItem('World', 50, 100),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    expect(text.trim()).toBe('Hello World')
  })

  it('puts items on different Y values on separate lines', async () => {
    const page = makePage(makeTextContent([
      makeItem('Line1', 10, 200),
      makeItem('Line2', 10, 100),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    const lines = text.trim().split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('Line1')
    expect(lines[1]).toBe('Line2')
  })

  it('groups items within default yTolerance=5 on the same line', async () => {
    const page = makePage(makeTextContent([
      makeItem('A', 10, 100),
      makeItem('B', 50, 103), // diff=3 < 5 → same line
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    const lines = text.trim().split('\n')
    // A is at y=100, B is at y=103; sorted descending: A first, B second within tolerance
    expect(lines).toHaveLength(1)
  })

  it('separates items outside default yTolerance=5', async () => {
    const page = makePage(makeTextContent([
      makeItem('A', 10, 100),
      makeItem('B', 50, 93), // diff=7 > 5 → different lines
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    const lines = text.trim().split('\n')
    expect(lines).toHaveLength(2)
  })

  it('custom yTolerance=2 separates items with diff=3', async () => {
    const page = makePage(makeTextContent([
      makeItem('A', 10, 100),
      makeItem('B', 50, 97), // diff=3 > 2 → different lines with tight tolerance
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0), 2)
    const lines = text.trim().split('\n')
    expect(lines).toHaveLength(2)
  })

  it('custom yTolerance=10 groups items with diff=7 on same line', async () => {
    const page = makePage(makeTextContent([
      makeItem('A', 10, 100),
      makeItem('B', 50, 93), // diff=7 < 10 → same line with wide tolerance
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0), 10)
    const lines = text.trim().split('\n')
    expect(lines).toHaveLength(1)
  })

  it('sorts items by X within a line', async () => {
    const page = makePage(makeTextContent([
      makeItem('Second', 80, 100),
      makeItem('First', 10, 100),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    expect(text.trim()).toBe('First Second')
  })

  it('sorts lines top-to-bottom (descending Y)', async () => {
    const page = makePage(makeTextContent([
      makeItem('Bottom', 10, 50),
      makeItem('Top', 10, 200),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    const lines = text.trim().split('\n')
    expect(lines[0]).toBe('Top')
    expect(lines[1]).toBe('Bottom')
  })

  it('skips blank items', async () => {
    const page = makePage(makeTextContent([
      makeItem('', 10, 100),       // empty — filtered out
      makeItem('   ', 10, 100),    // whitespace — filtered out
      makeItem('Real', 50, 100),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    expect(text.trim()).toBe('Real')
  })

  it('returns empty string for a page with no text items', async () => {
    const page = makePage(makeTextContent([]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    expect(text.trim()).toBe('')
  })

  it('concatenates text from multiple pages', async () => {
    const page1 = makePage(makeTextContent([makeItem('Page1', 10, 100)]))
    const page2 = makePage(makeTextContent([makeItem('Page2', 10, 100)]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page1, page2])))

    const text = await extractTextFromPDF(new ArrayBuffer(0))
    expect(text).toContain('Page1')
    expect(text).toContain('Page2')
  })
})

describe('extractTextFromPDF — error handling', () => {
  it('propagates pdfjs load errors (malformed PDF)', async () => {
    // Throw synchronously so no unhandled-rejection fires before the catch handler attaches
    mockGetDocument.mockImplementation(() => { throw new Error('Invalid PDF structure') })
    await expect(extractTextFromPDF(new ArrayBuffer(0))).rejects.toThrow('Invalid PDF structure')
  })

  it('propagates pdfjs page errors', async () => {
    const badPdf = {
      numPages: 1,
      getPage: jest.fn().mockRejectedValue(new Error('Page decode error')),
    }
    mockGetDocument.mockReturnValue(makeLoadingTask(badPdf))
    await expect(extractTextFromPDF(new ArrayBuffer(0))).rejects.toThrow('Page decode error')
  })
})

// ─── parseSigaaHistory ────────────────────────────────────────────────────────

// jsdom's File constructor does not implement arrayBuffer().
// Use a plain mock object that exposes the same interface parseSigaaHistory needs.
function makeFile(): File {
  return { arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) } as unknown as File
}

describe('parseSigaaHistory', () => {
  it('extracts text from the file and parses disciplines', async () => {
    const line = '2022.1 EB CTIA01 INTRODUÇÃO À COMPUTAÇÃO 60 9.0 APR'
    const page = makePage(makeTextContent([makeItem(line, 10, 100)]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))

    const result = await parseSigaaHistory(makeFile())
    expect(result.disciplinas.length).toBeGreaterThan(0)
    expect(result.disciplinas[0].codigo).toBe('CTIA01')
    expect(result.disciplinas[0].resultado).toBe('AP')
  })

  it('passes yTolerance through to extractTextFromPDF', async () => {
    // Two items with y diff=3; yTolerance=1 splits them → regex can't match → 0 disciplines
    const page = makePage(makeTextContent([
      makeItem('2022.1 EB CTIA01 INTRODUÇÃO À', 10, 100),
      makeItem('COMPUTAÇÃO 60 9.0 APR', 200, 97),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))
    const result1 = await parseSigaaHistory(makeFile(), 1)
    expect(result1.disciplinas).toHaveLength(0)

    // With wide tolerance they join → discipline parsed
    const page2 = makePage(makeTextContent([
      makeItem('2022.1 EB CTIA01 INTRODUÇÃO À', 10, 100),
      makeItem('COMPUTAÇÃO 60 9.0 APR', 200, 97),
    ]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page2])))
    const result2 = await parseSigaaHistory(makeFile(), 10)
    expect(result2.disciplinas.length).toBeGreaterThan(0)
  })

  it('returns empty disciplinas for a completely blank PDF', async () => {
    const page = makePage(makeTextContent([]))
    mockGetDocument.mockReturnValue(makeLoadingTask(makePdf([page])))
    const result = await parseSigaaHistory(makeFile())
    expect(result.disciplinas).toHaveLength(0)
  })

  it('propagates errors from the underlying PDF extraction', async () => {
    mockGetDocument.mockImplementation(() => { throw new Error('Corrupted') })
    await expect(parseSigaaHistory(makeFile())).rejects.toThrow('Corrupted')
  })
})
