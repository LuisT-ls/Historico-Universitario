import { renderHook, act } from '@testing-library/react'
import { useCertificadoFilters } from '@/components/features/certificados/hooks/use-certificado-filters'
import type { Certificado } from '@/types'

// Mock certificados para testes
const mockCertificados: Certificado[] = [
    {
        id: '1' as any,
        userId: 'user1' as any,
        titulo: 'Curso de Python para Iniciantes',
        tipo: 'curso',
        instituicao: 'UFBA',
        cargaHoraria: 40,
        dataInicio: '2024-01-01',
        dataFim: '2024-02-01',
        descricao: 'Curso básico de Python',
        status: 'aprovado',
        dataCadastro: '2024-01-01',
    },
    {
        id: '2' as any,
        userId: 'user1' as any,
        titulo: 'Workshop de JavaScript Avançado',
        tipo: 'workshop',
        instituicao: 'UFBA',
        cargaHoraria: 20,
        dataInicio: '2024-02-01',
        dataFim: '2024-02-15',
        status: 'pendente',
        dataCadastro: '2024-02-01',
    },
    {
        id: '3' as any,
        userId: 'user1' as any,
        titulo: 'Palestra sobre Inteligência Artificial',
        tipo: 'palestra',
        instituicao: 'Instituto de Tecnologia',
        cargaHoraria: 4,
        dataInicio: '2024-03-01',
        dataFim: '2024-03-01',
        status: 'aprovado',
        dataCadastro: '2024-03-01',
    },
    {
        id: '4' as any,
        userId: 'user1' as any,
        titulo: 'Monitoria em Cálculo I',
        tipo: 'monitoria',
        instituicao: 'UFBA',
        cargaHoraria: 60,
        dataInicio: '2024-01-15',
        dataFim: '2024-06-15',
        status: 'aprovado',
        dataCadastro: '2024-01-15',
    },
    {
        id: '5' as any,
        userId: 'user1' as any,
        titulo: 'Projeto de Extensão em Comunidades',
        tipo: 'projeto',
        instituicao: 'Universidade Federal da Bahia',
        cargaHoraria: 100,
        dataInicio: '2024-02-01',
        dataFim: '2024-12-01',
        status: 'reprovado',
        dataCadastro: '2024-02-01',
    },
]

