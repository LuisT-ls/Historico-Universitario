// js/modules/storage.js
export function carregarDisciplinas(curso) {
  console.log(`Carregando disciplinas do curso: ${curso}`) // Log para debug
  const disciplinasSalvas = localStorage.getItem(`disciplinas_${curso}`)
  console.log(`Disciplinas salvas: ${disciplinasSalvas}`) // Log para debug
  return disciplinasSalvas ? JSON.parse(disciplinasSalvas) : []
}

export function salvarDisciplinas(disciplinas, curso) {
  console.log(`Salvando ${disciplinas.length} disciplinas do curso: ${curso}`) // Log para debug
  localStorage.setItem(`disciplinas_${curso}`, JSON.stringify(disciplinas))
}
