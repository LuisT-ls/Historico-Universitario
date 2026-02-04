import { renderHook, act, waitFor } from '@testing-library/react'
import { useCertificadoForm } from '@/components/features/certificados/hooks/use-certificado-form'
import { useAuth } from '@/components/auth-provider'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { toast } from '@/lib/toast'

// Mock dependencies
jest.mock('firebase/firestore')
jest.mock('@/lib/firebase/config', () => ({
    db: {},
}))
jest.mock('@/lib/toast')
jest.mock('@/lib/logger')
jest.mock('@/components/auth-provider', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/lib/utils', () => ({
    sanitizeInput: (str: string) => str?.trim() || '',
    sanitizeLongText: (str: string) => str?.trim() || '',
}))

describe('useCertificadoForm', () => {
    const mockOnSuccess = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({
                user: { uid: 'test-user-id' },
                loading: false,
            })
    })

    describe('Initial State', () => {
        it('should initialize with default empty form data', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            expect(result.current.formData).toEqual({
                titulo: '',
                tipo: '',
                instituicao: '',
                cargaHoraria: '',
                dataInicio: '',
                dataFim: '',
                descricao: '',
                linkExterno: '',
            })
            expect(result.current.isSubmitting).toBe(false)
            expect(result.current.editingId).toBeNull()
        })

        it('should not be submitting initially', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            expect(result.current.isSubmitting).toBe(false)
        })
    })

    describe('setFormData', () => {
        it('should update form data', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Curso de Python',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '40',
                    dataInicio: '2024-01-01',
                    dataFim: '2024-02-01',
                    descricao: 'Curso básico',
                    linkExterno: 'https://example.com',
                })
            })

            expect(result.current.formData.titulo).toBe('Curso de Python')
            expect(result.current.formData.tipo).toBe('curso')
            expect(result.current.formData.cargaHoraria).toBe('40')
        })

        it('should update individual fields', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData(prev => ({
                    ...prev,
                    titulo: 'New Title',
                }))
            })

            expect(result.current.formData.titulo).toBe('New Title')
            expect(result.current.formData.tipo).toBe('') // Other fields unchanged
        })
    })

    describe('handleSubmit - Create Mode', () => {
        it('should create new certificado successfully', async () => {
            const mockDocRef = { id: 'new-cert-id' }
                ; (addDoc as jest.Mock).mockResolvedValue(mockDocRef)
                ; (collection as jest.Mock).mockReturnValue('certificados-collection')

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            // Fill form
            act(() => {
                result.current.setFormData({
                    titulo: 'Curso de Python',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '40',
                    dataInicio: '2024-01-01',
                    dataFim: '2024-02-01',
                    descricao: 'Curso básico de Python',
                    linkExterno: '',
                })
            })

            // Submit form
            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            // Verify addDoc was called with correct data
            expect(addDoc).toHaveBeenCalledWith(
                'certificados-collection',
                expect.objectContaining({
                    titulo: 'Curso de Python',
                    tipo: 'curso',
                    cargaHoraria: 40, // Converted to number
                    status: 'aprovado',
                })
            )

            // Verify success toast
            expect(toast.success).toHaveBeenCalled()

            // Verify callback
            expect(mockOnSuccess).toHaveBeenCalled()

            // Verify form was reset
            await waitFor(() => {
                expect(result.current.formData.titulo).toBe('')
            })
        })

        it('should submit even with empty form (validation is UI responsibility)', async () => {
            ; (addDoc as jest.Mock).mockResolvedValue({ id: 'test' })
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            // Try to submit empty form
            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            // Hook doesn't validate - UI is responsible for that
            expect(addDoc).toHaveBeenCalled()
        })

        it('should convert cargaHoraria string to number', async () => {
            ; (addDoc as jest.Mock).mockResolvedValue({ id: 'test-id' })

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Test Course',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '50', // String
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    cargaHoraria: 50, // Number
                })
            )
        })

        it('should set default tipo to "outro" if empty', async () => {
            ; (addDoc as jest.Mock).mockResolvedValue({ id: 'test-id' })

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Test Activity',
                    tipo: '', // Empty
                    instituicao: 'UFBA',
                    cargaHoraria: '20',
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    tipo: 'outro',
                })
            )
        })

        it('should include dataCadastro timestamp', async () => {
            ; (addDoc as jest.Mock).mockResolvedValue({ id: 'test-id' })

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Test',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '10',
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    dataCadastro: expect.any(String),
                })
            )
        })

        it('should handle Firestore errors gracefully', async () => {
            const mockError = new Error('Firestore error')
                ; (addDoc as jest.Mock).mockRejectedValue(mockError)

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Test',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '10',
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(toast.error).toHaveBeenCalled()
            expect(mockOnSuccess).not.toHaveBeenCalled()

            // Should stop submitting
            expect(result.current.isSubmitting).toBe(false)
        })
    })

    describe('handleSubmit - Edit Mode', () => {
        it('should update existing certificado', async () => {
            const mockDocRef = {}
                ; (doc as jest.Mock).mockReturnValue(mockDocRef)
                ; (updateDoc as jest.Mock).mockResolvedValue(undefined)

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            // Set to edit mode using handleEdit
            act(() => {
                result.current.handleEdit({
                    id: 'cert-123',
                    userId: 'test-user-id',
                    titulo: 'Original Course',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: 40,
                    dataInicio: '2024-01-01',
                    dataFim: '2024-02-01',
                    descricao: 'Original description',
                    linkExterno: '',
                    status: 'aprovado',
                    dataCadastro: '2024-01-01',
                } as any)  // Using any to avoid branded type issues
            })

            // Update form data
            act(() => {
                result.current.setFormData(prev => ({
                    ...prev,
                    titulo: 'Updated Course',
                    cargaHoraria: '60',
                    descricao: 'Updated description',
                }))
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            // Verify updateDoc was called
            expect(doc).toHaveBeenCalledWith(db, 'certificados', 'cert-123')
            expect(updateDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.objectContaining({
                    titulo: 'Updated Course',
                    cargaHoraria: 60,
                })
            )

            // Verify success toast
            expect(toast.success).toHaveBeenCalled()

            // Verify callback
            expect(mockOnSuccess).toHaveBeenCalled()

            // Should exit edit mode and reset
            await waitFor(() => {
                expect(result.current.editingId).toBeNull()
                expect(result.current.formData.titulo).toBe('')
            })
        })

        it('should not include dataCadastro when updating', async () => {
            ; (doc as jest.Mock).mockReturnValue({})
                ; (updateDoc as jest.Mock).mockResolvedValue(undefined)

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.handleEdit({
                    id: 'cert-123',
                    userId: 'test-user-id',
                    titulo: 'Original',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: 30,
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                    status: 'aprovado',
                    dataCadastro: '2024-01-01',
                } as any)
            })

            act(() => {
                result.current.setFormData(prev => ({
                    ...prev,
                    titulo: 'Updated',
                }))
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            const updateCall = (updateDoc as jest.Mock).mock.calls[0][1]
            expect(updateCall).not.toHaveProperty('dataCadastro')
        })
    })

    describe('handleEdit', () => {
        it('should populate form with certificado data', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            const mockCertificado = {
                id: 'cert-456',
                userId: 'test-user-id',
                titulo: 'Test Certificate',
                tipo: 'curso' as const,
                instituicao: 'UFBA',
                cargaHoraria: 50,
                dataInicio: '2024-01-01',
                dataFim: '2024-02-01',
                descricao: 'Test description',
                linkExterno: 'https://example.com',
                status: 'aprovado' as const,
                dataCadastro: '2024-01-01',
            } as any

            act(() => {
                result.current.handleEdit(mockCertificado)
            })

            expect(result.current.editingId).toBe('cert-456')
            expect(result.current.formData.titulo).toBe('Test Certificate')
            expect(result.current.formData.cargaHoraria).toBe('50')  // Converted to string
            expect(result.current.showForm).toBe(true)
        })

        it('should handle missing optional fields', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            const mockCertificado = {
                id: 'cert-789',
                userId: 'test-user-id',
                titulo: 'Minimal Certificate',
                tipo: 'curso' as const,
                instituicao: 'UFBA',
                cargaHoraria: 20,
                dataInicio: '2024-01-01',
                dataFim: '',
                status: 'aprovado' as const,
                dataCadastro: '2024-01-01',
            } as any

            act(() => {
                result.current.handleEdit(mockCertificado)
            })

            expect(result.current.formData.descricao).toBe('')
            expect(result.current.formData.linkExterno).toBe('')
        })
    })

    describe('resetForm', () => {
        it('should reset form to initial state', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            // Fill form first by editing
            act(() => {
                result.current.handleEdit({
                    id: 'cert-123',
                    userId: 'test-user-id',
                    titulo: 'Test Course',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: 40,
                    dataInicio: '2024-01-01',
                    dataFim: '2024-02-01',
                    descricao: 'Description',
                    linkExterno: 'https://example.com',
                    status: 'aprovado',
                    dataCadastro: '2024-01-01',
                } as any)
            })

            // Reset
            act(() => {
                result.current.resetForm()
            })

            // Verify reset
            expect(result.current.formData).toEqual({
                titulo: '',
                tipo: '',
                instituicao: '',
                cargaHoraria: '',
                dataInicio: '',
                dataFim: '',
                descricao: '',
                linkExterno: '',
            })
            expect(result.current.editingId).toBeNull()
        })

        it('should be callable multiple times', () => {
            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({ ...result.current.formData, titulo: 'Test' })
                result.current.resetForm()
                result.current.setFormData({ ...result.current.formData, titulo: 'Test 2' })
                result.current.resetForm()
            })

            expect(result.current.formData.titulo).toBe('')
        })
    })

    describe('Submitting State', () => {
        it.skip('should set isSubmitting to true during submit', async () => {
            let resolvePromise: any
                ; (addDoc as jest.Mock).mockImplementation(
                    () => new Promise(resolve => {
                        resolvePromise = resolve
                    })
                )

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Test',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '10',
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                })
            })

            // Start submit (don't await yet)
            const submitPromise = act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            // Wait for submitting state to update
            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(true)
            })

            // Resolve the promise and wait for completion
            resolvePromise({ id: 'test' })
            await submitPromise

            // Should not be submitting after completion
            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false)
            })
        })

        it.skip('should reset isSubmitting even on error', async () => {
            ; (addDoc as jest.Mock).mockRejectedValue(new Error('Test error'))

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Test',
                    tipo: 'curso',
                    instituicao: 'UFBA',
                    cargaHoraria: '10',
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '',
                    linkExterno: '',
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(result.current.isSubmitting).toBe(false)
        })
    })

    describe('Edge Cases', () => {
        it.skip('should handle optional fields correctly', async () => {
            ; (addDoc as jest.Mock).mockResolvedValue({ id: 'test' })

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: 'Minimal Course',
                    tipo: 'curso',
                    instituicao: '',  // Optional
                    cargaHoraria: '10',
                    dataInicio: '2024-01-01',
                    dataFim: '',  // Optional
                    descricao: '',  // Optional
                    linkExterno: '',  // Optional
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(addDoc).toHaveBeenCalled()
            expect(toast.success).toHaveBeenCalled()
        })

        it.skip('should trim whitespace from text fields', async () => {
            ; (addDoc as jest.Mock).mockResolvedValue({ id: 'test' })

            const { result } = renderHook(() => useCertificadoForm(mockOnSuccess))

            act(() => {
                result.current.setFormData({
                    titulo: '  Curso com espaços  ',
                    tipo: 'curso',
                    instituicao: '  UFBA  ',
                    cargaHoraria: '10',
                    dataInicio: '2024-01-01',
                    dataFim: '',
                    descricao: '  Descrição com espaços  ',
                    linkExterno: '',
                })
            })

            await act(async () => {
                const mockEvent = { preventDefault: jest.fn() } as any
                await result.current.handleSubmit(mockEvent)
            })

            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    titulo: 'Curso com espaços',
                    instituicao: 'UFBA',
                    descricao: 'Descrição com espaços',
                })
            )
        })
    })
})
