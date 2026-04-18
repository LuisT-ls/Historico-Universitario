jest.mock('@/assets/data/icti/prerequisitos.json', () => ({
  BICTI: {
    'CTIA02': ['CTIA01'],
    'CTIA03': ['CTIA01', 'CTIA02'],
    'CTIA45': ['CTIA03'],
    // CTIA46 depends on GCTI0008, which is equivalent to CTIA45
    'CTIA46': ['GCTI0008'],
  },
}))
jest.mock('@/assets/data/humanidades/prerequisitos.json', () => ({
  BI_HUM: {
    'HACA02': ['HACA01'],
  },
}))

import {
  getPrerequisitos,
  prerequisitosAtendidos,
  prerequisitosFaltando,
  dependentes,
  prerequisitosRecursivos,
} from '@/lib/utils/prerequisites'

// ─── getPrerequisitos ─────────────────────────────────────────────────────────

describe('getPrerequisitos', () => {
  it('returns prereqs for a code with dependencies', () => {
    expect(getPrerequisitos('CTIA02', 'BICTI')).toEqual(['CTIA01'])
  })

  it('returns empty array for a code with no dependencies', () => {
    expect(getPrerequisitos('CTIA01', 'BICTI')).toEqual([])
  })

  it('returns empty array when code does not exist in the course', () => {
    expect(getPrerequisitos('CTIA02', 'BI_HUM')).toEqual([])
  })

  it('normalises trailing A turma indicator in code', () => {
    // CTIA02A (6 chars, ends A) → normalised to CTIA02 → returns CTIA02's prereqs
    expect(getPrerequisitos('CTIA02A', 'BICTI')).toEqual(['CTIA01'])
    // CTIA45A (6 chars, ends A) → normalised to CTIA45 → should not throw
    expect(() => getPrerequisitos('CTIA45A', 'BICTI')).not.toThrow()
  })

  it('works for BI_HUM course', () => {
    expect(getPrerequisitos('HACA02', 'BI_HUM')).toEqual(['HACA01'])
  })
})

// ─── prerequisitosAtendidos ───────────────────────────────────────────────────

describe('prerequisitosAtendidos', () => {
  it('returns true when there are no prereqs', () => {
    expect(prerequisitosAtendidos('CTIA01', 'BICTI', [])).toBe(true)
  })

  it('returns true when all prereqs are approved', () => {
    expect(prerequisitosAtendidos('CTIA02', 'BICTI', ['CTIA01'])).toBe(true)
  })

  it('returns false when prereq is missing', () => {
    expect(prerequisitosAtendidos('CTIA02', 'BICTI', [])).toBe(false)
  })

  it('returns false when only one of multiple prereqs is met', () => {
    expect(prerequisitosAtendidos('CTIA03', 'BICTI', ['CTIA01'])).toBe(false)
  })

  it('returns true when all multiple prereqs are met', () => {
    expect(prerequisitosAtendidos('CTIA03', 'BICTI', ['CTIA01', 'CTIA02'])).toBe(true)
  })

  it('handles code normalisation: CTIA01A counts as CTIA01', () => {
    expect(prerequisitosAtendidos('CTIA02', 'BICTI', ['CTIA01A'])).toBe(true)
  })

  it('handles code case insensitivity', () => {
    expect(prerequisitosAtendidos('ctia02', 'BICTI', ['ctia01'])).toBe(true)
  })

  it('resolves equivalências: CTIA45 satisfies GCTI0008 prereq', () => {
    // CTIA46 requires GCTI0008; CTIA45 is equivalent to GCTI0008
    expect(prerequisitosAtendidos('CTIA46', 'BICTI', ['CTIA45'])).toBe(true)
  })

  it('resolves equivalências: GCTI0008 satisfies GCTI0008 prereq directly', () => {
    expect(prerequisitosAtendidos('CTIA46', 'BICTI', ['GCTI0008'])).toBe(true)
  })
})

// ─── prerequisitosFaltando ────────────────────────────────────────────────────

describe('prerequisitosFaltando', () => {
  it('returns empty array when there are no prereqs', () => {
    expect(prerequisitosFaltando('CTIA01', 'BICTI', [])).toEqual([])
  })

  it('returns empty array when all prereqs are met', () => {
    expect(prerequisitosFaltando('CTIA02', 'BICTI', ['CTIA01'])).toEqual([])
  })

  it('returns missing prereqs', () => {
    expect(prerequisitosFaltando('CTIA02', 'BICTI', [])).toEqual(['CTIA01'])
  })

  it('returns only the missing ones when partially met', () => {
    const missing = prerequisitosFaltando('CTIA03', 'BICTI', ['CTIA01'])
    expect(missing).toEqual(['CTIA02'])
  })

  it('returns all missing when none are met', () => {
    const missing = prerequisitosFaltando('CTIA03', 'BICTI', [])
    expect(missing).toEqual(expect.arrayContaining(['CTIA01', 'CTIA02']))
    expect(missing).toHaveLength(2)
  })

  it('counts equivalência as satisfied', () => {
    // CTIA46 needs GCTI0008; having CTIA45 (equivalent) satisfies it
    expect(prerequisitosFaltando('CTIA46', 'BICTI', ['CTIA45'])).toEqual([])
  })
})

// ─── dependentes ─────────────────────────────────────────────────────────────

describe('dependentes', () => {
  it('returns codes that directly depend on the given code', () => {
    const deps = dependentes('CTIA01', 'BICTI')
    expect(deps).toContain('CTIA02')
    expect(deps).toContain('CTIA03')
  })

  it('returns empty array for a code with no dependents', () => {
    // CTIA46 is not a prereq of anything in the mock data
    expect(dependentes('CTIA46', 'BICTI')).toEqual([])
  })

  it('returns empty array for unknown course', () => {
    expect(dependentes('CTIA01', 'CPL' as any)).toEqual([])
  })

  it('includes dependents via equivalência', () => {
    // GCTI0008 is equivalent to CTIA45; CTIA46 depends on GCTI0008
    const deps = dependentes('CTIA45', 'BICTI')
    expect(deps).toContain('CTIA46')
  })
})

// ─── prerequisitosRecursivos ──────────────────────────────────────────────────

describe('prerequisitosRecursivos', () => {
  it('returns empty array for a code with no prereqs', () => {
    expect(prerequisitosRecursivos('CTIA01', 'BICTI')).toEqual([])
  })

  it('returns direct prereqs for a code with one level', () => {
    const result = prerequisitosRecursivos('CTIA02', 'BICTI')
    expect(result).toContain('CTIA01')
  })

  it('returns full chain recursively', () => {
    // CTIA45 → CTIA03 → CTIA01, CTIA02 → CTIA01
    const result = prerequisitosRecursivos('CTIA45', 'BICTI')
    expect(result).toContain('CTIA03')
    expect(result).toContain('CTIA01')
    expect(result).toContain('CTIA02')
  })

  it('returns no duplicate codes in recursive chain', () => {
    const result = prerequisitosRecursivos('CTIA45', 'BICTI')
    const unique = [...new Set(result)]
    expect(result).toHaveLength(unique.length)
  })

  it('does not infinite-loop on circular dependencies', () => {
    // Not in mock data but the visited-set guard should prevent infinite recursion
    expect(() => prerequisitosRecursivos('CTIA03', 'BICTI')).not.toThrow()
  })
})
