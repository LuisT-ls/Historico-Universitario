// js/modules/ui/formHandler.js
export function setupFormHandlers(disciplinas, callbacks) {
  const form = document.getElementById('disciplinaForm')
  const trancamentoCheckbox = document.getElementById('trancamento')
  const dispensadaCheckbox = document.getElementById('dispensada')
  const camposSemTrancamento = document.querySelector('.campos-sem-trancamento')
  const chInput = document.getElementById('ch')
  const notaInput = document.getElementById('nota')
  const naturezaSelect = document.getElementById('natureza')
  const notaContainer = notaInput.parentElement

  // Create popup element
  const popup = document.createElement('div')
  popup.className = 'notification-popup'
  document.body.appendChild(popup)

  function showNotification(message) {
    popup.textContent = message
    popup.classList.add('show')
    setTimeout(() => popup.classList.remove('show'), 3000)
  }

  // Handle trancamento checkbox
  trancamentoCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
      camposSemTrancamento.style.display = 'none'
      chInput.removeAttribute('required')
      notaInput.removeAttribute('required')
      dispensadaCheckbox.checked = false // Uncheck dispensada when trancamento is checked
    } else {
      camposSemTrancamento.style.display = 'flex'
      notaContainer.style.display = 'block' // Show nota input when unchecking trancamento
      if (!dispensadaCheckbox.checked) {
        chInput.setAttribute('required', '')
        notaInput.setAttribute('required', '')
      }
    }
  })

  // Handle dispensada checkbox
  dispensadaCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
      naturezaSelect.value = 'LV' // Set natureza to Componente Livre
      naturezaSelect.disabled = true
      notaInput.value = '' // Clear nota
      notaContainer.style.display = 'none' // Hide the nota input container
      notaInput.removeAttribute('required')
      chInput.setAttribute('required', '') // CH still required
      trancamentoCheckbox.checked = false // Uncheck trancamento
    } else {
      naturezaSelect.disabled = false
      notaContainer.style.display = 'block'
      notaInput.setAttribute('required', '')
    }
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()

    const codigo = document.getElementById('codigo').value

    // Verifica se a disciplina já foi aprovada anteriormente
    const disciplinaAprovada = disciplinas.find(
      d => d.codigo === codigo && d.resultado === 'AP'
    )

    if (disciplinaAprovada) {
      showNotification(`A disciplina ${codigo} já foi cursada e aprovada!`)
      return
    }

    const disciplina = {
      periodo: document.getElementById('periodo').value,
      codigo: document.getElementById('codigo').value,
      nome: document.getElementById('nome').value,
      natureza: document.getElementById('natureza').value,
      trancamento: document.getElementById('trancamento').checked,
      dispensada: document.getElementById('dispensada').checked
    }

    if (disciplina.trancamento) {
      disciplina.ch = 0
      disciplina.nota = 0
      disciplina.resultado = 'TR'
    } else if (disciplina.dispensada) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = 0
      disciplina.resultado = 'AP' // Dispensada counts as approved
      disciplina.natureza = 'LV' // Force Componente Livre for dispensada
    } else {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = parseFloat(document.getElementById('nota').value)
      disciplina.resultado = disciplina.nota >= 5 ? 'AP' : 'RR'
    }

    disciplinas.push(disciplina)
    callbacks.onSubmit(disciplina)

    const periodoAtual = document.getElementById('periodo').value
    this.reset()
    document.getElementById('periodo').value = periodoAtual
    camposSemTrancamento.style.display = 'flex'
    notaContainer.style.display = 'block' // Show nota input after form reset
    trancamentoCheckbox.checked = false
    naturezaSelect.disabled = false
  })
}
