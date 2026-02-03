import { useState, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { handleError } from '@/lib/error-handler'
import { sanitizeInput, sanitizeLongText } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import type { TipoCertificado, StatusCertificado, Certificado } from '@/types'
import { dateToISO } from './use-date-mask'

export interface CertificadoFormData {
    titulo: string
    tipo: TipoCertificado | ''
    instituicao: string
    cargaHoraria: string
    dataInicio: string
    dataFim: string
    descricao: string
    linkExterno: string
}

export const useCertificadoForm = (loadCertificados: () => Promise<void>) => {
    const { user } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<CertificadoFormData>({
        titulo: '',
        tipo: '' as TipoCertificado | '',
        instituicao: '',
        cargaHoraria: '',
        dataInicio: '',
        dataFim: '',
        descricao: '',
        linkExterno: '',
    })

    const resetForm = useCallback(() => {
        setFormData({
            titulo: '',
            tipo: '' as TipoCertificado | '',
            instituicao: '',
            cargaHoraria: '',
            dataInicio: '',
            dataFim: '',
            descricao: '',
            linkExterno: '',
        })
        setEditingId(null)
    }, [])

    const handleEdit = useCallback((certificado: Certificado) => {
        setFormData({
            titulo: certificado.titulo,
            tipo: certificado.tipo,
            instituicao: certificado.instituicao,
            cargaHoraria: certificado.cargaHoraria.toString(),
            dataInicio: certificado.dataInicio,
            dataFim: certificado.dataFim,
            descricao: certificado.descricao || '',
            linkExterno: certificado.linkExterno || '',
        })
        setEditingId(certificado.id || null)
        setShowForm(true)
        // Scroll suave para o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (!user || !db) return

            setIsSubmitting(true)

            try {
                // Garantir que as datas estejam em ISO antes de enviar
                let dataInicioFinal = formData.dataInicio
                if (dataInicioFinal && dataInicioFinal.includes('/')) {
                    dataInicioFinal = dateToISO(dataInicioFinal)
                }

                let dataFimFinal = formData.dataFim
                if (dataFimFinal && dataFimFinal.includes('/')) {
                    dataFimFinal = dateToISO(dataFimFinal)
                }

                const certificadoData = {
                    userId: user.uid,
                    titulo: sanitizeInput(formData.titulo),
                    tipo: (formData.tipo || 'outro') as TipoCertificado,
                    instituicao: formData.instituicao ? sanitizeInput(formData.instituicao) : '',
                    cargaHoraria: parseInt(formData.cargaHoraria),
                    dataInicio: dataInicioFinal,
                    dataFim: dataFimFinal || '',
                    descricao: formData.descricao ? sanitizeLongText(formData.descricao) : undefined,
                    linkExterno: formData.linkExterno ? sanitizeInput(formData.linkExterno) : undefined,
                    status: 'aprovado' as StatusCertificado,
                    updatedAt: new Date(),
                }

                if (editingId) {
                    // Atualizar certificado existente
                    const certificadoRef = doc(db, 'certificados', editingId)
                    await updateDoc(certificadoRef, certificadoData)

                    toast.success('Certificado atualizado!', {
                        description: certificadoData.titulo,
                        duration: 3000,
                    })
                } else {
                    // Criar novo certificado
                    const novoCertificado = {
                        ...certificadoData,
                        dataCadastro: new Date().toISOString(),
                        createdAt: new Date(),
                    }

                    await addDoc(collection(db, 'certificados'), novoCertificado)

                    toast.success('Certificado salvo com sucesso!', {
                        description: certificadoData.titulo,
                        duration: 3000,
                    })
                }

                setShowForm(false)
                setEditingId(null)
                resetForm()
                await loadCertificados()
            } catch (error: unknown) {
                logger.error('Erro ao salvar certificado:', error)
                const appError = handleError(error)
                toast.error(appError.message)
            } finally {
                setIsSubmitting(false)
            }
        },
        [user, formData, editingId, loadCertificados, resetForm]
    )

    return {
        formData,
        setFormData,
        showForm,
        setShowForm,
        isSubmitting,
        editingId,
        handleSubmit,
        handleEdit,
        resetForm,
    }
}
