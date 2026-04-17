import prereqData from '@/assets/data/prerequisitos.json'
import type { Curso, MapaPrerequisitos } from '@/types'

const mapa = prereqData as MapaPrerequisitos & { _info?: string }

/**
 * Disciplinas equivalentes (mesma disciplina, códigos diferentes por curso ou versão).
 * Completar qualquer código do grupo satisfaz pré-requisitos que exijam outro código do grupo.
 */
const EQUIVALENCIAS: Record<string, string[]> = {
  'CTIA45':   ['GCTI0008'], // Física I — código ENG / código BICTI
  'GCTI0008': ['CTIA45'],
  'CTIA79':   ['GCTI0013'], // Desenho Técnico I — código CTIA / código GCTI
  'GCTI0013': ['CTIA79'],
}

/** Remove sufixo de turma de códigos vindos do SIGAA (ex: "CTIA01A" → "CTIA01"). */
function normCodigo(c: string): string {
  return c.length >= 6 && c.endsWith('A') ? c.slice(0, -1) : c
}

/** Retorna os pré-requisitos diretos de uma disciplina no curso informado. */
export function getPrerequisitos(codigo: string, curso: Curso): string[] {
  return mapa[curso]?.[normCodigo(codigo.toUpperCase())] ?? []
}

/**
 * Verifica se um código (ou qualquer um dos seus equivalentes) está na lista de aprovados.
 */
function estaAprovado(codigo: string, aprovadosNorm: Set<string>): boolean {
  const norm = normCodigo(codigo.toUpperCase())
  if (aprovadosNorm.has(norm)) return true
  // Verifica equivalentes (ex: GCTI0008 satisfaz CTIA45 e vice-versa)
  return (EQUIVALENCIAS[norm] ?? []).some(eq => aprovadosNorm.has(normCodigo(eq.toUpperCase())))
}

/**
 * Retorna true se todos os pré-requisitos da disciplina estão na lista de aprovados.
 * Respeita equivalências de código (ex: GCTI0008 ↔ CTIA45).
 */
export function prerequisitosAtendidos(
  codigo: string,
  curso: Curso,
  codigosAprovados: string[]
): boolean {
  const prereqs = getPrerequisitos(codigo, curso)
  if (prereqs.length === 0) return true
  const aprovadosNorm = new Set(codigosAprovados.map(c => normCodigo(c.toUpperCase())))
  return prereqs.every(p => estaAprovado(p, aprovadosNorm))
}

/**
 * Retorna a lista de códigos de pré-requisitos ainda não cumpridos.
 * Retorna array vazio se todos estiverem aprovados ou se não houver pré-requisitos.
 */
export function prerequisitosFaltando(
  codigo: string,
  curso: Curso,
  codigosAprovados: string[]
): string[] {
  const prereqs = getPrerequisitos(codigo, curso)
  if (prereqs.length === 0) return []
  const aprovadosNorm = new Set(codigosAprovados.map(c => normCodigo(c.toUpperCase())))
  return prereqs.filter(p => !estaAprovado(p, aprovadosNorm))
}

/**
 * Retorna todos os códigos que dependem diretamente de `codigo` no curso informado
 * (disciplinas que têm `codigo` como pré-requisito).
 */
export function dependentes(codigo: string, curso: Curso): string[] {
  const cursoPrer = mapa[curso] ?? {}
  const norm = normCodigo(codigo.toUpperCase())
  const equivalentes = new Set([norm, ...(EQUIVALENCIAS[norm] ?? []).map(e => normCodigo(e.toUpperCase()))])
  return Object.entries(cursoPrer)
    .filter(([, prereqs]) => prereqs.some(p => equivalentes.has(normCodigo(p.toUpperCase()))))
    .map(([cod]) => cod)
}

/**
 * Retorna todos os pré-requisitos recursivos de uma disciplina (toda a cadeia acima),
 * sem duplicatas. Útil para calcular o caminho completo de desbloqueio.
 */
export function prerequisitosRecursivos(codigo: string, curso: Curso): string[] {
  const visited = new Set<string>()
  const result: string[] = []

  function traverse(cod: string) {
    const norm = normCodigo(cod.toUpperCase())
    if (visited.has(norm)) return
    visited.add(norm)
    const prereqs = mapa[curso]?.[norm] ?? []
    for (const p of prereqs) {
      result.push(p)
      traverse(p)
    }
  }

  traverse(codigo)
  return [...new Set(result)]
}
