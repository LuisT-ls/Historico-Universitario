import { useState, useMemo } from 'react'
import type { Certificado } from '@/types'

export const useCertificadoFilters = (certificados: Certificado[]) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<string>('todos')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Memoizar certificados filtrados para evitar recalculo desnecessário
    const filteredCertificados = useMemo(() => {
        return certificados.filter((c) => {
            const matchesSearch =
                c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.instituicao?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = filterType === 'todos' || c.tipo === filterType
            return matchesSearch && matchesType
        })
    }, [certificados, searchTerm, filterType])

    return {
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        viewMode,
        setViewMode,
        filteredCertificados,
    }
}
