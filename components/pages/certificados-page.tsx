'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  GraduationCap,
  Clock,
  CheckCircle,
  Hourglass,
  Plus,
  Pencil,
  Download,
  Trash2,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  AlertTriangle,
  X,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/auth-provider'
import { collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { handleError, type AppError } from '@/lib/error-handler'
import { cn, sanitizeInput, sanitizeLongText } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { Certificado, TipoCertificado, StatusCertificado } from '@/types'

const TIPOS_CERTIFICADO: { value: TipoCertificado; label: string }[] = [
  { value: 'curso', label: 'Curso' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'palestra', label: 'Palestra' },
  { value: 'evento', label: 'Evento' },
  { value: 'congresso', label: 'Congresso' },
  { value: 'projeto', label: 'Projeto de Extensão' },
  { value: 'pesquisa', label: 'Projeto de Pesquisa' },
  { value: 'monitoria', label: 'Monitoria' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'outro', label: 'Outro' },
]

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutGrid,
  List,
  Search,
  MoreVertical,
  Calendar as CalendarIcon,
} from 'lucide-react'

// Helper para máscara de data (DD/MM/AAAA)
const maskDate = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a primeira barra
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a segunda barra
    .replace(/(\d{4})\d+?$/, '$1') // Limita a 4 dígitos no ano
}

// Helper para converter DD/MM/AAAA para YYYY-MM-DD
const dateToISO = (value: string) => {
  if (value.length !== 10) return ''
  const [day, month, year] = value.split('/')
  if (!day || !month || !year) return ''
  return `${year}-${month}-${day}`
}

// Helper para converter YYYY-MM-DD para DD/MM/AAAA (para visualização)
const formatDateToDisplay = (isoString?: string) => {
  if (!isoString) return ''
  // Se já estiver no formato visual (usuário digitando), retorna ele mesmo?
  // Não, aqui assumimos que o estado é sempre ISO ou temporário.
  // Se o isoString não tiver traço, assumimos que é o input parcial do usuário
  if (!isoString.includes('-') && isoString.length <= 10) return isoString

  const [year, month, day] = isoString.split('-')
  if (!year || !month || !day) return isoString // Retorna original se falhar
  return `${day}/${month}/${year}`
}

