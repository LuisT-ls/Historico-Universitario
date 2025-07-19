import authService from './firebase/auth.js'
import dataService from './firebase/data.js'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js'

class CertificadosManager {
  constructor() {
    this.currentUser = null
    this.userData = null
    this.certificados = []
    this.storage = getStorage()
    this.init()
  }

  async init() {
    // Verificar autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.currentUser = user
        this.userData = userData
        this.carregarCertificados()
        this.setupEventListeners()
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      this.currentUser = currentUser
      this.userData = authService.getUserData()
      if (this.userData) {
        this.carregarCertificados()
        this.setupEventListeners()
      }
    }
  }

  setupEventListeners() {
    // Formulário de certificado
    const form = document.getElementById('certificadoForm')
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        this.salvarCertificado()
      })
    }

    // Botão limpar formulário
    const limparBtn = document.getElementById('limparForm')
    if (limparBtn) {
      limparBtn.addEventListener('click', () => {
        this.limparFormulario()
      })
    }

    // Botão adicionar certificado
    const adicionarBtn = document.getElementById('adicionarCertificado')
    if (adicionarBtn) {
      adicionarBtn.addEventListener('click', () => {
        this.mostrarFormulario()
      })
    }

    // Botão exportar certificados
    const exportarBtn = document.getElementById('exportarCertificados')
    if (exportarBtn) {
      exportarBtn.addEventListener('click', () => {
        this.exportarCertificados()
      })
    }

    // Modal de visualização
    this.setupModalListeners()
  }

  setupModalListeners() {
    const modal = document.getElementById('certificadoModal')
    const closeBtn = document.getElementById('closeCertificadoModal')
    const closeModalBtn = document.getElementById('closeModal')

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.fecharModal()
      })
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.fecharModal()
      })
    }

    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          this.fecharModal()
        }
      })
    }

    // Modal de exclusão
    const deleteModal = document.getElementById('deleteModal')
    const cancelDelete = document.getElementById('cancelDelete')
    const confirmDelete = document.getElementById('confirmDelete')

    if (cancelDelete) {
      cancelDelete.addEventListener('click', () => {
        this.fecharModalExclusao()
      })
    }

    if (confirmDelete) {
      confirmDelete.addEventListener('click', () => {
        this.confirmarExclusao()
      })
    }

    if (deleteModal) {
      deleteModal.addEventListener('click', e => {
        if (e.target === deleteModal) {
          this.fecharModalExclusao()
        }
      })
    }
  }

  async carregarCertificados() {
    try {
      const result = await dataService.getUserCertificados()
      if (result.success) {
        this.certificados = result.data || []
        this.atualizarInterface()
        this.atualizarEstatisticas()
      } else {
        console.error('Erro ao carregar certificados:', result.error)
        this.showNotification('Erro ao carregar certificados', 'error')
      }
    } catch (error) {
      console.error('Erro ao carregar certificados:', error)
      this.showNotification('Erro ao carregar certificados', 'error')
    }
  }

  async salvarCertificado() {
    try {
      const form = document.getElementById('certificadoForm')
      const formData = new FormData(form)

      // Validar arquivo PDF
      const arquivo = formData.get('certificadoFile')
      if (!arquivo || arquivo.type !== 'application/pdf') {
        this.showNotification(
          'Por favor, selecione um arquivo PDF válido',
          'error'
        )
        return
      }

      // Validar tamanho do arquivo (máximo 10MB)
      if (arquivo.size > 10 * 1024 * 1024) {
        this.showNotification('O arquivo deve ter no máximo 10MB', 'error')
        return
      }

      // Mostrar loading
      this.showNotification('Salvando certificado...', 'info')

      // Upload do arquivo para Firebase Storage
      const arquivoURL = await this.uploadArquivo(arquivo)

      // Preparar dados do certificado
      const certificado = {
        titulo: formData.get('titulo'),
        tipo: formData.get('tipo'),
        instituicao: formData.get('instituicao'),
        cargaHoraria: parseInt(formData.get('cargaHoraria')),
        dataInicio: formData.get('dataInicio'),
        dataFim: formData.get('dataFim'),
        descricao: formData.get('descricao'),
        arquivoURL: arquivoURL,
        nomeArquivo: arquivo.name,
        status: 'pendente', // pendente, aprovado, reprovado
        dataCadastro: new Date().toISOString(),
        userId: this.currentUser.uid
      }

      // Salvar no Firebase
      const result = await dataService.salvarCertificado(certificado)
      if (result.success) {
        this.showNotification('Certificado salvo com sucesso!', 'success')
        this.limparFormulario()
        await this.carregarCertificados()
      } else {
        this.showNotification(
          'Erro ao salvar certificado: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      console.error('Erro ao salvar certificado:', error)
      this.showNotification(
        'Erro ao salvar certificado: ' + error.message,
        'error'
      )
    }
  }

  async uploadArquivo(arquivo) {
    try {
      const timestamp = Date.now()
      const nomeArquivo = `${this.currentUser.uid}_${timestamp}_${arquivo.name}`
      const storageRef = ref(this.storage, `certificados/${nomeArquivo}`)

      const snapshot = await uploadBytes(storageRef, arquivo)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return downloadURL
    } catch (error) {
      console.error('Erro no upload:', error)
      throw new Error('Erro ao fazer upload do arquivo')
    }
  }

  limparFormulario() {
    const form = document.getElementById('certificadoForm')
    if (form) {
      form.reset()
      // Definir data atual como padrão
      const hoje = new Date().toISOString().split('T')[0]
      document.getElementById('dataInicio').value = hoje
      document.getElementById('dataFim').value = hoje
    }
  }

  mostrarFormulario() {
    const formSection = document.querySelector('.form-section')
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  atualizarInterface() {
    const grid = document.getElementById('certificadosGrid')
    const emptyState = document.getElementById('emptyState')

    if (!grid) return

    if (this.certificados.length === 0) {
      grid.innerHTML = ''
      if (emptyState) {
        emptyState.style.display = 'block'
      }
      return
    }

    if (emptyState) {
      emptyState.style.display = 'none'
    }

    grid.innerHTML = this.certificados
      .map(
        (certificado, index) => `
      <div class="certificado-card" data-id="${certificado.id || index}">
        <div class="certificado-header">
          <h3 class="certificado-titulo">${certificado.titulo}</h3>
          <span class="certificado-status ${
            certificado.status
          }">${this.getStatusLabel(certificado.status)}</span>
        </div>
        
        <div class="certificado-info">
          <div class="info-item">
            <i class="fas fa-university"></i>
            <span>${certificado.instituicao}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>${certificado.cargaHoraria}h</span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar"></i>
            <span>${this.formatarData(
              certificado.dataInicio
            )} - ${this.formatarData(certificado.dataFim)}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-tag"></i>
            <span>${this.getTipoLabel(certificado.tipo)}</span>
          </div>
        </div>
        
        ${
          certificado.descricao
            ? `<div class="certificado-descricao">${certificado.descricao}</div>`
            : ''
        }
        
        <div class="certificado-actions">
          <button class="btn btn-secondary btn-sm" onclick="certificadosManager.visualizarCertificado(${index})">
            <i class="fas fa-eye"></i>
            Visualizar
          </button>
          <button class="btn btn-primary btn-sm" onclick="certificadosManager.downloadCertificado(${index})">
            <i class="fas fa-download"></i>
            Download
          </button>
          <button class="btn btn-danger btn-sm" onclick="certificadosManager.excluirCertificado(${index})">
            <i class="fas fa-trash"></i>
            Excluir
          </button>
        </div>
      </div>
    `
      )
      .join('')
  }

  atualizarEstatisticas() {
    const total = this.certificados.length
    const aprovados = this.certificados.filter(
      c => c.status === 'aprovado'
    ).length
    const horasValidadas = this.certificados
      .filter(c => c.status === 'aprovado')
      .reduce((sum, c) => sum + c.cargaHoraria, 0)
    const horasPendentes = this.certificados
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.cargaHoraria, 0)

    // Atualizar elementos da interface
    const elementos = {
      totalCertificados: total,
      atividadesAprovadas: aprovados,
      horasValidadas: horasValidadas,
      horasPendentes: horasPendentes
    }

    Object.entries(elementos).forEach(([id, valor]) => {
      const elemento = document.getElementById(id)
      if (elemento) {
        elemento.textContent = valor
      }
    })
  }

  getStatusLabel(status) {
    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado'
    }
    return labels[status] || status
  }

  getTipoLabel(tipo) {
    const labels = {
      curso: 'Curso',
      workshop: 'Workshop',
      palestra: 'Palestra',
      evento: 'Evento',
      projeto: 'Projeto de Extensão',
      pesquisa: 'Projeto de Pesquisa',
      monitoria: 'Monitoria',
      estagio: 'Estágio',
      outro: 'Outro'
    }
    return labels[tipo] || tipo
  }

  formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

  async visualizarCertificado(index) {
    const certificado = this.certificados[index]
    if (!certificado) return

    const modal = document.getElementById('certificadoModal')
    const preview = document.getElementById('certificadoPreview')

    if (modal && preview) {
      preview.innerHTML = `
        <div class="certificado-preview">
          <div class="preview-header">
            <h3 class="preview-titulo">${certificado.titulo}</h3>
            <span class="preview-status ${
              certificado.status
            }">${this.getStatusLabel(certificado.status)}</span>
          </div>
          
          <div class="preview-info">
            <div class="preview-item">
              <div class="preview-label">Instituição</div>
              <div class="preview-value">${certificado.instituicao}</div>
            </div>
            <div class="preview-item">
              <div class="preview-label">Carga Horária</div>
              <div class="preview-value">${certificado.cargaHoraria}h</div>
            </div>
            <div class="preview-item">
              <div class="preview-label">Período</div>
              <div class="preview-value">${this.formatarData(
                certificado.dataInicio
              )} - ${this.formatarData(certificado.dataFim)}</div>
            </div>
            <div class="preview-item">
              <div class="preview-label">Tipo</div>
              <div class="preview-value">${this.getTipoLabel(
                certificado.tipo
              )}</div>
            </div>
          </div>
          
          ${
            certificado.descricao
              ? `<div class="preview-descricao">${certificado.descricao}</div>`
              : ''
          }
        </div>
      `

      modal.classList.add('active')
    }
  }

  async downloadCertificado(index) {
    const certificado = this.certificados[index]
    if (!certificado || !certificado.arquivoURL) {
      this.showNotification('Arquivo não encontrado', 'error')
      return
    }

    try {
      this.showNotification('Iniciando download...', 'info')

      const response = await fetch(certificado.arquivoURL)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = certificado.nomeArquivo || 'certificado.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      this.showNotification('Download iniciado', 'success')
    } catch (error) {
      console.error('Erro no download:', error)
      this.showNotification('Erro ao fazer download', 'error')
    }
  }

  async excluirCertificado(index) {
    const certificado = this.certificados[index]
    if (!certificado) return

    // Mostrar modal de confirmação
    const modal = document.getElementById('deleteModal')
    if (modal) {
      modal.classList.add('active')
      // Armazenar índice para confirmação
      modal.dataset.certificadoIndex = index
    }
  }

  async confirmarExclusao() {
    const modal = document.getElementById('deleteModal')
    const index = parseInt(modal.dataset.certificadoIndex)
    const certificado = this.certificados[index]

    if (!certificado) {
      this.fecharModalExclusao()
      return
    }

    try {
      this.showNotification('Excluindo certificado...', 'info')

      // Excluir arquivo do Storage
      if (certificado.arquivoURL) {
        try {
          const storageRef = ref(this.storage, certificado.arquivoURL)
          await deleteObject(storageRef)
        } catch (error) {
          console.warn('Erro ao excluir arquivo do Storage:', error)
        }
      }

      // Excluir do Firebase
      const result = await dataService.excluirCertificado(certificado.id)
      if (result.success) {
        this.showNotification('Certificado excluído com sucesso!', 'success')
        await this.carregarCertificados()
      } else {
        this.showNotification(
          'Erro ao excluir certificado: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      console.error('Erro ao excluir certificado:', error)
      this.showNotification(
        'Erro ao excluir certificado: ' + error.message,
        'error'
      )
    }

    this.fecharModalExclusao()
  }

  fecharModal() {
    const modal = document.getElementById('certificadoModal')
    if (modal) {
      modal.classList.remove('active')
    }
  }

  fecharModalExclusao() {
    const modal = document.getElementById('deleteModal')
    if (modal) {
      modal.classList.remove('active')
      delete modal.dataset.certificadoIndex
    }
  }

  async exportarCertificados() {
    try {
      this.showNotification('Preparando exportação...', 'info')

      const dados = {
        certificados: this.certificados,
        estatisticas: {
          total: this.certificados.length,
          aprovados: this.certificados.filter(c => c.status === 'aprovado')
            .length,
          horasValidadas: this.certificados
            .filter(c => c.status === 'aprovado')
            .reduce((sum, c) => sum + c.cargaHoraria, 0)
        },
        dataExportacao: new Date().toISOString(),
        usuario: this.userData?.name || 'Usuário'
      }

      // Criar arquivo JSON
      const blob = new Blob([JSON.stringify(dados, null, 2)], {
        type: 'application/json'
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificados_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      this.showNotification('Exportação concluída!', 'success')
    } catch (error) {
      console.error('Erro na exportação:', error)
      this.showNotification('Erro ao exportar certificados', 'error')
    }
  }

  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type)
    } else {
      console.log(`${type.toUpperCase()}: ${message}`)
    }
  }
}

// Instância global
const certificadosManager = new CertificadosManager()

// Expor para uso global
window.certificadosManager = certificadosManager

export default certificadosManager
