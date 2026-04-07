'use client'

import { GroupMaterial, GroupId } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Plus, FileText, Link as LinkIcon, Trash2, ExternalLink, Download, Loader2, FileUp, Globe } from 'lucide-react'
import { useState } from 'react'
import { uploadFileWithProgress } from '@/services/storage.service'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'

const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/javascript',
    'application/javascript',
    'application/x-ipynb+json',
    'application/json',
    'text/x-python',
    'text/html',
    'text/css'
]

const ALLOWED_EXTENSIONS = ['.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.jpg','.jpeg','.png','.gif','.zip','.txt','.py','.ipynb','.js','.ts','.java','.c','.cpp','.html','.css']

const ALLOWED_FILE_ACCEPT = ALLOWED_EXTENSIONS.join(',')

const isAllowedFile = (file: File) => {
    if (ALLOWED_FILE_TYPES.includes(file.type)) return true
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    return ALLOWED_EXTENSIONS.includes(ext)
}

const linkSchema = z.object({
    title: z.string().min(1, 'Título obrigatório').max(100, 'Máximo 100 caracteres'),
    url: z
        .string()
        .min(1, 'URL obrigatória')
        .refine(
            (val) => {
                try {
                    const normalized = val.startsWith('http') ? val : `https://${val}`
                    const parsed = new URL(normalized)
                    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
                } catch {
                    return false
                }
            },
            'URL inválida. Use um endereço http/https válido.'
        ),
})

