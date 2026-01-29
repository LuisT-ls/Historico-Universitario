import { calcularCR } from '@/lib/utils'

describe('calcularCR', () => {
    it('should calculate CR correctly for a simple case', () => {
        const disciplinas = [
            { nota: 8.0, ch: 60, natureza: 'OB' },
            { nota: 6.0, ch: 60, natureza: 'OB' },
        ]
        // (8*60 + 6*60) / 120 = 14*60 / 120 = 840 / 120 = 7.0
        expect(calcularCR(disciplinas)).toBe(7.0)
    })

    it('should ignore withdrawn courses (trancamento)', () => {
        const disciplinas = [
            { nota: 8.0, ch: 60, natureza: 'OB', trancamento: false },
            { nota: 0.0, ch: 60, natureza: 'OB', trancamento: true }, // Should be ignored
        ]
        // Only the first one counts: 8.0
        expect(calcularCR(disciplinas)).toBe(8.0)
    })

    it('should ignore exempted courses (dispensada)', () => {
        const disciplinas = [
            { nota: 8.0, ch: 60, natureza: 'OB', dispensada: false },
            { nota: 0.0, ch: 60, natureza: 'OB', dispensada: true }, // Should be ignored
        ]
        expect(calcularCR(disciplinas)).toBe(8.0)
    })

    it('should ignore complementary activities (AC)', () => {
        const disciplinas = [
            { nota: 8.0, ch: 60, natureza: 'OB' },
            { nota: 10.0, ch: 30, natureza: 'AC' }, // Should be ignored
        ]
        expect(calcularCR(disciplinas)).toBe(8.0)
    })

    it('should return 0 if no valid disciplines', () => {
        const disciplinas = [
            { nota: 0.0, ch: 60, trancamento: true },
            { nota: 0.0, ch: 60, dispensada: true },
        ]
        expect(calcularCR(disciplinas)).toBe(0)
    })

    it('should calculate CR correctly with different credit hours', () => {
        const disciplinas = [
            { nota: 10.0, ch: 30, natureza: 'OB' }, // 300
            { nota: 5.0, ch: 60, natureza: 'OB' },  // 300
        ]
        // (300 + 300) / 90 = 600 / 90 = 6.666...
        expect(calcularCR(disciplinas)).toBeCloseTo(6.667, 2)
    })
})
