'use client'

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CURSOS, NATUREZA_LABELS } from '@/lib/constants'
import { calcularResultado, getPeriodoMaisRecente, sanitizeInput } from '@/lib/utils'
import { PlusCircle, X } from 'lucide-react'
import type { Curso, Disciplina, Natureza } from '@/types'

const disciplineSchema = z
  .object({
    periodo: z.string().min(1, 'Período é obrigatório'),
    codigo: z.string().min(1, 'Código é obrigatório'),
    nome: z.string().min(1, 'Nome é obrigatório'),
    natureza: z.string().min(1, 'Natureza é obrigatória'),
    ch: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(1, 'Carga horária deve ser maior que 0')
    ),
    nota: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(0).max(10, 'Nota deve estar entre 0 e 10').optional()
    ),
    trancamento: z.boolean().optional(),
    dispensada: z.boolean().optional(),
    emcurso: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // AC não precisa de nota
      if (data.natureza === 'AC') return true
      // Outras naturezas precisam de nota se não for trancamento, dispensada ou em curso
      if (data.trancamento || data.dispensada || data.emcurso) return true
      return data.nota !== undefined && data.nota !== null
    },
    {
      message: 'Nota é obrigatória para esta natureza',
      path: ['nota'],
    }
  )

type DisciplineFormData = z.infer<typeof disciplineSchema>

interface DisciplineFormProps {
  cursoAtual: Curso
  onAdd: (disciplina: Disciplina) => void
  onUpdate?: (disciplina: Disciplina, index: number) => void
  disciplinas?: Disciplina[]
  onDisciplineSelect?: (disciplina: { codigo: string; nome: string; natureza: Natureza; ch?: number }) => void
}

export interface DisciplineFormRef {
  fillForm: (disciplina: { codigo: string; nome: string; natureza: string; ch?: number }) => void
  editDiscipline: (disciplina: Disciplina, index: number) => void
  resetForm: () => void
}

