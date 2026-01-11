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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  GraduationCap,
  Clock,
  CheckCircle,
  Hourglass,
  Plus,
  Download,
  Trash2,
  Eye,
  FileText,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { getFirebaseErrorMessage } from '@/lib/error-handler'
import { sanitizeInput, sanitizeLongText } from '@/lib/utils'
import { toast } from '@/lib/toast'
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

export function CertificadosPage() {
  const { user, loading: authLoading } = useAuth()
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      console.error('Erro ao carregar certificados:', error)
      setError(getFirebaseErrorMessage(error))
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

  // Salvar certificado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Criar certificado com dados sanitizados
      const certificado: Omit<Certificado, 'id'> = {
        userId: user.uid,
        titulo: sanitizeInput(formData.titulo),
        tipo: formData.tipo as TipoCertificado,
        instituicao: sanitizeInput(formData.instituicao),
        cargaHoraria: parseInt(formData.cargaHoraria),
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        descricao: formData.descricao ? sanitizeLongText(formData.descricao) : undefined,
        linkExterno: formData.linkExterno ? sanitizeInput(formData.linkExterno) : undefined,
        status: 'aprovado',
        dataCadastro: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, 'certificados'), certificado)

      toast.success('Certificado salvo com sucesso!', {
        description: certificado.titulo,
        duration: 3000,
      })
      
      setShowForm(false)
      resetForm()
      await loadCertificados()
    } catch (error: unknown) {
      console.error('Erro ao salvar certificado:', error)
      setError(getFirebaseErrorMessage(error))
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
      console.error('Erro ao excluir certificado:', error)
      setError(getFirebaseErrorMessage(error))
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
        return 'text-green-600 bg-green-50 border-green-200'
      case 'reprovado':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'pendente':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
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

  if (authLoading || isLoading) {
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Certificados e Atividades Complementares
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus certificados, comprovantes de extensão e outras atividades complementares
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Certificados</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Certificados cadastrados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Validadas</p>
                  <p className="text-2xl font-bold">{stats.horasValidadas}</p>
                  <p className="text-xs text-muted-foreground">Horas aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atividades Aprovadas</p>
                  <p className="text-2xl font-bold">{stats.atividadesAprovadas}</p>
                  <p className="text-xs text-muted-foreground">Certificados aprovados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Hourglass className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Pendentes</p>
                  <p className="text-2xl font-bold">{stats.horasPendentes}</p>
                  <p className="text-xs text-muted-foreground">Aguardando validação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Certificado
              </CardTitle>
              <CardDescription>Cadastre um novo certificado ou atividade complementar</CardDescription>
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
                    <Label htmlFor="tipo">Tipo de Atividade</Label>
                    <select
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoCertificado })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Selecione o tipo</option>
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
                    <Label htmlFor="instituicao">Instituição</Label>
                    <Input
                      id="instituicao"
                      value={formData.instituicao}
                      onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                      placeholder="Ex: Universidade Federal da Bahia"
                      required
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
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Conclusão</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      required
                    />
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
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Salvar Certificado
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle as="h2" className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Meus Certificados
                </CardTitle>
                <CardDescription>
                  {certificados.length === 0
                    ? 'Comece adicionando seu primeiro certificado'
                    : `${certificados.length} certificado(s) cadastrado(s)`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {certificados.length > 0 && (
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                )}
                <Button onClick={() => setShowForm(!showForm)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {showForm ? 'Cancelar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {certificados.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Comece adicionando seu primeiro certificado ou atividade complementar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificados.map((certificado) => (
                  <Card key={certificado.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{certificado.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{certificado.instituicao}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                              certificado.status
                            )}`}
                          >
                            {getStatusLabel(certificado.status)}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <strong>Tipo:</strong>{' '}
                            {TIPOS_CERTIFICADO.find((t) => t.value === certificado.tipo)?.label || certificado.tipo}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Carga Horária:</strong> {certificado.cargaHoraria}h
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Período:</strong>{' '}
                            {new Date(certificado.dataInicio).toLocaleDateString('pt-BR')} -{' '}
                            {new Date(certificado.dataFim).toLocaleDateString('pt-BR')}
                          </p>
                          {certificado.descricao && (
                            <p className="text-muted-foreground line-clamp-2">{certificado.descricao}</p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleView(certificado)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          {certificado.linkExterno && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(certificado)}
                              title="Abrir Link"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteId(certificado.id || null)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
