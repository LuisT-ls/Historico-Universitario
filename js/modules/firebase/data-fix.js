// Correção temporária para o problema de disciplinas inválidas
export function cleanDisciplineData(discipline) {
  // Remover campos do Firestore para compatibilidade
  const { id, userId, createdAt, updatedAt, ...cleanDiscipline } = discipline

  // Filtrar disciplinas inválidas (com campos obrigatórios null/undefined)
  if (!cleanDiscipline.nome || !cleanDiscipline.codigo) {
    return null // Retorna null para disciplinas inválidas
  }

  // Garantir que campos obrigatórios tenham valores padrão se estiverem null
  return {
    nome: cleanDiscipline.nome || '',
    codigo: cleanDiscipline.codigo || '',
    periodo: cleanDiscipline.periodo || '',
    natureza: cleanDiscipline.natureza || '',
    creditos: cleanDiscipline.creditos || 0,
    horas: cleanDiscipline.horas || 0,
    nota: cleanDiscipline.nota || 0,
    status: cleanDiscipline.status || 'completed',
    curso: cleanDiscipline.curso || 'BICTI',
    resultado: cleanDiscipline.resultado || '',
    dispensada: cleanDiscipline.dispensada || false,
    trancamento: cleanDiscipline.trancamento || false,
    ch: cleanDiscipline.ch || 0
  }
}
