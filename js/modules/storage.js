// js/modules/storage.js
export function carregarDisciplinas(curso) {
  console.log(`Carregando disciplinas do curso: ${curso}`)
  const disciplinasSalvas = localStorage.getItem(`disciplinas_${curso}`)
  console.log(`Disciplinas salvas: ${disciplinasSalvas || '[]'}`)

  if (!disciplinasSalvas) {
    return []
  }

  try {
    const disciplinasObj = JSON.parse(disciplinasSalvas)
    // Verificar se é realmente um array
    if (Array.isArray(disciplinasObj)) {
      return disciplinasObj
    } else {
      console.error(
        `Erro: dados de disciplinas não são um array para o curso ${curso}`
      )
      return []
    }
  } catch (error) {
    console.error(`Erro ao analisar disciplinas do curso ${curso}:`, error)
    return []
  }
}

export function salvarDisciplinas(disciplinas, curso) {
  if (!Array.isArray(disciplinas)) {
    console.error(
      `Erro: tentativa de salvar disciplinas que não são um array para o curso ${curso}`
    )
    return
  }

  console.log(`Salvando ${disciplinas.length} disciplinas do curso: ${curso}`)

  try {
    const disciplinasString = JSON.stringify(disciplinas)
    localStorage.setItem(`disciplinas_${curso}`, disciplinasString)

    // Verificação de consistência
    const savedData = localStorage.getItem(`disciplinas_${curso}`)
    if (savedData !== disciplinasString) {
      console.error(
        `Erro: inconsistência na gravação de dados para o curso ${curso}`
      )
    }
  } catch (error) {
    console.error(`Erro ao salvar disciplinas do curso ${curso}:`, error)
  }
}