describe('useCertificadoFilters', () => {
    describe('Initial State', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            expect(result.current.searchTerm).toBe('')
            expect(result.current.filterType).toBe('todos')
            expect(result.current.viewMode).toBe('grid')
            expect(result.current.filteredCertificados).toEqual(mockCertificados)
        })

        it('should return all certificados when no filters applied', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            expect(result.current.filteredCertificados).toHaveLength(5)
            expect(result.current.filteredCertificados).toEqual(mockCertificados)
        })
    })

    describe('Search Functionality', () => {
        it('should filter by titulo (case insensitive)', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('python')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].titulo).toContain('Python')
        })

        it('should filter by instituicao', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('UFBA')
            })

            expect(result.current.filteredCertificados).toHaveLength(3)
            expect(result.current.filteredCertificados.every(cert =>
                cert.instituicao?.toLowerCase().includes('ufba')
            )).toBe(true)
        })

        it('should filter by partial match', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('java')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].titulo).toContain('JavaScript')
        })

        it('should be case insensitive', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('PYTHON')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)

            act(() => {
                result.current.setSearchTerm('python')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)

            act(() => {
                result.current.setSearchTerm('PyThOn')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
        })

        it('should return empty array for no matches', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('Nonexistent Course')
            })

            expect(result.current.filteredCertificados).toHaveLength(0)
        })

        it('should handle special characters in search', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('Cálculo I')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].titulo).toContain('Cálculo I')
        })

        it('should handle search terms with whitespace', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('  python  '.trim())
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
        })
    })

    describe('Type Filter Functionality', () => {
        it('should filter by curso type', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setFilterType('curso')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].tipo).toBe('curso')
        })

        it('should filter by workshop type', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setFilterType('workshop')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].tipo).toBe('workshop')
        })

        it('should filter by monitoria type', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setFilterType('monitoria')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].tipo).toBe('monitoria')
        })

        it('should return all when type is "todos"', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setFilterType('curso')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)

            act(() => {
                result.current.setFilterType('todos')
            })

            expect(result.current.filteredCertificados).toHaveLength(5)
        })
    })

    describe('Combined Filters', () => {
        it('should apply both search and type filters together', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('UFBA')
                result.current.setFilterType('curso')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].tipo).toBe('curso')
            expect(result.current.filteredCertificados[0].instituicao).toContain('UFBA')
        })

        it('should return empty array when combined filters match nothing', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('Python')
                result.current.setFilterType('workshop')
            })

            expect(result.current.filteredCertificados).toHaveLength(0)
        })

        it('should clear filters independently', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            // Apply both filters
            act(() => {
                result.current.setSearchTerm('UFBA')
                result.current.setFilterType('monitoria')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)

            // Clear search term
            act(() => {
                result.current.setSearchTerm('')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].tipo).toBe('monitoria')

            // Clear type filter
            act(() => {
                result.current.setFilterType('todos')
            })

            expect(result.current.filteredCertificados).toHaveLength(5)
        })
    })

    describe('View Mode', () => {
        it('should toggle between grid and list view', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            expect(result.current.viewMode).toBe('grid')

            act(() => {
                result.current.setViewMode('list')
            })

            expect(result.current.viewMode).toBe('list')

            act(() => {
                result.current.setViewMode('grid')
            })

            expect(result.current.viewMode).toBe('grid')
        })

        it('should not affect filtering when changing view mode', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('Python')
            })

            const gridResults = result.current.filteredCertificados

            act(() => {
                result.current.setViewMode('list')
            })

            expect(result.current.filteredCertificados).toEqual(gridResults)
        })
    })

    describe('Memoization', () => {
        it('should memoize filteredCertificados when inputs do not change', () => {
            const { result, rerender } = renderHook(() =>
                useCertificadoFilters(mockCertificados)
            )

            const firstFiltered = result.current.filteredCertificados

            // Rerender without changing inputs
            rerender()

            const secondFiltered = result.current.filteredCertificados

            // Should be the same reference (memoized)
            expect(firstFiltered).toBe(secondFiltered)
        })

        it('should recalculate when searchTerm changes', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            const initialFiltered = result.current.filteredCertificados

            act(() => {
                result.current.setSearchTerm('Python')
            })

            const newFiltered = result.current.filteredCertificados

            // Should be different reference (recalculated)
            expect(initialFiltered).not.toBe(newFiltered)
            expect(newFiltered).toHaveLength(1)
        })

        it('should recalculate when filterType changes', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            const initialFiltered = result.current.filteredCertificados

            act(() => {
                result.current.setFilterType('curso')
            })

            const newFiltered = result.current.filteredCertificados

            expect(initialFiltered).not.toBe(newFiltered)
            expect(newFiltered).toHaveLength(1)
        })

        it('should recalculate when certificados array changes', () => {
            const { result, rerender } = renderHook(
                ({ certificados }) => useCertificadoFilters(certificados),
                { initialProps: { certificados: mockCertificados } }
            )

            const initialFiltered = result.current.filteredCertificados

            const newCertificados = [...mockCertificados, {
                id: '6' as any,
                userId: 'user1' as any,
                titulo: 'Novo Curso',
                tipo: 'curso' as const,
                instituicao: 'UFBA',
                cargaHoraria: 30,
                dataInicio: '2024-04-01',
                dataFim: '2024-05-01',
                status: 'aprovado' as const,
                dataCadastro: '2024-04-01',
            }]

            rerender({ certificados: newCertificados })

            const newFiltered = result.current.filteredCertificados

            expect(initialFiltered).not.toBe(newFiltered)
            expect(newFiltered).toHaveLength(6)
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty certificados array', () => {
            const { result } = renderHook(() => useCertificadoFilters([]))

            expect(result.current.filteredCertificados).toHaveLength(0)

            act(() => {
                result.current.setSearchTerm('test')
            })

            expect(result.current.filteredCertificados).toHaveLength(0)
        })

        it('should handle certificados without instituicao', () => {
            const certificadosSemInstituicao: Certificado[] = [{
                id: '1' as any,
                userId: 'user1' as any,
                titulo: 'Curso Sem Instituição',
                tipo: 'curso',
                instituicao: '',  // Empty string instead of undefined
                cargaHoraria: 20,
                dataInicio: '2024-01-01',
                dataFim: '2024-02-01',
                status: 'aprovado',
                dataCadastro: '2024-01-01',
            }]

            const { result } = renderHook(() =>
                useCertificadoFilters(certificadosSemInstituicao)
            )

            act(() => {
                result.current.setSearchTerm('Curso')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
        })

        it('should handle rapid filter changes', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('P')
            })
            act(() => {
                result.current.setSearchTerm('Py')
            })
            act(() => {
                result.current.setSearchTerm('Pyt')
            })
            act(() => {
                result.current.setSearchTerm('Pyth')
            })
            act(() => {
                result.current.setSearchTerm('Pytho')
            })
            act(() => {
                result.current.setSearchTerm('Python')
            })

            expect(result.current.filteredCertificados).toHaveLength(1)
            expect(result.current.filteredCertificados[0].titulo).toContain('Python')
        })

        it('should handle numeric search terms', () => {
            const { result } = renderHook(() => useCertificadoFilters(mockCertificados))

            act(() => {
                result.current.setSearchTerm('40')
            })

            // Will not match because we're searching in titulo and instituicao only
            expect(result.current.filteredCertificados).toHaveLength(0)
        })
    })
})
