'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { CURSOS } from '@/lib/constants'
import type { Curso } from '@/types'

interface CourseSelectionProps {
  cursoAtual: Curso
  onCursoChange: (curso: Curso) => void
}

export function CourseSelection({ cursoAtual, onCursoChange }: CourseSelectionProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle as="h2">Seleção de Curso</CardTitle>
        <CardDescription>Selecione seu curso para calcular os requisitos corretos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="curso">Curso</Label>
          <select
            id="curso"
            value={cursoAtual}
            onChange={(e) => onCursoChange(e.target.value as Curso)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="BICTI">
              BICTI - Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação
            </option>
            <option value="ENG_PROD">Engenharia de Produção</option>
            <option value="ENG_ELET">Engenharia Elétrica</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}

