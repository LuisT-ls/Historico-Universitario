// js/modules/ui/formHandler.js
export function setupFormHandlers(disciplinas, callbacks) {
  const form = document.getElementById('disciplinaForm')
  const trancamentoCheckbox = document.getElementById('trancamento')
  const camposSemTrancamento = document.querySelector('.campos-sem-trancamento')
  const chInput = document.getElementById('ch')
  const notaInput = document.getElementById('nota')

  // Create popup element
  const popup = document.createElement('div')
  popup.className = 'notification-popup'
  document.body.appendChild(popup)

  function showNotification(message) {
    popup.textContent = message
    popup.classList.add('show')
    setTimeout(() => popup.classList.remove('show'), 3000)
  }

  trancamentoCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
      camposSemTrancamento.style.display = 'none'
      chInput.removeAttribute('required')
      notaInput.removeAttribute('required')
    } else {
      camposSemTrancamento.style.display = 'flex'
      chInput.setAttribute('required', '')
      notaInput.setAttribute('required', '')
    }
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()

    const codigo = document.getElementById('codigo').value
    const disciplinaExistente = disciplinas.find(
      d => d.codigo === codigo && d.resultado !== 'TR'
    )

    if (disciplinaExistente) {
      showNotification(`A disciplina ${codigo} já foi cursada!`)
      return
    }

    const disciplina = {
      periodo: document.getElementById('periodo').value,
      codigo: document.getElementById('codigo').value,
      nome: document.getElementById('nome').value,
      natureza: document.getElementById('natureza').value,
      trancamento: document.getElementById('trancamento').checked
    }

    if (!disciplina.trancamento) {
      disciplina.ch = parseInt(document.getElementById('ch').value)
      disciplina.nota = parseFloat(document.getElementById('nota').value)
      disciplina.resultado = disciplina.nota >= 5 ? 'AP' : 'RR'
    } else {
      disciplina.ch = 0
      disciplina.nota = 0
      disciplina.resultado = 'TR'
    }

    disciplinas.push(disciplina)
    callbacks.onSubmit(disciplina)

    const periodoAtual = document.getElementById('periodo').value
    this.reset()
    document.getElementById('periodo').value = periodoAtual
    camposSemTrancamento.style.display = 'flex'
    trancamentoCheckbox.checked = false
  })
}
