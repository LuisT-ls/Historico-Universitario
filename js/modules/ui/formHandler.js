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

  function showNotification(message) {
    popup.textContent = message
    popup.classList.add('show')
    setTimeout(() => popup.classList.remove('show'), 3000)
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
    if (semestreSalvo && !periodoInput.value) {
      periodoInput.value = semestreSalvo
      console.log(`Semestre carregado do localStorage: ${semestreSalvo}`)
      return
    }
    // Se não houver no localStorage, usa o mais recente das disciplinas
    const semestreMaisRecente = getSemestreMaisRecente()
    if (semestreMaisRecente && !periodoInput.value) {
      periodoInput.value = semestreMaisRecente
      console.log(`Semestre precarregado: ${semestreMaisRecente}`)
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

    console.log('Formulário resetado mantendo período e natureza')
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

  form.addEventListener('submit', function (e) {
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
        disciplinaEditada.periodo = document.getElementById('periodo').value
        disciplinaEditada.codigo = codigo
        disciplinaEditada.nome = document.getElementById('nome').value
        disciplinaEditada.natureza = document.getElementById('natureza').value
        disciplinaEditada.trancamento =
          document.getElementById('trancamento').checked
        disciplinaEditada.dispensada =
          document.getElementById('dispensada').checked
        disciplinaEditada.emcurso = document.getElementById('emcurso').checked
        if (disciplinaEditada.trancamento) {
          disciplinaEditada.ch = 0
          disciplinaEditada.nota = 0
          disciplinaEditada.resultado = 'TR'
        } else if (disciplinaEditada.dispensada) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = 0
          disciplinaEditada.resultado = 'AP'
        } else if (disciplinaEditada.emcurso) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = null
          disciplinaEditada.resultado = 'EC'
        } else if (isAC) {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = null
          disciplinaEditada.resultado = 'AP'
        } else {
          disciplinaEditada.ch = parseInt(document.getElementById('ch').value)
          disciplinaEditada.nota = parseFloat(
            document.getElementById('nota').value
          )
          disciplinaEditada.resultado =
            disciplinaEditada.nota >= 5 ? 'AP' : 'RR'
        }
        // Salvar o semestre atual no localStorage
        localStorage.setItem(
          'ultimoSemestreDigitado',
          disciplinaEditada.periodo
        )
        // Chamar o callback para atualizar a interface
        if (callbacks && typeof callbacks.onSubmit === 'function') {
          callbacks.onSubmit(disciplinaEditada)
        }
        // Limpar modo de edição
        delete appInstance.indiceEdicao
        // Restaurar texto do botão
        const btn = document.querySelector(
          '#disciplinaForm button[type="submit"]'
        )
        if (btn)
          btn.innerHTML =
            '<i class="fas fa-plus-circle"></i> Adicionar Disciplina'
        // Reset inteligente do formulário
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
    } else if (disciplina.emcurso) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = null
      disciplina.resultado = 'EC' // Em Curso
    } else if (isAC) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = null
      disciplina.resultado = 'AP'
    } else {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = parseFloat(document.getElementById('nota').value)
      disciplina.resultado = disciplina.nota >= 5 ? 'AP' : 'RR'
    }

    // Adiciona a disciplina ao array passado por referência
    disciplinas.push(disciplina)
    console.log(
      `Disciplina adicionada: ${disciplina.codigo}, Array agora tem ${disciplinas.length} itens`
    )

    // Salva o semestre atual no localStorage
    localStorage.setItem('ultimoSemestreDigitado', disciplina.periodo)

    // Chama o callback após adicionar a disciplina
    if (callbacks && typeof callbacks.onSubmit === 'function') {
      callbacks.onSubmit(disciplina)
    }

    // Reset inteligente do formulário
    resetFormInteligente()
  })

  // Inicializar campos obrigatórios na carga do formulário
  updateRequiredFields()

  // Precargar semestre se não houver valor
  precarregarSemestre()
}