export const DisciplineForm = forwardRef<DisciplineFormRef, DisciplineFormProps>(
  ({ cursoAtual, onAdd, onUpdate, disciplinas = [], onDisciplineSelect }, ref) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DisciplineFormData>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      periodo: getPeriodoMaisRecente(disciplinas) || '',
      codigo: '',
      nome: '',
      natureza: '',
      ch: '' as any, // string vazia para mostrar placeholder
      nota: '' as any, // string vazia para mostrar placeholder
      trancamento: false,
      dispensada: false,
      emcurso: false,
    },
  })

  const trancamento = watch('trancamento')
  const dispensada = watch('dispensada')
  const emcurso = watch('emcurso')
  const natureza = watch('natureza')
  const isAC = natureza === 'AC'
  
  // Verificar se algum campo está preenchido
  const periodo = watch('periodo')
  const codigo = watch('codigo')
  const nome = watch('nome')
  const ch = watch('ch')
  const nota = watch('nota')

  // Desmarcar automaticamente "em curso" quando uma nota válida for inserida
  useEffect(() => {
    // Só desmarcar se:
    // 1. Não for natureza AC (AC não tem nota)
    // 2. A nota for válida (número definido e >= 0)
    // 3. "Em curso" estiver marcado
    // 4. Não for trancamento ou dispensada
    if (
      !isAC &&
      typeof nota === 'number' &&
      nota >= 0 &&
      emcurso &&
      !trancamento &&
      !dispensada
    ) {
      setValue('emcurso', false)
    }
  }, [nota, emcurso, isAC, trancamento, dispensada, setValue])
  
  const periodoMaisRecente = getPeriodoMaisRecente(disciplinas) || ''
  const hasFilledFields = 
    (periodo && periodo.trim() !== '' && periodo !== periodoMaisRecente) ||
    (codigo && codigo.trim() !== '') ||
    (nome && nome.trim() !== '') ||
    (natureza && natureza.trim() !== '') ||
    (typeof ch === 'number' && ch > 0) ||
    (typeof nota === 'number' && nota > 0) ||
    trancamento ||
    dispensada ||
    emcurso

  const naturezasDisponiveis = Object.keys(CURSOS[cursoAtual].requisitos) as Natureza[]

  // Expor métodos para preencher formulário via ref
  useImperativeHandle(ref, () => ({
    fillForm: (disciplina: { codigo: string; nome: string; natureza: string; ch?: number }) => {
      setValue('codigo', disciplina.codigo)
      setValue('nome', disciplina.nome)
      setValue('natureza', disciplina.natureza)
      if (disciplina.ch) {
        setValue('ch', disciplina.ch)
      }
      // Focar no campo de nota após preencher
      setTimeout(() => {
        const notaInput = document.getElementById('nota')
        if (notaInput) {
          notaInput.focus()
        }
      }, 100)
      
      if (onDisciplineSelect) {
        onDisciplineSelect(disciplina as { codigo: string; nome: string; natureza: Natureza; ch?: number })
      }
    },
    editDiscipline: (disciplina: Disciplina, index: number) => {
      setValue('periodo', disciplina.periodo)
      setValue('codigo', disciplina.codigo)
      setValue('nome', disciplina.nome)
      setValue('natureza', disciplina.natureza)
      setValue('ch', disciplina.ch)
      // AC não tem nota, então não definir nota para AC
      if (disciplina.natureza !== 'AC') {
        setValue('nota', disciplina.nota || 0)
      } else {
        setValue('nota', undefined)
      }
      setValue('trancamento', disciplina.trancamento || false)
      setValue('dispensada', disciplina.dispensada || false)
      setValue('emcurso', disciplina.emcurso || false)
      setEditingIndex(index)
      setEditingId(disciplina.id)
      
      // Scroll suave até o formulário
      setTimeout(() => {
        const formElement = document.getElementById('disciplinaForm')
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    },
    resetForm: () => {
      reset({
        periodo: getPeriodoMaisRecente(disciplinas) || '',
        codigo: '',
        nome: '',
        natureza: '',
        ch: '' as any, // string vazia para mostrar placeholder
        nota: '' as any, // string vazia para mostrar placeholder
        trancamento: false,
        dispensada: false,
        emcurso: false,
      })
      setEditingIndex(null)
      setEditingId(undefined)
    },
  }))

  const onSubmit = async (data: DisciplineFormData) => {
    setIsSubmitting(true)
    try {
      // AC não tem resultado, nota ou PCH
      const isAC = data.natureza === 'AC'
      
      const disciplina: Disciplina = {
        periodo: sanitizeInput(data.periodo),
        codigo: sanitizeInput(data.codigo),
        nome: sanitizeInput(data.nome),
        natureza: data.natureza as Natureza,
        ch: data.ch,
        nota: isAC ? 0 : (data.nota || 0), // AC não tem nota, usar 0 como padrão
        trancamento: data.trancamento || false,
        dispensada: data.dispensada || false,
        emcurso: data.emcurso || false,
        resultado: isAC 
          ? undefined // AC não tem resultado
          : calcularResultado(
              data.nota || 0,
              data.trancamento,
              data.dispensada,
              data.emcurso,
              data.natureza
            ),
        curso: cursoAtual,
      }

      // Se estiver em modo de edição, atualizar ao invés de adicionar
      if (editingIndex !== null && onUpdate) {
        disciplina.id = editingId
        onUpdate(disciplina, editingIndex)
        setEditingIndex(null)
        setEditingId(undefined)
      } else {
        onAdd(disciplina)
      }

      reset({
        periodo: getPeriodoMaisRecente(disciplinas) || '',
        codigo: '',
        nome: '',
        natureza: '',
        ch: '' as any, // string vazia para mostrar placeholder
        nota: '' as any, // string vazia para mostrar placeholder
        trancamento: false,
        dispensada: false,
        emcurso: false,
      })
    } catch (error) {
      console.error('Erro ao adicionar/atualizar disciplina:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
                  <CardTitle as="h2" className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    {editingIndex !== null ? 'Editar Disciplina' : 'Adicionar Disciplina'}
                  </CardTitle>
                  <CardDescription>
                    {editingIndex !== null
                      ? 'Edite os dados da disciplina e salve as alterações.'
                      : 'Insira os dados da disciplina cursada para adicionar ao seu histórico acadêmico.'}
                  </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="disciplinaForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo">Semestre</Label>
              <Input
                id="periodo"
                placeholder="Ex: 2025.1"
                {...register('periodo')}
                aria-invalid={errors.periodo ? 'true' : 'false'}
              />
              {errors.periodo && (
                <p className="text-sm text-destructive">{errors.periodo.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Formato: AAAA.S (ex: 2025.1)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="Ex: CTIA01 ou AC"
                {...register('codigo')}
                aria-invalid={errors.codigo ? 'true' : 'false'}
              />
              {errors.codigo && (
                <p className="text-sm text-destructive">{errors.codigo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Disciplina</Label>
            <Input
              id="nome"
              placeholder="Ex: Introdução a Computação"
              {...register('nome')}
              aria-invalid={errors.nome ? 'true' : 'false'}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="natureza">Natureza</Label>
              <select
                id="natureza"
                {...register('natureza')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={errors.natureza ? 'true' : 'false'}
              >
                <option value="">Selecione a natureza</option>
                {naturezasDisponiveis.map((natureza) => (
                  <option key={natureza} value={natureza}>
                    {NATUREZA_LABELS[natureza]}
                  </option>
                ))}
              </select>
              {errors.natureza && (
                <p className="text-sm text-destructive">{errors.natureza.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status da Disciplina</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="trancamento" {...register('trancamento')} />
                  <Label htmlFor="trancamento" className="font-normal cursor-pointer">
                    Trancamento
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dispensada" {...register('dispensada')} />
                  <Label htmlFor="dispensada" className="font-normal cursor-pointer">
                    Dispensada
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="emcurso" {...register('emcurso')} />
                  <Label htmlFor="emcurso" className="font-normal cursor-pointer">
                    Em curso
                  </Label>
                </div>
              </div>
            </div>
          </div>

                    {!trancamento && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ch">Carga Horária</Label>
                          <Input
                            id="ch"
                            type="number"
                            min="1"
                            max="300"
                            placeholder="Ex: 60 horas"
                            {...register('ch', { 
                              valueAsNumber: false,
                              setValueAs: (v) => {
                                if (v === '' || v === undefined || v === null) return undefined
                                const num = Number(v)
                                return isNaN(num) ? undefined : num
                              }
                            })}
                            aria-invalid={errors.ch ? 'true' : 'false'}
                          />
                          {errors.ch && <p className="text-sm text-destructive">{errors.ch.message}</p>}
                        </div>

                        {!isAC && (
                          <div className="space-y-2">
                            <Label htmlFor="nota">Nota</Label>
                            <Input
                              id="nota"
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="Ex: 8.5 (0 a 10)"
                              {...register('nota', { 
                                valueAsNumber: false,
                                setValueAs: (v) => {
                                  if (v === '' || v === undefined || v === null) return undefined
                                  const num = Number(v)
                                  return isNaN(num) ? undefined : num
                                }
                              })}
                              aria-invalid={errors.nota ? 'true' : 'false'}
                            />
                            {errors.nota && <p className="text-sm text-destructive">{errors.nota.message}</p>}
                          </div>
                        )}

                        {isAC && (
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Atividade Complementar</Label>
                            <p className="text-sm text-muted-foreground">
                              Atividades complementares não possuem nota, apenas carga horária.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      {editingIndex !== null && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            reset({
                              periodo: getPeriodoMaisRecente(disciplinas) || '',
                              codigo: '',
                              nome: '',
                              natureza: '',
                              ch: '' as any, // string vazia para mostrar placeholder
                              nota: '' as any, // string vazia para mostrar placeholder
                              trancamento: false,
                              dispensada: false,
                              emcurso: false,
                            })
                            setEditingIndex(null)
                            setEditingId(undefined)
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                      {hasFilledFields && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            reset({
                              periodo: getPeriodoMaisRecente(disciplinas) || '',
                              codigo: '',
                              nome: '',
                              natureza: '',
                              ch: '' as any, // string vazia para mostrar placeholder
                              nota: '' as any, // string vazia para mostrar placeholder
                              trancamento: false,
                              dispensada: false,
                              emcurso: false,
                            })
                            setEditingIndex(null)
                            setEditingId(undefined)
                          }}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpar Campos
                        </Button>
                      )}
                      <Button type="submit" disabled={isSubmitting}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {isSubmitting
                          ? editingIndex !== null
                            ? 'Salvando...'
                            : 'Adicionando...'
                          : editingIndex !== null
                          ? 'Salvar Alterações'
                          : 'Adicionar Disciplina'}
                      </Button>
                    </div>
        </form>
      </CardContent>
    </Card>
  )
})

DisciplineForm.displayName = 'DisciplineForm'