export function CertificadosPage() {
  const { user, loading: authLoading } = useAuth()
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<AppError | null>(null)

  // Novos estados para filtros e visualização
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('todos')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '' as TipoCertificado | '',
    instituicao: '',
    cargaHoraria: '',
    dataInicio: '',
    dataFim: '',
    descricao: '',
    linkExterno: '',
  })

  // Handler especial para mudança de datas com máscara
  const handleDateChange = (value: string, field: 'dataInicio' | 'dataFim') => {
    // 1. Aplica máscara visual
    const masked = maskDate(value)

    // 2. Se for uma data completa (10 chars), tenta converter para ISO para salvar
    // Se não for completa, salvamos o valor mascarado TEMPORARIAMENTE no estado
    // (Isso requer que o estado aceite strings não-ISO, o que já aceita por ser string)
    // O backend/Criação de Date object vai precisar validar isso antes do submit

    // NOTA: Para funcionar perfeito, o ideal é ter um estado separado "input value" vs "model value".
    // Mas para simplificar, vamos salvar o valor mascarado no estado. 
    // E no submit, validamos/convertemos se necessário?
    // O problema é que o type="date" hidden espera YYYY-MM-DD.
    // Vamos fazer assim: Se for data válida ISO completa, convertemos.
    // Se for parcial, deixamos parcial.

    // Verifica se completou DD/MM/AAAA
    if (masked.length === 10) {
      const iso = dateToISO(masked)
      // Verifica se é data válida (ex: dia 32, mês 13) - new Date valida básico
      const testDate = new Date(iso)
      if (!isNaN(testDate.getTime())) {
        // Data válida, salva como ISO (pois é o padrão nosso interno)
        // MAS espera... se salvarmos como ISO, o renderizador vai formatar de volta para PT-BR?
        // Sim, o formatDateToDisplay faz isso.
        setFormData(prev => ({ ...prev, [field]: iso }))
        return
      }
    }

    // Se não for completa ou válida ISO, salva o mascarado para o input refletir a digitação
    setFormData(prev => ({ ...prev, [field]: masked }))
  }

  // Filtragem de certificados
  // Filtragem de certificados
  const filteredCertificados = certificados.filter((c) => {
    const matchesSearch = c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instituicao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'todos' || c.tipo === filterType
    return matchesSearch && matchesType
  })

  // Carregar certificados
  const loadCertificados = async () => {
    if (!user || !db) return

    setIsLoading(true)
    try {
      const certificadosRef = collection(db, 'certificados')
      const q = query(certificadosRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)

      const certificadosData: Certificado[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        certificadosData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        } as Certificado)
      })

      // Ordenar por data de cadastro (mais recente primeiro)
      certificadosData.sort((a, b) => {
        const dateA = new Date(a.dataCadastro).getTime()
        const dateB = new Date(b.dataCadastro).getTime()
        return dateB - dateA
      })

      setCertificados(certificadosData)
    } catch (error: unknown) {
      logger.error('Erro ao carregar certificados:', error)
      const appError = handleError(error) // Updated error handling
      setError(appError)
      toast.error(appError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      loadCertificados()
    }
  }, [user, authLoading])

  // Calcular estatísticas
  const META_AC_BICTI = 240 // Meta de horas AC para BICTI

  const stats = {
    total: certificados.length,
    horasValidadas: certificados
      .filter((c) => c.status === 'aprovado')
      .reduce((sum, c) => sum + c.cargaHoraria, 0),
    atividadesAprovadas: certificados.filter((c) => c.status === 'aprovado').length,
    horasPendentes: certificados
      .filter((c) => c.status === 'pendente')
      .reduce((sum, c) => sum + c.cargaHoraria, 0),
  }

  const horasFaltantes = Math.max(0, META_AC_BICTI - stats.horasValidadas)

  // Salvar ou atualizar certificado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Garantir que as datas estejam em ISO antes de enviar
      // Se o usuário digitou e está "25/12/2024" (texto), precisamos converter.
      // Se já está "2024-12-25" (ISO), mantemos.
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
        tipo: (formData.tipo || 'outro') as TipoCertificado, // Default to 'outro'
        instituicao: formData.instituicao ? sanitizeInput(formData.instituicao) : '',
        cargaHoraria: parseInt(formData.cargaHoraria),
        dataInicio: dataInicioFinal,
        dataFim: dataFimFinal || '', // Optional
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
      const appError = handleError(error) // Updated error handling
      setError(appError)
      toast.error(appError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Excluir certificado
  const handleDelete = async () => {
    if (!user || !db || !deleteId) return

    try {
      // Excluir documento do Firestore
      await deleteDoc(doc(db, 'certificados', deleteId))

      toast.success('Certificado excluído com sucesso!')
      setShowDeleteModal(false)
      setDeleteId(null)
      await loadCertificados()
    } catch (error: unknown) {
      logger.error('Erro ao excluir certificado:', error)
      const appError = handleError(error) // Updated error handling
      setError(appError)
      toast.error(appError.message)
    }
  }

  // Resetar formulário
  const resetForm = () => {
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
  }

  // Editar certificado
  const handleEdit = (certificado: Certificado) => {
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
  }

  // Visualizar certificado
  const handleView = (certificado: Certificado) => {
    setSelectedCertificado(certificado)
    setShowViewModal(true)
  }

  // Abrir link do certificado
  const handleDownload = (certificado: Certificado) => {
    if (certificado.linkExterno) {
      window.open(certificado.linkExterno, '_blank')
    } else if (certificado.arquivoURL) {
      window.open(certificado.arquivoURL, '_blank')
    }
  }

  // Exportar certificados
  const handleExport = () => {
    const dataStr = JSON.stringify(certificados, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `certificados_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: StatusCertificado) => {
    switch (status) {
      case 'aprovado':
        return 'text-green-600 bg-green-500/10 border-green-500/20 dark:text-green-400 dark:bg-green-500/5'
      case 'reprovado':
        return 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400 dark:bg-red-500/5'
      case 'pendente':
        return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:text-yellow-400 dark:bg-yellow-500/5'
      default:
        return 'text-muted-foreground bg-muted border-transparent'
    }
  }

  const getStatusLabel = (status: StatusCertificado) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado'
      case 'reprovado':
        return 'Reprovado'
      case 'pendente':
        return 'Pendente'
      default:
        return status
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 flex items-center gap-3 tracking-tight">
            <GraduationCap className="h-8 w-8 text-primary" />
            Certificados
          </h1>
          <p className="text-sm font-medium text-muted-foreground max-w-2xl">
            Gerencie seus comprovantes e atividades complementares para validação de carga horária.
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mb-6"> {/* Changed className to mb-6 */}
            <AlertCircle className="h-4 w-4" /> {/* Changed icon to AlertCircle */}
            <div className="flex-1">
              <AlertTitle className="text-sm font-bold m-0">{error.title}</AlertTitle> {/* Display error title */}
              <AlertDescription className="text-sm">
                {error.message} {/* Display error message */}
                {error.action && <p className="mt-1 font-medium italic opacity-90">{error.action}</p>} {/* Display error action if present */}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, sub: 'Cadastrados', icon: FileText, iconColor: 'text-primary', bgColor: 'bg-primary/10' },
            { label: 'Validadas', value: `${stats.horasValidadas}h`, sub: 'Horas aprovadas', icon: CheckCircle, iconColor: 'text-green-600', bgColor: 'bg-green-500/10' },
            { label: 'Aprovadas', value: stats.atividadesAprovadas, sub: 'Atividades', icon: GraduationCap, iconColor: 'text-blue-600', bgColor: 'bg-blue-500/10' },
            { label: 'Faltam', value: `${horasFaltantes}h`, sub: 'Para meta de 240h', icon: Hourglass, iconColor: 'text-orange-600', bgColor: 'bg-orange-500/10' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl shrink-0", stat.bgColor)}>
                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 leading-none mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1">
                      {isLoading ? (
                        <Skeleton className="h-6 w-12" />
                      ) : (
                        <p className="text-xl font-black leading-none">{stat.value}</p>
                      )}
                      <span className="text-[10px] font-medium text-muted-foreground truncate">{stat.sub}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formulário */}
        {showForm && (
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
                    <select
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoCertificado })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione o tipo (Auto: Outro)</option>
                      {TIPOS_CERTIFICADO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
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
                        value={formData.dataInicio ? (
                          // Se for YYYY-MM-DD, converte para visualização DD/MM/YYYY
                          // Se o usuário está digitando, o estado já deve estar sendo controlado pelo onChange
                          // Nota: Precisamos de um estado local para o input de texto se quisermos permitir digitação livre antes da validação
                          // Mas para simplificar, vamos formatar na renderização se for data válida, ou mostrar o valor se for parcial
                          // Melhor abordagem: Usar funções auxiliares de máscara no onChange
                          formatDateToDisplay(formData.dataInicio)
                        ) : ''}
                        onChange={(e) => {
                          const masked = maskDate(e.target.value)
                          // Se tiver 10 chars (DD/MM/YYYY), tenta converter para YYYY-MM-DD
                          if (masked.length === 10) {
                            const iso = dateToISO(masked)
                            if (iso) {
                              setFormData({ ...formData, dataInicio: iso })
                            } else {
                              // Data inválida, mas mantém o texto para o usuário corrigir
                              // Aqui temos um problema: formData.dataInicio espera YYYY-MM-DD
                              // Precisamos de um estado separado para o "texto" ou permitir inválidos no formData temporariamente?
                              // O formData é usado no submit. Vamos atualizar o formData APENAS se válido,
                              // mas precisamos de um jeito de mostrar o texto enquanto digita.
                              // Solução rápida: O value do input deve ser controlado por uma função que aceita o que está no formData OU um estado temporário?
                              // Vamos simplificar: O formData guardará o valor REAL (YYYY-MM-DD).
                              // O input mostrará o valor formatado.
                              // Se o usuário digita, a gente altera o formData? Não, formato diferente.
                              // VAMOS USAR UM COMPONENTE DE ESTADO LOCAL PARA ISSO, OU MELHOR:
                              // Vamos assumir que handleDateChange gerencia isso.
                            }
                          }
                          // Esta abordagem inline é complexa. Vamos fazer direito:
                          // Precisaríamos separar o estado de "texto visual" do estado de "dados".
                          // Mas para não refatorar tudo agora, vou injetar a lógica de máscara num handler específico.
                          handleDateChange(e.target.value, 'dataInicio')
                        }}
                        required
                        className="pr-10" // Espaço para o ícone
                      />
                      <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => document.getElementById('picker-dataInicio')?.showPicker()}
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
                        onChange={(e) => handleDateChange(e.target.value, 'dataFim')}
                        className="pr-10"
                      />
                      <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => document.getElementById('picker-dataFim')?.showPicker()}
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descricao: e.target.value })}
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
                  <p className="text-xs text-muted-foreground">Opcional: Adicione um link para visualização do comprovante</p>
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
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Certificados */}
        <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle as="h2" className="flex items-center gap-2 text-xl font-bold">
                  <FileText className="h-5 w-5 text-primary" />
                  Meus Certificados
                </CardTitle>
                <CardDescription>
                  {certificados.length === 0
                    ? 'Comece adicionando seu primeiro certificado'
                    : `${certificados.length} certificado(s) cadastrado(s)`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-2">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setViewMode('grid')}
                    title="Visualização em Grade"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setViewMode('list')}
                    title="Visualização em Lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {certificados.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleExport} className="h-9 rounded-lg">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                )}
                <Button size="sm" onClick={() => setShowForm(!showForm)} className="h-9 rounded-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  {showForm ? 'Cancelar' : 'Adicionar'}
                </Button>
              </div>
            </div>

            {/* Barra de Filtros */}
            {certificados.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-border/50">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Buscar por título ou instituição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-10 w-full sm:w-[200px] rounded-xl border-none bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                  <option value="todos">Todas as categorias</option>
                  {TIPOS_CERTIFICADO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="rounded-xl border-border/50">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Skeleton className="h-8 flex-1 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCertificados.length === 0 ? (
              <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">
                  {searchTerm || filterType !== 'todos'
                    ? 'Nenhum certificado encontrado com esses filtros'
                    : 'Comece adicionando seu primeiro certificado ou atividade complementar'}
                </p>
                {(searchTerm || filterType !== 'todos') && (
                  <Button
                    variant="link"
                    onClick={() => { setSearchTerm(''); setFilterType('todos') }}
                    className="mt-2 text-primary"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCertificados.map((certificado) => (
                  <Card key={certificado.id} className="group relative rounded-xl border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card overflow-hidden">
                    {/* Badge de Status Discreto */}
                    <div className={cn(
                      "absolute top-3 right-3 h-2 w-2 rounded-full shadow-sm z-10",
                      certificado.status === 'aprovado' ? 'bg-green-500 shadow-green-500/50' :
                        certificado.status === 'pendente' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-red-500 shadow-red-500/50'
                    )} title={getStatusLabel(certificado.status)} />

                    <CardContent className="p-4 pt-5">
                      <div className="space-y-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1" title={certificado.titulo}>
                            {certificado.titulo}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-medium truncate">{certificado.instituicao}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Carga Horária</span>
                            <span className="text-xs font-black text-foreground">{certificado.cargaHoraria}h</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Categoria</span>
                            <span className="text-xs font-bold text-foreground truncate">
                              {TIPOS_CERTIFICADO.find((t) => t.value === certificado.tipo)?.label || certificado.tipo}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 flex-1 text-[11px] font-bold rounded-lg bg-primary/5 text-primary hover:bg-primary/10"
                            onClick={() => handleView(certificado)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Detalhes
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                              <DropdownMenuItem onClick={() => handleEdit(certificado)} className="gap-2 cursor-pointer">
                                <Pencil className="h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              {(certificado.linkExterno || certificado.arquivoURL) && (
                                <DropdownMenuItem onClick={() => handleDownload(certificado)} className="gap-2 cursor-pointer">
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteId(certificado.id || null)
                                  setShowDeleteModal(true)
                                }}
                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Visualização em Lista (Tabela Compacta) */
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50 text-left">
                      <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Título</th>
                      <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Instituição</th>
                      <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-center">CH</th>
                      <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</th>
                      <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificados.map((certificado) => (
                      <tr key={certificado.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                        <td className="p-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            certificado.status === 'aprovado' ? 'bg-green-500' :
                              certificado.status === 'pendente' ? 'bg-yellow-500' : 'bg-red-500'
                          )} title={getStatusLabel(certificado.status)} />
                        </td>
                        <td className="p-3 font-semibold text-xs max-w-[200px] truncate">{certificado.titulo}</td>
                        <td className="p-3 text-xs text-muted-foreground truncate max-w-[150px]">{certificado.instituicao}</td>
                        <td className="p-3 text-xs font-black text-center">{certificado.cargaHoraria}h</td>
                        <td className="p-3 text-xs">
                          <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground uppercase">
                            {TIPOS_CERTIFICADO.find((t) => t.value === certificado.tipo)?.label || certificado.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleView(certificado)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => handleEdit(certificado)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setDeleteId(certificado.id || null)
                                setShowDeleteModal(true)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Modal de Visualização */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visualizar Certificado
            </DialogTitle>
          </DialogHeader>
          {selectedCertificado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Título</Label>
                  <p className="font-medium">{selectedCertificado.titulo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">
                    {TIPOS_CERTIFICADO.find((t) => t.value === selectedCertificado.tipo)?.label ||
                      selectedCertificado.tipo}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Instituição</Label>
                  <p className="font-medium">{selectedCertificado.instituicao}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Carga Horária</Label>
                  <p className="font-medium">{selectedCertificado.cargaHoraria}h</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Início</Label>
                  <p className="font-medium">
                    {new Date(selectedCertificado.dataInicio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Conclusão</Label>
                  <p className="font-medium">
                    {new Date(selectedCertificado.dataFim).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                        selectedCertificado.status
                      )}`}
                    >
                      {getStatusLabel(selectedCertificado.status)}
                    </span>
                  </p>
                </div>
              </div>
              {selectedCertificado.descricao && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedCertificado.descricao}</p>
                </div>
              )}
              {selectedCertificado.linkExterno && (
                <div className="pt-2">
                  <Label className="text-muted-foreground">Link do Comprovante</Label>
                  <p className="text-sm break-all">
                    <a
                      href={selectedCertificado.linkExterno}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedCertificado.linkExterno}
                    </a>
                  </p>
                </div>
              )}
              {selectedCertificado.arquivoURL && (
                <div className="pt-4 border-t">
                  <iframe
                    src={selectedCertificado.arquivoURL}
                    className="w-full h-96 border rounded"
                    title="Visualização do certificado"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Fechar
            </Button>
            {selectedCertificado && (selectedCertificado.linkExterno || selectedCertificado.arquivoURL) && (
              <Button onClick={() => handleDownload(selectedCertificado)}>
                <Download className="mr-2 h-4 w-4" />
                Abrir Comprovante
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este certificado?
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
