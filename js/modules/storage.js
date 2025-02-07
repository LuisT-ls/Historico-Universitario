// js/modules/storage.js
export function carregarDisciplinas(curso) {
  const disciplinasSalvas = localStorage.getItem(`disciplinas_${curso}`)
  return disciplinasSalvas ? JSON.parse(disciplinasSalvas) : []
}

export function salvarDisciplinas(disciplinas, curso) {
  localStorage.setItem(`disciplinas_${curso}`, JSON.stringify(disciplinas))
}
