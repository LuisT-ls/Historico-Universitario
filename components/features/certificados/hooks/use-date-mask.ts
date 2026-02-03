import { useCallback } from 'react'
import type React from 'react'

// Helper para máscara de data (DD/MM/AAAA)
export const maskDate = (value: string): string => {
    return value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a primeira barra
        .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a segunda barra
        .replace(/(\d{4})\d+?$/, '$1') // Limita a 4 dígitos no ano
}

// Helper para converter DD/MM/AAAA para YYYY-MM-DD
export const dateToISO = (value: string): string => {
    if (value.length !== 10) return ''
    const [day, month, year] = value.split('/')
    if (!day || !month || !year) return ''
    return `${year}-${month}-${day}`
}

// Helper para converter YYYY-MM-DD para DD/MM/AAAA (para visualização)
export const formatDateToDisplay = (isoString?: string): string => {
    if (!isoString) return ''
    // Se já estiver no formato visual (usuário digitando), retorna ele mesmo
    // Se o isoString não tiver traço, assumimos que é o input parcial do usuário
    if (!isoString.includes('-') && isoString.length <= 10) return isoString

    const [year, month, day] = isoString.split('-')
    if (!year || !month || !day) return isoString // Retorna original se falhar
    return `${day}/${month}/${year}`
}

// Hook para gerenciar mudança de datas com máscara
export const useDateMask = () => {
    const handleDateChange = useCallback(
        <T extends Record<string, any>>(
            value: string,
            field: string,
            setFormData: React.Dispatch<React.SetStateAction<T>>
        ) => {
            // Aplica máscara visual
            const masked = maskDate(value)

            // Se for uma data completa (10 chars), tenta converter para ISO para salvar
            if (masked.length === 10) {
                const iso = dateToISO(masked)
                // Verifica se é data válida
                const testDate = new Date(iso)
                if (!isNaN(testDate.getTime())) {
                    // Data válida, salva como ISO (pois é o padrão nosso interno)
                    setFormData((prev) => ({ ...prev, [field]: iso }))
                    return
                }
            }

            // Se não for completa ou válida ISO, salva o mascarado para o input refletir a digitação
            setFormData((prev) => ({ ...prev, [field]: masked }))
        },
        []
    )

    return {
        maskDate,
        dateToISO,
        formatDateToDisplay,
        handleDateChange,
    }
}
