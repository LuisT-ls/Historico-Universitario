// js/modules/storage.js
export function carregarDisciplinas() {
  const disciplinasSalvas = localStorage.getItem('disciplinas')
  return disciplinasSalvas ? JSON.parse(disciplinasSalvas) : []
}

export function salvarDisciplinas(disciplinas) {
  localStorage.setItem('disciplinas', JSON.stringify(disciplinas))
}
