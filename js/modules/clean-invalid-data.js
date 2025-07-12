// Script para limpar dados inválidos do localStorage
export function cleanInvalidData() {
  const courses = ['BICTI', 'BCC', 'BSI', 'BEC']

  courses.forEach(curso => {
    const key = `disciplinas_${curso}`
    const data = localStorage.getItem(key)

    if (data) {
      try {
        const disciplines = JSON.parse(data)

        if (Array.isArray(disciplines)) {
          // Filtrar disciplinas válidas
          const validDisciplines = disciplines.filter(discipline => {
            // Uma disciplina é válida se tem nome e código
            return (
              discipline &&
              discipline.nome &&
              discipline.codigo &&
              discipline.nome.trim() !== '' &&
              discipline.codigo.trim() !== ''
            )
          })

          // Se o número de disciplinas mudou, atualizar localStorage
          if (validDisciplines.length !== disciplines.length) {
            console.log(
              `Limpando ${
                disciplines.length - validDisciplines.length
              } disciplinas inválidas do curso ${curso}`
            )
            localStorage.setItem(key, JSON.stringify(validDisciplines))
          }
        }
      } catch (error) {
        console.error(`Erro ao processar dados do curso ${curso}:`, error)
        // Se há erro, limpar os dados corrompidos
        localStorage.removeItem(key)
      }
    }
  })
}

// Executar limpeza automaticamente
cleanInvalidData()
