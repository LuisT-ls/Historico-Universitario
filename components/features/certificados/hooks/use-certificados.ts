import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { getCertificates, deleteCertificate } from '@/services/firestore.service'
import { handleError, type AppError } from '@/lib/error-handler'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { isSafeExternalUrl } from '@/lib/utils'
import type { Certificado, Curso } from '@/types'
import { CURSOS } from '@/lib/constants'

export const useCertificados = (curso: Curso = 'BICTI') => {
    const { user, loading: authLoading } = useAuth()
    const [certificados, setCertificados] = useState<Certificado[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<AppError | null>(null)

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Carregar certificados
    const loadCertificados = useCallback(async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const certificadosData = await getCertificates(user.uid)

            // Ordenar por data de cadastro (mais recente primeiro)
            certificadosData.sort((a, b) => {
                const dateA = new Date(a.dataCadastro).getTime()
                const dateB = new Date(b.dataCadastro).getTime()
                return dateB - dateA
            })

            setCertificados(certificadosData)
        } catch (error: unknown) {
            logger.error('Erro ao carregar certificados:', error)
            const appError = handleError(error)
            setError(appError)
            toast.error(appError.message)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user && !authLoading) {
            loadCertificados()
        }
    }, [user, authLoading, loadCertificados])

    // Calcular estatísticas (memoizadas)
    const stats = useMemo(() => {
        const metaAC = CURSOS[curso]?.requisitos?.AC ?? 240
        const total = certificados.length
        const horasValidadas = certificados
            .filter((c) => c.status === 'aprovado')
            .reduce((sum, c) => sum + c.cargaHoraria, 0)
        const atividadesAprovadas = certificados.filter((c) => c.status === 'aprovado').length
        const horasPendentes = certificados
            .filter((c) => c.status === 'pendente')
            .reduce((sum, c) => sum + c.cargaHoraria, 0)
        const horasFaltantes = Math.max(0, metaAC - horasValidadas)

        return {
            total,
            horasValidadas,
            atividadesAprovadas,
            horasPendentes,
            horasFaltantes,
            metaAC,
        }
    }, [certificados, curso])

    // Handlers de modal
    const handleView = useCallback((certificado: Certificado) => {
        setSelectedCertificado(certificado)
        setShowViewModal(true)
    }, [])

    const handleDownload = useCallback((certificado: Certificado) => {
        const url = certificado.linkExterno || certificado.arquivoURL
        if (url && isSafeExternalUrl(url)) {
            window.open(url, '_blank', 'noopener,noreferrer')
        } else if (url) {
            logger.warn('URL de certificado bloqueada por protocolo inseguro')
        }
    }, [])

    const handleDeleteRequest = useCallback((id: string) => {
        setDeleteId(id)
        setShowDeleteModal(true)
    }, [])

    const handleDelete = useCallback(async () => {
        if (!user || !deleteId) return

        try {
            await deleteCertificate(deleteId)
            toast.success('Certificado excluído com sucesso!')
            setShowDeleteModal(false)
            setDeleteId(null)
            await loadCertificados()
        } catch (error: unknown) {
            logger.error('Erro ao excluir certificado:', error)
            const appError = handleError(error)
            setError(appError)
            toast.error(appError.message)
        }
    }, [user, deleteId, loadCertificados])

    const handleExport = useCallback(() => {
        const dataStr = JSON.stringify(certificados, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `certificados_${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
    }, [certificados])

    return {
        certificados,
        isLoading,
        error,
        setError,
        stats,
        loadCertificados,
        // View modal
        showViewModal,
        setShowViewModal,
        selectedCertificado,
        handleView,
        handleDownload,
        // Delete modal
        showDeleteModal,
        setShowDeleteModal,
        handleDeleteRequest,
        handleDelete,
        // Export
        handleExport,
        // Auth
        authLoading,
    }
}