interface MaterialListProps {
    groupId: GroupId
    materials: GroupMaterial[]
    isLoading: boolean
    onAdd: (title: string, type: 'file' | 'link', url: string, storagePath?: string, sizeBytes?: number) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

/**
 * Gerenciador de materiais do grupo (Arquivos e Links).
 */
export function MaterialList({ groupId, materials, isLoading, onAdd, onDelete }: MaterialListProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [addType, setAddType] = useState<'file' | 'link'>('file')
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const handleFileChange = (selected: File | undefined) => {
        if (!selected) return setFile(null)
        if (!isAllowedFile(selected)) {
            toast.error('Tipo de arquivo não permitido. Use PDF, Docs, Imagens, ZIP ou Códigos (.py, .js, .ipynb, etc).')
            return
        }
        setFile(selected)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setUploadProgress(null)
        try {
            if (addType === 'link') {
                const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
                const validation = linkSchema.safeParse({ title: title.trim(), url: normalized })
                if (!validation.success) {
                    throw new Error(validation.error.errors[0].message)
                }
                await onAdd(title.trim(), 'link', normalized)
            } else {
                if (!title.trim()) throw new Error('Dê um título ao material')
                if (!file) throw new Error('Selecione um arquivo para upload')
                if (!isAllowedFile(file)) throw new Error('Tipo de arquivo não permitido.')

                const path = `groups/${groupId}/${Date.now()}-${file.name}`
                const downloadUrl = await uploadFileWithProgress(file, path, (pct) => {
                    setUploadProgress(pct)
                })
                await onAdd(title.trim(), 'file', downloadUrl, path, file.size)
            }
            setIsAddOpen(false)
            setTitle('')
            setUrl('')
            setFile(null)
            setUploadProgress(null)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Erro ao adicionar material')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return
        await onDelete(confirmDeleteId)
        setConfirmDeleteId(null)
    }

    const formatSize = (bytes?: number) => {
        if (!bytes) return ''
        const kb = bytes / 1024
        if (kb < 1024) return kb.toFixed(1) + ' KB'
        return (kb / 1024).toFixed(1) + ' MB'
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">Materiais & Documentos</h2>
                    <p className="text-sm text-muted-foreground font-medium">Compartilhe links do Drive, GitHub ou suba PDFs importantes.</p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(true)}
                    className="gap-2 rounded-xl h-12 px-6 shadow-lg shadow-primary/10 transition-all active:scale-95"
                    aria-label="Adicionar novo material"
                >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Adicionar Material
                </Button>
            </div>

            {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-border/50 text-center">
                    <div className="w-16 h-16 bg-muted/40 rounded-3xl flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground opacity-30" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Nenhum material compartilhado</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8 font-medium italic opacity-70">
                        O time ainda não subiu nenhum arquivo ou link para este trabalho.
                    </p>
                    <Button variant="outline" onClick={() => setIsAddOpen(true)} className="rounded-xl">
                        Compartilhar primeiro material
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {materials.map((m) => (
                            <motion.div
                                key={m.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative"
                            >
                                <Card className="border border-border/50 hover:border-primary/40 hover:shadow-xl transition-all duration-300 rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-900/40">
                                    <div className={cn(
                                        'h-1 w-full bg-gradient-to-r',
                                        m.type === 'file' ? 'from-blue-500 to-indigo-600' : 'from-emerald-400 to-teal-600'
                                    )} />
                                    <CardHeader className="pb-3 p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className={cn(
                                                'p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500',
                                                m.type === 'file' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                                            )}>
                                                {m.type === 'file'
                                                    ? <FileText className="h-5 w-5" aria-hidden="true" />
                                                    : <LinkIcon className="h-5 w-5" aria-hidden="true" />
                                                }
                                            </div>
                                            <button
                                                onClick={() => setConfirmDeleteId(m.id!)}
                                                className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                aria-label={`Remover material: ${m.title}`}
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div className="pt-2">
                                            <CardTitle className="text-base font-bold line-clamp-1">{m.title}</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">
                                                {m.type === 'file' ? `Arquivo • ${formatSize(m.sizeBytes)}` : 'Link Externo'}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="px-6 pb-6 pt-0">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full gap-2 rounded-xl font-bold bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                            onClick={() => window.open(m.url, '_blank', 'noopener,noreferrer')}
                                            aria-label={m.type === 'file' ? `Baixar ${m.title}` : `Abrir link: ${m.title}`}
                                        >
                                            {m.type === 'file'
                                                ? <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                                : <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                            }
                                            {m.type === 'file' ? 'Baixar' : 'Abrir Link'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Dialog de confirmação de exclusão */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Remover material?</DialogTitle>
                        <DialogDescription className="font-medium">
                            Esta ação não pode ser desfeita. O arquivo ou link será permanentemente removido do grupo.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmDeleteId(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" className="rounded-xl" onClick={handleConfirmDelete}>
                            Remover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de adição */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { if (!isSubmitting) setIsAddOpen(open) }}>
                <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4 bg-muted/30">
                        <DialogTitle className="text-2xl font-black">Adicionar Material</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Compartilhe recursos com o resto do time.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        {/* Toggle arquivo / link */}
                        <div className="flex p-1.5 bg-muted rounded-[1.2rem] gap-1">
                            <button
                                onClick={() => setAddType('file')}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-[0.9rem] transition-all',
                                    addType === 'file' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/40'
                                )}
                                aria-pressed={addType === 'file'}
                            >
                                <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
                                Arquivo (Local)
                            </button>
                            <button
                                onClick={() => setAddType('link')}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-[0.9rem] transition-all',
                                    addType === 'link' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/40'
                                )}
                                aria-pressed={addType === 'link'}
                            >
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                Link (Externo)
                            </button>
                        </div>

                        <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="mat-title" className="font-bold opacity-60">Título do Material</Label>
                                <Input
                                    id="mat-title"
                                    placeholder="Ex: Roteiro do seminário"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-12 rounded-xl focus-visible:ring-primary/20"
                                    aria-required="true"
                                />
                            </div>

                            {addType === 'file' ? (
                                <div className="grid gap-2">
                                    <Label className="font-bold opacity-60">Upload do Arquivo</Label>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            onChange={(e) => handleFileChange(e.target.files?.[0])}
                                            className="hidden"
                                            id="file-up-input"
                                            accept={ALLOWED_FILE_ACCEPT}
                                            aria-label="Selecionar arquivo para upload"
                                        />
                                        <label
                                            htmlFor="file-up-input"
                                            className={cn(
                                                'flex flex-col items-center justify-center py-10 px-4 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer',
                                                file && 'border-primary/30 bg-primary/[0.01]'
                                            )}
                                        >
                                            <FileUp className={cn('h-8 w-8 mb-3 transition-colors', file ? 'text-primary' : 'text-muted-foreground/40')} aria-hidden="true" />
                                            <p className="text-xs font-bold text-center">
                                                {file ? file.name : 'Clique para selecionar ou arraste'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-60">
                                                Max 5MB • PDF, Office, Imagens, ZIP, Códigos (.py, .ipynb)
                                            </p>
                                        </label>
                                    </div>

                                    {/* Barra de progresso do upload */}
                                    {uploadProgress !== null && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                <span>Enviando arquivo...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-2" aria-label={`Upload ${uploadProgress}% concluído`} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <Label htmlFor="mat-url" className="font-bold opacity-60">URL do Material</Label>
                                    <Input
                                        id="mat-url"
                                        placeholder="drive.google.com/..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="h-12 rounded-xl focus-visible:ring-primary/20"
                                        aria-required="true"
                                        aria-describedby="mat-url-hint"
                                    />
                                    <p id="mat-url-hint" className="text-[10px] text-muted-foreground font-bold italic opacity-60 px-1">
                                        Lembre-se de liberar o acesso no link do Drive/Canva.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-2 bg-muted/10 border-t border-border/30">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddOpen(false)}
                            disabled={isSubmitting}
                            className="rounded-xl h-12 font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title || (addType === 'file' ? !file : !url)}
                            className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 grow"
                            aria-live="polite"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    <span>{addType === 'file' ? 'Enviando...' : 'Adicionando...'}</span>
                                </div>
                            ) : (
                                'Adicionar ao Grupo'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
