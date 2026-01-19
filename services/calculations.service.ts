/**
 * Serviço de Cálculos - Re-exporta funções de cálculo de lib/utils.ts
 * Mantém a lógica de negócio separada dos componentes
 */

export {
    calcularResultado,
    calcularMediaGeral,
    calcularCR,
    calcularCreditos,
    calcularPCH,
    calcularPCR,
    getStatusCR,
    calcularTendenciaNotas,
    calcularPrevisaoFormaturaCompleta,
    calcularEstatisticas,
    getPeriodoMaisRecente,
    compararPeriodos,
} from '@/lib/utils'
