// js/modules/ui/formHandler.js
import { salvarDisciplinas } from '../storage.js'

export function setupFormHandlers(disciplinas, callbacks) {
  const form = document.getElementById('disciplinaForm')
  const trancamentoCheckbox = document.getElementById('trancamento')
  const dispensadaCheckbox = document.getElementById('dispensada')
  const camposSemTrancamento = document.querySelector('.campos-sem-trancamento')
  const chInput = document.getElementById('ch')
  const notaInput = document.getElementById('nota')
  const codigoInput = document.getElementById('codigo')
  const naturezaSelect = document.getElementById('natureza')
  const periodoInput = document.getElementById('periodo')
  const notaContainer = notaInput.parentElement
  const emCursoCheckbox = document.getElementById('emcurso')

  // Create popup element
  const popup = document.createElement('div')
  popup.className = 'notification-popup'
  document.body.appendChild(popup)

  function showNotification(message, type = 'info') {
    window.showNotification(message, type)
  }

  // Função para obter o semestre mais recente das disciplinas
  function getSemestreMaisRecente() {
    if (disciplinas.length === 0) {
      return ''
    }

    const periodos = disciplinas.map(d => d.periodo).filter(p => p)
    if (periodos.length === 0) {
      return ''
    }

    // Ordenar períodos e retornar o mais recente
    const periodosOrdenados = periodos.sort((a, b) => {
      const [anoA, semA] = a.split('.').map(Number)
      const [anoB, semB] = b.split('.').map(Number)

      if (anoA !== anoB) return anoB - anoA
      return semB - semA
    })

    return periodosOrdenados[0]
  }

  // Função para precarregar o semestre
  function precarregarSemestre() {
    // Primeiro tenta carregar do localStorage
    const semestreSalvo = localStorage.getItem('ultimoSemestreDigitado')
    console.log('Tentando precarregar semestre do localStorage:', semestreSalvo)

    if (semestreSalvo && !periodoInput.value) {
      periodoInput.value = semestreSalvo
      console.log('Semestre precarregado do localStorage:', semestreSalvo)
    } else if (!periodoInput.value) {
      // Se não há semestre salvo, tenta pegar o mais recente das disciplinas
      const semestreMaisRecente = getSemestreMaisRecente()
      if (semestreMaisRecente) {
        periodoInput.value = semestreMaisRecente
        console.log(
          'Semestre precarregado das disciplinas:',
          semestreMaisRecente
        )
      } else {
        console.log('Nenhum semestre encontrado para precarregar')
      }
    } else {
      console.log('Campo de período já tem valor:', periodoInput.value)
    }
  }

  // Função para atualizar a visibilidade do campo de nota
  function updateNotaVisibility() {
    const isDispensada = dispensadaCheckbox.checked
    const isTrancamento = trancamentoCheckbox.checked
    const isEmCurso = emCursoCheckbox.checked

    if (isDispensada || isTrancamento || isEmCurso) {
      notaContainer.style.display = 'none'
      notaInput.value = ''
    } else {
      notaContainer.style.display = 'block'
    }
  }

  // Função para atualizar o campo de código com base na natureza
  function updateCodigoField() {
    const isAC = naturezaSelect.value === 'AC'

    if (isAC) {
      codigoInput.placeholder = 'Ex: CTIA01 ou AC'
      codigoInput.value = ''
      codigoInput.removeAttribute('required') // Remove a obrigatoriedade
    } else {
      codigoInput.placeholder = 'Ex: CTIA01 ou AC'
      codigoInput.setAttribute('required', '') // Adiciona a obrigatoriedade
    }
  }

  // Função melhorada para atualizar campos obrigatórios
  function updateRequiredFields() {
    const isAC = naturezaSelect.value === 'AC'
    const isTrancamento = trancamentoCheckbox.checked
    const isDispensada = dispensadaCheckbox.checked
    const isEmCurso = emCursoCheckbox.checked

    // Código: obrigatório para qualquer natureza exceto AC
    if (isAC) {
      codigoInput.removeAttribute('required')
    } else {
      codigoInput.setAttribute('required', '')
    }

    // Nota: obrigatória para qualquer natureza exceto AC, trancamento, dispensada ou em curso
    // AC (Atividades Complementares) não precisa de nota pois são certificados/atividades complementares
    if (isAC || isTrancamento || isDispensada || isEmCurso) {
      notaInput.removeAttribute('required')
    } else {
      notaInput.setAttribute('required', '')
    }

    // CH: obrigatória exceto para trancamento
    if (isTrancamento) {
      chInput.removeAttribute('required')
    } else {
      chInput.setAttribute('required', '')
    }

    updateNotaVisibility()

    // Log para debug
    console.log('Campos atualizados:')
    console.log('- Natureza:', naturezaSelect.value)
    console.log('- Código obrigatório:', codigoInput.hasAttribute('required'))
    console.log('- Nota obrigatória:', notaInput.hasAttribute('required'))
    console.log('- CH obrigatória:', chInput.hasAttribute('required'))
  }

  // Função para reset inteligente do formulário
  function resetFormInteligente() {
    const periodoAtual = periodoInput.value
    const naturezaAtual = naturezaSelect.value

    console.log('Reset inteligente - Período atual:', periodoAtual)
    console.log('Reset inteligente - Natureza atual:', naturezaAtual)

    // Reset do formulário
    form.reset()

    // Restaurar valores importantes
    periodoInput.value = periodoAtual
    naturezaSelect.value = naturezaAtual

    // Restaurar visibilidade dos campos
    camposSemTrancamento.style.display = 'flex'
    notaContainer.style.display = 'block'
    trancamentoCheckbox.checked = false
    dispensadaCheckbox.checked = false
    emCursoCheckbox.checked = false

    // Reabilitar campos
    naturezaSelect.disabled = false
    codigoInput.disabled = false

    // Atualizar campos obrigatórios
    updateRequiredFields()
    updateCodigoField()

    // Salvar o semestre no localStorage para persistir
    if (periodoAtual) {
      localStorage.setItem('ultimoSemestreDigitado', periodoAtual)
      console.log('Semestre salvo no localStorage:', periodoAtual)
    }

    console.log('Formulário resetado mantendo período e natureza')
    console.log('Período após reset:', periodoInput.value)
    console.log('Natureza após reset:', naturezaSelect.value)
  }

  // Listener para mudança de natureza
  naturezaSelect.addEventListener('change', e => {
    updateCodigoField() // Atualiza o campo de código com base na natureza
    updateRequiredFields() // Atualiza campos obrigatórios

    // Garantir que a nota seja visível ao mudar para naturezas não-AC
    if (
      e.target.value !== 'AC' &&
      !dispensadaCheckbox.checked &&
      !trancamentoCheckbox.checked &&
      !emCursoCheckbox.checked
    ) {
      notaContainer.style.display = 'block'
    }
  })

  trancamentoCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
      camposSemTrancamento.style.display = 'none'
      dispensadaCheckbox.checked = false
      emCursoCheckbox.checked = false
    } else {
      camposSemTrancamento.style.display = 'flex'
    }
    updateRequiredFields()
  })

  dispensadaCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
      notaInput.value = ''
      notaContainer.style.display = 'none'
      trancamentoCheckbox.checked = false
      emCursoCheckbox.checked = false
    } else {
      // Mostrar nota apenas se não for AC
      if (naturezaSelect.value !== 'AC') {
        notaContainer.style.display = 'block'
      }
    }
    updateRequiredFields()
  })

  emCursoCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
      notaInput.value = ''
      notaContainer.style.display = 'none'
      trancamentoCheckbox.checked = false
      dispensadaCheckbox.checked = false
    } else {
      // Mostrar nota apenas se não for AC
      if (naturezaSelect.value !== 'AC') {
        notaContainer.style.display = 'block'
      }
    }
    updateRequiredFields()
  })

  form.addEventListener('submit', async function (e) {
    e.preventDefault()

    // Forçar uma última verificação dos campos obrigatórios
    updateRequiredFields()

    // Verificar a validade do formulário antes de processá-lo
    if (!this.checkValidity()) {
      this.reportValidity()
      return
    }

    const isAC = naturezaSelect.value === 'AC'
    const codigo = isAC ? 'AC' : document.getElementById('codigo').value

    // Se estiver em modo de edição, atualizar a disciplina existente
    const appInstance = window.app && window.app.__appInstance
    if (appInstance && typeof appInstance.indiceEdicao === 'number') {
      const index = appInstance.indiceEdicao
      if (index >= 0 && index < disciplinas.length) {
        // Atualizar os dados da disciplina
        const disciplinaEditada = disciplinas[index]

        // Verificar se a disciplina tem ID para sincronização
        if (!disciplinaEditada.id) {
          console.warn(
            'Disciplina não tem ID, não será sincronizada com Firebase'
          )
          showNotification(
            'Disciplina não pode ser sincronizada (sem ID)',
            'warning'
          )
        }

        // Atualizar campos
        disciplinaEditada.periodo = document.getElementById('periodo').value
        disciplinaEditada.codigo = codigo
        disciplinaEditada.nome = document.getElementById('nome').value
        disciplinaEditada.natureza = document.getElementById('natureza').value
        disciplinaEditada.trancamento =
          document.getElementById('trancamento').checked
        disciplinaEditada.dispensada =
          document.getElementById('dispensada').checked
        const notaValor = document.getElementById('nota').value
        if (disciplinaEditada.trancamento) {
          disciplinaEditada.ch = 0
          disciplinaEditada.nota = 0
          disciplinaEditada.resultado = 'TR'
          disciplinaEditada.emcurso = false
        } else if (disciplinaEditada.dispensada) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = 0
          disciplinaEditada.resultado = 'AP'
          disciplinaEditada.emcurso = false
        } else if (notaValor !== '' && !isNaN(parseFloat(notaValor))) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = parseFloat(notaValor)
          disciplinaEditada.resultado =
            disciplinaEditada.nota >= 5 ? 'AP' : 'RR'
          disciplinaEditada.emcurso = false
        } else if (document.getElementById('emcurso').checked) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = null
          disciplinaEditada.resultado = 'EC'
          disciplinaEditada.emcurso = true
        } else if (isAC) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = null
          disciplinaEditada.resultado = 'AP'
          disciplinaEditada.emcurso = false
        } else {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = null
          disciplinaEditada.resultado = undefined
          disciplinaEditada.emcurso = false
        }
        disciplinaEditada.curso = appInstance.cursoAtual || 'BICTI'
        // Atualizar no Firebase se logado e tiver id
        if (
          window.dataService &&
          window.dataService.currentUser &&
          disciplinaEditada.id &&
          typeof window.dataService.updateDiscipline === 'function'
        ) {
          try {
            const updateResult = await window.dataService.updateDiscipline(
              disciplinaEditada.id,
              disciplinaEditada
            )
            if (updateResult.success) {
              showNotification('Disciplina atualizada no servidor!', 'success')
            } else {
              showNotification(
                'Erro ao atualizar disciplina no servidor: ' +
                  updateResult.error,
                'error'
              )
            }
          } catch (err) {
            showNotification(
              'Erro ao atualizar disciplina no servidor: ' +
                (err?.message || err),
              'error'
            )
          }
        }
        // Atualizar localStorage e interface
        if (typeof salvarDisciplinas === 'function') {
          salvarDisciplinas(disciplinas, disciplinaEditada.curso)
        }
        if (appInstance && typeof appInstance.atualizarTudo === 'function') {
          appInstance.atualizarTudo()
        }
        appInstance.indiceEdicao = undefined
        const btn = document.querySelector(
          '#disciplinaForm button[type="submit"]'
        )
        if (btn)
          btn.innerHTML =
            '<i class="fas fa-plus-circle"></i> Adicionar Disciplina'
        resetFormInteligente()
        return
      }
    }

    if (!isAC) {
      // Só bloqueia se já houver disciplina aprovada
      const disciplinaAprovada = disciplinas.find(
        d => d.codigo === codigo && d.resultado === 'AP'
      )

      if (disciplinaAprovada) {
        showNotification(`A disciplina ${codigo} já foi cursada e aprovada!`)
        return
      }
    }

    const disciplina = {
      periodo: document.getElementById('periodo').value,
      codigo: codigo,
      nome: document.getElementById('nome').value,
      natureza: document.getElementById('natureza').value,
      trancamento: document.getElementById('trancamento').checked,
      dispensada: document.getElementById('dispensada').checked,
      emcurso: document.getElementById('emcurso').checked
    }

    if (disciplina.trancamento) {
      disciplina.ch = 0
      disciplina.nota = 0
      disciplina.resultado = 'TR'
    } else if (disciplina.dispensada) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = 0
      disciplina.resultado = 'AP'
    } else if (
      document.getElementById('nota').value !== '' &&
      !isNaN(parseFloat(document.getElementById('nota').value))
    ) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = parseFloat(document.getElementById('nota').value)
      disciplina.resultado = disciplina.nota >= 5 ? 'AP' : 'RR'
    } else if (disciplina.emcurso) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = null
      disciplina.resultado = 'EC'
    } else if (isAC) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = null
      disciplina.resultado = 'AP'
    } else {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = null
      disciplina.resultado = undefined
    }

    // Garantir que o curso seja incluído
    if (appInstance && appInstance.cursoAtual) {
      disciplina.curso = appInstance.cursoAtual
    } else {
      disciplina.curso = document.getElementById('curso').value || 'BICTI'
    }

    // Adicionar ao array local
    disciplinas.push(disciplina)
    if (typeof salvarDisciplinas === 'function') {
      salvarDisciplinas(disciplinas, disciplina.curso)
    }
    if (appInstance && typeof appInstance.atualizarTudo === 'function') {
      appInstance.atualizarTudo()
    }

    // Adicionar ao Firebase se logado
    if (
      window.dataService &&
      window.dataService.currentUser &&
      typeof window.dataService.addDiscipline === 'function'
    ) {
      try {
        const result = await window.dataService.addDiscipline(disciplina)
        if (result.success) {
          showNotification('Disciplina adicionada ao servidor!', 'success')
        } else {
          showNotification(
            'Erro ao adicionar disciplina no servidor: ' + result.error,
            'error'
          )
        }
      } catch (err) {
        showNotification(
          'Erro ao adicionar disciplina no servidor: ' + (err?.message || err),
          'error'
        )
      }
    }

    // Reset inteligente do formulário (mantém semestre)
    resetFormInteligente()
  })

  // Função para remover disciplina (deve ser chamada ao clicar no botão de remover)
  window.removerDisciplinaFirebase = async function (disciplina) {
    // Remove do array local
    const appInstance = window.app && window.app.__appInstance
    if (!appInstance) return
    const index = appInstance.disciplinas.findIndex(d => d.id === disciplina.id)
    if (index !== -1) {
      appInstance.disciplinas.splice(index, 1)
      if (typeof salvarDisciplinas === 'function') {
        salvarDisciplinas(appInstance.disciplinas, disciplina.curso)
      }
      // Remover do Firebase se logado e tiver id
      if (
        window.dataService &&
        window.dataService.currentUser &&
        disciplina.id &&
        typeof window.dataService.deleteDisciplineOptimized === 'function'
      ) {
        try {
          const deleteResult =
            await window.dataService.deleteDisciplineOptimized(disciplina.id)
          if (deleteResult.success) {
            showNotification('Disciplina removida do servidor!', 'success')
          } else {
            showNotification(
              'Erro ao remover disciplina no servidor: ' + deleteResult.error,
              'error'
            )
          }
        } catch (err) {
          showNotification(
            'Erro ao remover disciplina no servidor: ' + (err?.message || err),
            'error'
          )
        }
      }
      if (appInstance && typeof appInstance.atualizarTudo === 'function') {
        appInstance.atualizarTudo()
      }
    }
  }

  // Inicializar campos obrigatórios na carga do formulário
  updateRequiredFields()

  // Precargar semestre se não houver valor
  precarregarSemestre()
}
