/**
 * Função de comparação para ordenação de períodos (do mais recente para o mais antigo).
 * Use `(a, b) => compararPeriodos(b, a)` para ordem ascendente (mais antigo primeiro).
 *
 * @param a - Período A (Ex: "2023.1")
 * @param b - Período B (Ex: "2022.2")
 * @returns Número indicando a ordem para o método .sort()
 */
export function compararPeriodos(a: string, b: string): number {
  const [anoA, semA] = a.split('.').map(Number)
  const [anoB, semB] = b.split('.').map(Number)

  if (anoA !== anoB) return anoB - anoA // Ano mais recente primeiro
  return semB - semA // Semestre mais recente primeiro
}

/**
 * Identifica o período letivo mais recente em uma lista de disciplinas
 *
 * @param disciplinas - Lista de objetos contendo o campo periodo (Ex: "2023.1")
 * @returns O período mais recente ou null se a lista estiver vazia
 */
export function getPeriodoMaisRecente(disciplinas: Array<{ periodo: string }>): string | null {
  if (disciplinas.length === 0) return null

  const periodos = disciplinas
    .map((d) => d.periodo)
    .filter((p) => p && p.trim() !== '')
    .sort(compararPeriodos)

  return periodos[0] || null
}

/**
 * Retorna o semestre letivo atual no formato AAAA.S baseado na data do sistema.
 * Meses 1–7 (Jan–Jul) → semestre 1 | Meses 8–12 (Ago–Dez) → semestre 2
 */
export function getCurrentSemester(): string {
  const now = new Date()
  const semester = now.getMonth() <= 6 ? 1 : 2
  return `${now.getFullYear()}.${semester}`
}

/**
 * Calcula o número total de semestres transcorridos desde o ingresso até o atual.
 */
export function calcularTotalSemestresCursados(
  inicio: string, // Ex: "2023.2" ou "2023.2.1"
  fim: string     // Ex: "2025.2"
): number {
  if (!inicio || !fim) return 0

  // Limpar possíveis inputs sujos (ex: "2020.1" no campo ano + ".1" do campo semestre)
  const partesI = inicio.split('.').filter(p => !isNaN(Number(p)))
  const partesF = fim.split('.').filter(p => !isNaN(Number(p)))

  const anoI = Number(partesI[0])
  const semI = Number(partesI[1]) || 1
  const anoF = Number(partesF[0])
  const semF = Number(partesF[1]) || 1

  if (isNaN(anoI) || isNaN(anoF)) return 0

  return (anoF - anoI) * 2 + (semF - semI) + 1
}
