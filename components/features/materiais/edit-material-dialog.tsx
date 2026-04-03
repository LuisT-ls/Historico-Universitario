'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateMaterial, getDisciplinas } from '@/services/materials.service'
import { toast } from '@/lib/toast'
import { CURSOS } from '@/lib/constants'
import { TIPO_MATERIAL_LABELS, TIPOS_MATERIAL, CURSO_LABELS, getSemestres } from '@/lib/materiais-constants'
import type { Material, Curso, TipoMaterial } from '@/types'

const schema = z.object({
  titulo:     z.string().min(3, 'Mínimo 3 caracteres').max(100),
  descricao:  z.string().max(500).optional(),
  curso:      z.string().min(1, 'Selecione o curso'),
  disciplina: z.string().min(2, 'Informe a disciplina').max(100),
  semestre:   z.string().min(1, 'Selecione o semestre'),
  tipo:       z.string().min(1, 'Selecione o tipo'),
})

type FormValues = z.infer<typeof schema>

interface EditMaterialDialogProps {
  material: Material
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updated: Partial<Material>) => void
}

export function EditMaterialDialog({ material, open, onOpenChange, onSaved }: EditMaterialDialogProps) {
  const [disciplinas, setDisciplinas] = useState<string[]>([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) getDisciplinas().then(setDisciplinas)
  }, [open])

  useEffect(() => {
    if (open) {
      reset({
        titulo:     material.titulo,
        descricao:  material.descricao ?? '',
        curso:      material.curso,
        disciplina: material.disciplina,
        semestre:   material.semestre,
        tipo:       material.tipo,
      })
    }
  }, [open, material, reset])

  async function onSubmit(values: FormValues) {
    try {
      await updateMaterial(material.id!, {
        titulo:     values.titulo,
        descricao:  values.descricao || undefined,
        curso:      values.curso as Curso,
        disciplina: values.disciplina,
        semestre:   values.semestre,
        tipo:       values.tipo as TipoMaterial,
      })
      toast.success('Material atualizado!')
      onSaved({ ...values, curso: values.curso as Curso, tipo: values.tipo as TipoMaterial })
      onOpenChange(false)
    } catch {
      toast.error('Erro ao atualizar material.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
          <DialogDescription>Altere os metadados do material. O arquivo PDF não pode ser substituído.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-titulo">Título *</Label>
            <Input id="edit-titulo" {...register('titulo')} />
            {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-descricao">Descrição</Label>
            <Textarea id="edit-descricao" {...register('descricao')} rows={3} className="resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-curso">Curso *</Label>
              <Select id="edit-curso" {...register('curso')}>
                <option value="">Selecione...</option>
                {Object.keys(CURSOS).map(c => (
                  <option key={c} value={c}>{CURSO_LABELS[c as Curso] ?? c}</option>
                ))}
              </Select>
              {errors.curso && <p className="text-xs text-destructive">{errors.curso.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-semestre">Semestre *</Label>
              <Select id="edit-semestre" {...register('semestre')}>
                <option value="">Selecione...</option>
                {getSemestres().map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              {errors.semestre && <p className="text-xs text-destructive">{errors.semestre.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-disciplina">Disciplina *</Label>
              <Input
                id="edit-disciplina"
                {...register('disciplina')}
                list="edit-disciplinas-list"
                autoComplete="off"
              />
              {disciplinas.length > 0 && (
                <datalist id="edit-disciplinas-list">
                  {disciplinas.map(d => <option key={d} value={d} />)}
                </datalist>
              )}
              {errors.disciplina && <p className="text-xs text-destructive">{errors.disciplina.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-tipo">Tipo *</Label>
              <Select id="edit-tipo" {...register('tipo')}>
                <option value="">Selecione...</option>
                {TIPOS_MATERIAL.map(t => (
                  <option key={t} value={t}>{TIPO_MATERIAL_LABELS[t]}</option>
                ))}
              </Select>
              {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
