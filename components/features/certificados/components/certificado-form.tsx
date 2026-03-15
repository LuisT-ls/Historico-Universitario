import { memo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, FileText, Loader2, Calendar as CalendarIcon, ScanText, CheckCircle2 } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { TIPOS_CERTIFICADO } from '../constants'
import { useDateMask, formatDateToDisplay } from '../hooks/use-date-mask'
import type { CertificadoFormData } from '../hooks/use-certificado-form'
import { parseCertificadoPDF } from '@/lib/certificate-ocr'

const FIELD_LABELS: Record<string, string> = {
  titulo: 'Título',
  instituicao: 'Instituição',
  cargaHoraria: 'Carga Horária',
  dataInicio: 'Data Início',
  dataFim: 'Data Fim',
}

interface CertificadoFormProps {
    showForm: boolean
    setShowForm: (show: boolean) => void
    formData: CertificadoFormData
    setFormData: React.Dispatch<React.SetStateAction<CertificadoFormData>>
    isSubmitting: boolean
    editingId: string | null
    handleSubmit: (e: React.FormEvent) => void
    resetForm: () => void
}

export const CertificadoForm = memo<CertificadoFormProps>(
    ({ showForm, setShowForm, formData, setFormData, isSubmitting, editingId, handleSubmit, resetForm }) => {
        const { handleDateChange } = useDateMask()
        const ocrInputRef = useRef<HTMLInputElement>(null)
        const [isOcrLoading, setIsOcrLoading] = useState(false)
        const [ocrFields, setOcrFields] = useState<string[]>([])

        const handleOcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return
            setIsOcrLoading(true)
            setOcrFields([])
            try {
                const result = await parseCertificadoPDF(file)
                setFormData(prev => ({
                    ...prev,
                    ...(result.titulo && { titulo: result.titulo }),
                    ...(result.instituicao && { instituicao: result.instituicao }),
                    ...(result.cargaHoraria && { cargaHoraria: String(result.cargaHoraria) }),
                    ...(result.dataInicio && { dataInicio: result.dataInicio }),
                    ...(result.dataFim && { dataFim: result.dataFim }),
                }))
                setOcrFields(result.camposEncontrados)
            } catch {
                // Silently fail — user fills manually
            } finally {
                setIsOcrLoading(false)
                // Reset input so the same file can be re-selected
                if (ocrInputRef.current) ocrInputRef.current.value = ''
            }
        }

        if (!showForm) return null

        return (
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle as="h2" className="flex items-center gap-2">
                        {editingId ? (
                            <>
                                <Pencil className="h-5 w-5" />
                                Editar Certificado
                            </>
                        ) : (
                            <>
                                <Plus className="h-5 w-5" />
                                Adicionar Certificado
                            </>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {editingId
                            ? 'Edite os dados do certificado ou atividade complementar'
                            : 'Cadastre um novo certificado ou atividade complementar'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* OCR — Extração automática de dados do PDF */}
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
                            <input
                                ref={ocrInputRef}
                                type="file"
                                accept="application/pdf"
                                className="sr-only"
                                onChange={handleOcrFile}
                            />
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <ScanText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Extrair dados do PDF</p>
                                        <p className="text-xs text-muted-foreground">Preenche os campos automaticamente a partir do certificado</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => ocrInputRef.current?.click()}
                                    disabled={isOcrLoading}
                                >
                                    {isOcrLoading
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Lendo...</>
                                        : 'Selecionar PDF'
                                    }
                                </Button>
                            </div>
                            {ocrFields.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {ocrFields.map(field => (
                                        <span key={field} className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {FIELD_LABELS[field] ?? field}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título da Atividade</Label>
                                <Input
                                    id="titulo"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ex: Curso de Python para Iniciantes"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Atividade (Opcional)</Label>
                                <Select
                                    id="tipo"
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as CertificadoFormData['tipo'] })}
                                >
                                    <option value="">Selecione o tipo (Auto: Outro)</option>
                                    {TIPOS_CERTIFICADO.map((tipo) => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instituicao">Instituição (Opcional)</Label>
                                <Input
                                    id="instituicao"
                                    value={formData.instituicao}
                                    onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                                    placeholder="Ex: Universidade Federal da Bahia"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cargaHoraria">Carga Horária (horas)</Label>
                                <Input
                                    id="cargaHoraria"
                                    type="number"
                                    min="1"
                                    value={formData.cargaHoraria}
                                    onChange={(e) => setFormData({ ...formData, cargaHoraria: e.target.value })}
                                    placeholder="Ex: 20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dataInicio">Data de Início</Label>
                                <div className="relative">
                                    <Input
                                        id="dataInicio"
                                        type="text"
                                        placeholder="DD/MM/AAAA"
                                        maxLength={10}
                                        value={formatDateToDisplay(formData.dataInicio)}
                                        onChange={(e) => handleDateChange(e.target.value, 'dataInicio', setFormData)}
                                        required
                                        className="pr-10"
                                    />
                                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() =>
                                                (document.getElementById('picker-dataInicio') as HTMLInputElement)?.showPicker()
                                            }
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                        <input
                                            type="date"
                                            id="picker-dataInicio"
                                            className="sr-only"
                                            tabIndex={-1}
                                            onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dataFim">Data de Conclusão (Opcional)</Label>
                                <div className="relative">
                                    <Input
                                        id="dataFim"
                                        type="text"
                                        placeholder="DD/MM/AAAA"
                                        maxLength={10}
                                        value={formatDateToDisplay(formData.dataFim)}
                                        onChange={(e) => handleDateChange(e.target.value, 'dataFim', setFormData)}
                                        className="pr-10"
                                    />
                                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() =>
                                                (document.getElementById('picker-dataFim') as HTMLInputElement)?.showPicker()
                                            }
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                        <input
                                            type="date"
                                            id="picker-dataFim"
                                            className="sr-only"
                                            tabIndex={-1}
                                            onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Descreva brevemente a atividade realizada..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkExterno">Link do Certificado (Google Drive / Dropbox)</Label>
                            <Input
                                id="linkExterno"
                                type="url"
                                value={formData.linkExterno}
                                onChange={(e) => setFormData({ ...formData, linkExterno: e.target.value })}
                                placeholder="https://drive.google.com/..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Opcional: Adicione um link para visualização do comprovante
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {editingId ? 'Atualizando...' : 'Salvando...'}
                                    </>
                                ) : (
                                    <>
                                        {editingId ? <Pencil className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                                        {editingId ? 'Atualizar Certificado' : 'Salvar Certificado'}
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false)
                                    resetForm()
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }
)

CertificadoForm.displayName = 'CertificadoForm'
