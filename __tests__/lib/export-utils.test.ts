import type { ExportBackup } from '@/lib/export-utils'
import type { Disciplina } from '@/types'

// ─── browser API mocks ────────────────────────────────────────────────────────

const mockClick = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url')
const mockRevokeObjectURL = jest.fn()

const mockLink = {
  href: '',
  download: '',
  click: mockClick,
}

beforeAll(() => {
  jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') return mockLink as unknown as HTMLElement
    return document.createElement(tag)
  })
  jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
  jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
  Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL, configurable: true, writable: true })
  Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL, configurable: true, writable: true })
})

afterEach(() => {
  mockLink.href = ''
  mockLink.download = ''
  jest.clearAllMocks()
  mockCreateObjectURL.mockReturnValue('blob:mock-url')
})

// ─── fixtures ─────────────────────────────────────────────────────────────────

const sampleDisciplina: Disciplina = {
  id: 'disc-1' as any,
  periodo: '2022.1',
  codigo: 'CTIA01',
  nome: 'INTRODUÇÃO À COMPUTAÇÃO',
  natureza: 'OB',
  ch: 60,
  nota: 9.0,
  trancamento: false,
  dispensada: false,
  emcurso: false,
  resultado: 'AP',
  curso: 'BICTI',
  createdAt: new Date('2022-01-01'),
  updatedAt: new Date('2022-01-01'),
}

const sampleBackup: ExportBackup = {
  exportedAt: '2024-01-15T10:00:00.000Z',
  disciplines: [sampleDisciplina],
  profile: null,
  user: {
    uid: 'uid-1',
    email: 'test@example.com',
    displayName: 'Test User',
  },
}

// ─── ExportBackup interface ───────────────────────────────────────────────────

describe('ExportBackup interface', () => {
  it('has required fields: exportedAt, disciplines, profile, user', () => {
    const backup: ExportBackup = sampleBackup
    expect(backup).toHaveProperty('exportedAt')
    expect(backup).toHaveProperty('disciplines')
    expect(backup).toHaveProperty('profile')
    expect(backup).toHaveProperty('user')
  })

  it('user sub-object has uid, email, displayName', () => {
    expect(sampleBackup.user).toHaveProperty('uid')
    expect(sampleBackup.user).toHaveProperty('email')
    expect(sampleBackup.user).toHaveProperty('displayName')
  })

  it('disciplines is an array of Disciplina', () => {
    expect(Array.isArray(sampleBackup.disciplines)).toBe(true)
    const d = sampleBackup.disciplines[0]
    expect(d).toHaveProperty('codigo')
    expect(d).toHaveProperty('nome')
    expect(d).toHaveProperty('natureza')
    expect(d).toHaveProperty('ch')
    expect(d).toHaveProperty('nota')
  })

  it('accepts null profile', () => {
    const backup: ExportBackup = { ...sampleBackup, profile: null }
    expect(backup.profile).toBeNull()
  })

  it('exportedAt is an ISO 8601 string', () => {
    expect(() => new Date(sampleBackup.exportedAt)).not.toThrow()
    expect(new Date(sampleBackup.exportedAt).toISOString()).toBe(sampleBackup.exportedAt)
  })
})

// ─── exportAsJSON ─────────────────────────────────────────────────────────────

describe('exportAsJSON', () => {
  let capturedBlobParts: string[] = []
  let capturedBlobType = ''
  const OriginalBlob = global.Blob

  beforeEach(() => {
    capturedBlobParts = []
    capturedBlobType = ''
    // Replace global.Blob with a simple stub that captures constructor args.
    // Cannot use jest.spyOn here because calling `new OriginalBlob` inside a spy
    // that replaced global.Blob causes infinite recursion.
    ;(global as any).Blob = function StubBlob(parts: string[], init?: BlobPropertyBag) {
      capturedBlobParts = parts
      capturedBlobType = init?.type ?? ''
      return { type: capturedBlobType, size: (parts[0] ?? '').length }
    }
  })

  afterEach(() => {
    ;(global as any).Blob = OriginalBlob
  })

  it('creates a Blob with application/json type', async () => {
    const { exportAsJSON } = await import('@/lib/export-utils')
    exportAsJSON(sampleBackup)
    expect(capturedBlobType).toBe('application/json')
    expect(capturedBlobParts[0]).toBeTruthy()
  })

  it('the JSON blob content can be parsed back to ExportBackup shape', async () => {
    const { exportAsJSON } = await import('@/lib/export-utils')
    exportAsJSON(sampleBackup)

    const parsed = JSON.parse(capturedBlobParts[0]) as ExportBackup
    expect(parsed.exportedAt).toBe(sampleBackup.exportedAt)
    expect(parsed.user.uid).toBe(sampleBackup.user.uid)
    expect(parsed.user.email).toBe(sampleBackup.user.email)
    expect(parsed.disciplines).toHaveLength(1)
    expect(parsed.disciplines[0].codigo).toBe('CTIA01')
    expect(parsed.profile).toBeNull()
  })

  it('sets a .json download filename', async () => {
    const { exportAsJSON } = await import('@/lib/export-utils')
    exportAsJSON(sampleBackup)
    expect(mockLink.download).toMatch(/\.json$/)
    expect(mockLink.download).toMatch(/historico-universitario-backup/)
  })

  it('calls URL.createObjectURL, link.click, and URL.revokeObjectURL', async () => {
    jest.useFakeTimers()
    const { exportAsJSON } = await import('@/lib/export-utils')
    exportAsJSON(sampleBackup)

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
    expect(mockClick).toHaveBeenCalledTimes(1)
    expect(mockAppendChild).toHaveBeenCalledTimes(1)
    expect(mockRemoveChild).toHaveBeenCalledTimes(1)

    jest.runAllTimers()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    jest.useRealTimers()
  })

  it('preserves multiple disciplines in the exported payload', async () => {
    const { exportAsJSON } = await import('@/lib/export-utils')
    const multiBackup: ExportBackup = {
      ...sampleBackup,
      disciplines: [
        sampleDisciplina,
        { ...sampleDisciplina, id: 'disc-2' as any, codigo: 'CTIA02', nome: 'BASES EPISTEMOLÓGICAS' },
      ],
    }
    exportAsJSON(multiBackup)

    const parsed = JSON.parse(capturedBlobParts[0]) as ExportBackup
    expect(parsed.disciplines).toHaveLength(2)
    expect(parsed.disciplines[1].codigo).toBe('CTIA02')
  })
})
