// js/modules/ui/formHandler.js
export function setupFormHandlers(disciplinas, callbacks) {
  const form = document.getElementById('disciplinaForm')
  const trancamentoCheckbox = document.getElementById('trancamento')
  const camposSemTrancamento = document.querySelector('.campos-sem-trancamento')

  trancamentoCheckbox.addEventListener('change', e => {
    const campos = document.querySelector('.campos-sem-trancamento')
    const chInput = document.getElementById('ch')
    const notaInput = document.getElementById('nota')

    if (e.target.checked) {
      campos.classList.add('hidden')
      chInput.removeAttribute('required')
      notaInput.removeAttribute('required')
    } else {
      campos.classList.remove('hidden')
      chInput.setAttribute('required', '')
      notaInput.setAttribute('required', '')
    }
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()

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

    camposSemTrancamento.classList.remove('hidden')
  })
}
