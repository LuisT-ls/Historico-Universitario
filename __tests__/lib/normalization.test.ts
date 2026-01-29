import { normalizeText } from '@/lib/utils'

describe('normalizeText', () => {
    it('should normalize text correctly', () => {
        expect(normalizeText('  CTIA01  ')).toBe('CTIA01')
        expect(normalizeText('ctia01')).toBe('CTIA01')
        expect(normalizeText('INTRODUÇÃO')).toBe('INTRODUCAO')
        expect(normalizeText('  MATA02 \n')).toBe('MATA02')
        expect(normalizeText('Code With Space')).toBe('CODEWITHSPACE')
    })

    it('should handle period normalization', () => {
        expect(normalizeText('2025.2 ')).toBe('2025.2')
        expect(normalizeText(' 2025.2')).toBe('2025.2')
    })

    it('should return empty string for null/undefined/empty input', () => {
        expect(normalizeText('')).toBe('')
        // @ts-ignore
        expect(normalizeText(null)).toBe('')
        // @ts-ignore
        expect(normalizeText(undefined)).toBe('')
    })
})
