import { useState, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { addCertificate, updateCertificate } from '@/services/firestore.service'
import { handleError } from '@/lib/error-handler'
import { sanitizeInput, sanitizeLongText } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import type { TipoCertificado, StatusCertificado, Certificado } from '@/types'
import { createUserId } from '@/lib/constants'
import { dateToISO } from './use-date-mask'
import { certificadoSchema, type CertificadoFormErrors } from '@/lib/schemas'

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

const EMPTY_FORM: CertificadoFormData = {
    titulo: '',
    tipo: '' as TipoCertificado | '',
    instituicao: '',
    cargaHoraria: '',
    dataInicio: '',
    dataFim: '',
    descricao: '',
    linkExterno: '',
}

export const useCertificadoForm = (loadCertificados: () => Promise<void>) => {
    const { user } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<CertificadoFormData>(EMPTY_FORM)
    const [formErrors, setFormErrors] = useState<CertificadoFormErrors>({})

    const resetForm = useCallback(() => {
        setFormData(EMPTY_FORM)
        setFormErrors({})
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
        setFormErrors({})
        setEditingId(certificado.id || null)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (!user) return

            // Converter datas DD/MM/AAAA → ISO antes de validar
            let dataInicioFinal = formData.dataInicio
            if (dataInicioFinal && dataInicioFinal.includes('/')) {
                dataInicioFinal = dateToISO(dataInicioFinal)
            }

            let dataFimFinal = formData.dataFim
            if (dataFimFinal && dataFimFinal.includes('/')) {
                dataFimFinal = dateToISO(dataFimFinal)
            }

            // Validar com Zod antes de qualquer operação no Firestore
            const validation = certificadoSchema.safeParse({
                titulo: formData.titulo,
                tipo: formData.tipo || undefined,
                instituicao: formData.instituicao || undefined,
                cargaHoraria: formData.cargaHoraria,
                dataInicio: dataInicioFinal,
                dataFim: dataFimFinal || undefined,
                descricao: formData.descricao || undefined,
                linkExterno: formData.linkExterno || undefined,
            })

            if (!validation.success) {
                const errors: CertificadoFormErrors = {}
                validation.error.issues.forEach((issue) => {
                    const field = String(issue.path[0])
                    if (field && !errors[field]) {
                        errors[field] = issue.message
                    }
                })
                setFormErrors(errors)
                return
            }

            setFormErrors({})
            setIsSubmitting(true)

            try {
                const data = validation.data

                const certificadoData = {
                    userId: createUserId(user.uid),
                    titulo: sanitizeInput(data.titulo),
                    tipo: (data.tipo ?? 'outro') as TipoCertificado,
                    instituicao: data.instituicao ? sanitizeInput(data.instituicao) : '',
                    cargaHoraria: data.cargaHoraria,
                    dataInicio: dataInicioFinal,
                    dataFim: dataFimFinal || '',
                    descricao: data.descricao ? sanitizeLongText(data.descricao) : undefined,
                    linkExterno: data.linkExterno ? sanitizeInput(data.linkExterno) : undefined,
                    status: 'aprovado' as StatusCertificado,
                    updatedAt: new Date(),
                }

                if (editingId) {
                    await updateCertificate(editingId, certificadoData)
                    toast.success('Certificado atualizado!', {
                        description: certificadoData.titulo,
                        duration: 3000,
                    })
                } else {
                    const novoCertificado: Omit<Certificado, 'id'> = {
                        ...certificadoData,
                        userId: certificadoData.userId as Certificado['userId'],
                        dataCadastro: new Date().toISOString(),
                    }
                    await addCertificate(novoCertificado, user.uid)
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
        formErrors,
        showForm,
        setShowForm,
        isSubmitting,
        editingId,
        handleSubmit,
        handleEdit,
        resetForm,
    }
}
