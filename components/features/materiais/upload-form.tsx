'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'


import { Progress } from '@/components/ui/progress'
import { addMaterial, getDisciplinas } from '@/services/materials.service'
import { uploadFileWithProgress } from '@/services/storage.service'
import { toast } from '@/lib/toast'
import { useAuth } from '@/components/auth-provider'
import { CURSOS } from '@/lib/constants'
import {
  TIPO_MATERIAL_LABELS, TIPOS_MATERIAL, CURSO_LABELS,
  getSemestres, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB,
} from '@/lib/materiais-constants'
import type { Curso, TipoMaterial, UserId } from '@/types'

const schema = z.object({
  titulo:     z.string().min(3, 'Mínimo 3 caracteres').max(100),
  descricao:  z.string().max(500).optional(),
  curso:      z.string().min(1, 'Selecione o curso'),
  disciplina: z.string().min(2, 'Informe a disciplina').max(100),
  semestre:   z.string().min(1, 'Selecione o semestre'),
  tipo:       z.string().min(1, 'Selecione o tipo'),
})

type FormValues = z.infer<typeof schema>

interface UploadMaterialFormProps {
  onSuccess?: () => void
  /** Quando true, omite o Card wrapper (ex: dentro de um Sheet) */
  bare?: boolean
}

export function UploadMaterialForm({ onSuccess, bare = false }: UploadMaterialFormProps = {}) {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [disciplinas, setDisciplinas] = useState<string[]>([])

  useEffect(() => {
    getDisciplinas().then(setDisciplinas)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function validateAndSetFile(selected: File | undefined) {
    setFileError(null)
    setFile(null)
    if (!selected) return
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Apenas arquivos PDF são aceitos.')
      return
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB} MB.`)
      return
    }
    setFile(selected)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(e.target.files?.[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    validateAndSetFile(e.dataTransfer.files?.[0])
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function removeFile() {
    setFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onSubmit(values: FormValues) {
    if (!user) { toast.error('Você precisa estar logado.'); return }
    if (!file) { setFileError('Selecione um arquivo PDF.'); return }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `materiais/${user.uid}/${Date.now()}_${safeName}`

      const arquivoURL = await uploadFileWithProgress(file, storagePath, (pct) => {
        setUploadProgress(pct)
      })

      await addMaterial(
        {
          titulo:       values.titulo,
          descricao:    values.descricao || undefined,
          curso:        values.curso as Curso,
          disciplina:   values.disciplina,
          semestre:     values.semestre,
          tipo:         values.tipo as TipoMaterial,
          uploadedBy:   user.uid as UserId,
          uploaderName: user.displayName ?? user.email ?? 'Anônimo',
          arquivoURL,
          storagePath,
          nomeArquivo:  file.name,
          sizeBytes:    file.size,
        },
        user.uid as UserId
      )

      toast.success('Material enviado com sucesso!')
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/materiais/meus')
      }
    } catch {
      toast.error('Erro ao enviar material. Tente novamente.')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" {...register('titulo')} placeholder="Ex: Lista 3 — Cálculo A" />
            {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Informações adicionais sobre o material..."
              rows={3}
              className="resize-none"
            />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
          </div>

          {/* Curso + Semestre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="curso">Curso *</Label>
              <Select id="curso" {...register('curso')}>
                <option value="">Selecione...</option>
                {Object.keys(CURSOS).map(c => (
                  <option key={c} value={c}>{CURSO_LABELS[c as Curso] ?? c}</option>
                ))}
              </Select>
              {errors.curso && <p className="text-xs text-destructive">{errors.curso.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="semestre">Semestre *</Label>
              <Select id="semestre" {...register('semestre')}>
                <option value="">Selecione...</option>
                {getSemestres().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              {errors.semestre && <p className="text-xs text-destructive">{errors.semestre.message}</p>}
            </div>
          </div>

          {/* Disciplina + Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="disciplina">Disciplina *</Label>
              <Input
                id="disciplina"
                {...register('disciplina')}
                placeholder="Ex: Cálculo A"
                list="disciplinas-list"
                autoComplete="off"
              />
              {disciplinas.length > 0 && (
                <datalist id="disciplinas-list">
                  {disciplinas.map(d => <option key={d} value={d} />)}
                </datalist>
              )}
              {errors.disciplina && <p className="text-xs text-destructive">{errors.disciplina.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select id="tipo" {...register('tipo')}>
                <option value="">Selecione...</option>
                {TIPOS_MATERIAL.map(t => (
                  <option key={t} value={t}>{TIPO_MATERIAL_LABELS[t]}</option>
                ))}
              </Select>
              {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
            </div>
          </div>

          {/* Arquivo */}
          <div className="space-y-1.5">
            <Label>Arquivo PDF *</Label>
            {file ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border dark:border-slate-700 bg-muted/40">
                <FileText className="h-5 w-5 text-primary dark:text-blue-400 shrink-0" />
                <span className="text-sm truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remover arquivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full flex flex-col items-center gap-2 p-8 rounded-lg border-2 border-dashed transition-all text-muted-foreground ${
                  isDragging
                    ? 'border-primary dark:border-blue-400 bg-primary/10 dark:bg-blue-500/10 scale-[1.01]'
                    : 'border-border dark:border-slate-700 hover:border-primary/50 dark:hover:border-blue-500/50 hover:bg-primary/5 dark:hover:bg-blue-500/5'
                }`}
              >
                <Upload className={`h-8 w-8 transition-transform ${isDragging ? 'scale-110 text-primary dark:text-blue-400' : 'opacity-40'}`} />
                <div className="text-center">
                  <span className="text-sm font-medium block">
                    {isDragging ? 'Solte o arquivo aqui' : 'Arraste um PDF ou clique para selecionar'}
                  </span>
                  <span className="text-xs mt-0.5 block">Máximo {MAX_FILE_SIZE_MB} MB</span>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="sr-only"
            />
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          </div>

          {/* Progresso */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Enviando... {uploadProgress}%</p>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              <><Upload className="h-4 w-4" /> Enviar Material</>
            )}
          </Button>
        </form>
  )

  if (bare) return formContent

  return (
    <Card className="max-w-2xl mx-auto dark:border-slate-700 dark:bg-slate-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary dark:text-blue-400" />
          Enviar Material
        </CardTitle>
        <CardDescription>
          Preencha os dados e selecione o PDF. O material ficará visível imediatamente.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  )
}
