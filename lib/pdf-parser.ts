import * as pdfjs from 'pdfjs-dist';
import { Disciplina, Natureza, ResultadoDisciplina } from '@/types';
import { calcularResultado } from './utils';

// Importar o catálogo de disciplinas para inferência de natureza
import disciplinasData from '@/assets/data/disciplinas.json';

// Configurar o worker do PDF.js
// Usar unpkg que tem todas as versões do npm (cdnjs pode não ter versões recentes)
// IMPORTANTE: Para o worker funcionar corretamente no navegador, ele precisa ser carregado do mesmo domínio ou via Blob
let pdfjsWorker = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Tentar configurar o worker de forma mais robusta para Next.js
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface ParsedHistory {
  disciplinas: Disciplina[];
  nomeAluno?: string;
  matricula?: string;
  curso?: string;
  avisos?: string[];
}

/**
 * Mapeia as situações do SIGAA para o tipo ResultadoDisciplina
 */
const mapSituacao = (situacao: string): {
  resultado: ResultadoDisciplina | undefined;
  trancamento: boolean;
  dispensada: boolean;
  emcurso: boolean
} => {
  const s = situacao.toUpperCase();

  if (s === 'APR' || s === 'APROVADO') {
    return { resultado: 'AP', trancamento: false, dispensada: false, emcurso: false };
  }
  if (s === 'REP' || s === 'REPROVADO' || s === 'REPF' || s === 'REPMF') {
    return { resultado: 'RR', trancamento: false, dispensada: false, emcurso: false };
  }
  if (s === 'TRANC' || s === 'TRANCADO') {
    return { resultado: 'TR', trancamento: true, dispensada: false, emcurso: false };
  }
  if (s === 'DISP' || s === 'DISPENSADO') {
    return { resultado: 'DP', trancamento: false, dispensada: true, emcurso: false };
  }
  if (s === 'MATR' || s === 'MATRICULADO') {
    return { resultado: undefined, trancamento: false, dispensada: false, emcurso: true };
  }

  return { resultado: undefined, trancamento: false, dispensada: false, emcurso: false };
};

/**
 * Mapeia as naturezas do SIGAA para o tipo Natureza
 */
const mapNatureza = (natureza: string, codigo: string): Natureza => {
  const n = natureza.toUpperCase();
  if (n === 'EB') return 'OB';
  if (n === 'EP') return 'OP';
  if (n === 'EC') return 'AC';

  // Se a natureza for vazia ou desconhecida, tentar inferir pelo código da disciplina
  if (!n || n === 'OB' || n === '-') {
    // Procurar em todos os cursos do JSON (agora na propriedade cursos)
    for (const cursoDisciplinas of Object.values((disciplinasData as any).cursos)) {
      const disc = (cursoDisciplinas as any[]).find((d: any) => d.codigo === codigo || codigo.startsWith(d.codigo));
      if (disc) return disc.natureza as Natureza;
    }
  }

  // Se for uma das naturezas conhecidas, retorna ela mesma
  const validNatures: Natureza[] = ['AC', 'LV', 'OB', 'OG', 'OH', 'OP', 'OX', 'OZ'];
  if (validNatures.includes(n as Natureza)) return n as Natureza;

  return 'OB'; // Padrão
};

/**
 * Extrai o texto de um PDF usando PDF.js
 */
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useWorkerFetch: true,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Erro detalhado no PDF.js:', error);
    throw error;
  }
}

/**
 * Parseia o conteúdo do histórico escolar da UFBA (SIGAA)
 */
export async function parseSigaaHistory(file: File): Promise<ParsedHistory> {
  const arrayBuffer = await file.arrayBuffer();
  const text = await extractTextFromPDF(arrayBuffer);

  // Log para depuração (remover em produção)
  console.log('Texto extraído do PDF:', text);

  const lines = text.split('\n');

  const disciplinas: Disciplina[] = [];
  const avisos: string[] = [];
  let nomeAluno = '';
  let matricula = '';
  let curso = '';

  // Regex atualizada para capturar o padrão do SIGAA UFBA
  // O padrão observado é: Semestre Nome_da_Disciplina (CH) Situação Código CH Nota Natureza
  // Exemplo: "2021.1 INTRODUÇÃO À COMPUTAÇÃO Dr. VITOR PINHEIRO FERREIRA (34h), Dr. VITOR PINHEIRO FERREIRA (34h) APR CTIA01A 68 6.9 EB"

  // Regex para capturar a linha completa da disciplina baseada no texto extraído
  // O texto extraído do SIGAA UFBA vem em uma linha contínua ou com quebras aleatórias:
  // "2021.1 INTRODUÇÃO À COMPUTAÇÃO Dr. VITOR... APR CTIA01A 68 6.9 EB"
  // Padrão: (Semestre) (Nome + Lixo) (Situação) (Código) (CH) (Nota) (Natureza opcional)
  const fullRowRegex = /(\d{4}\.\d)\s+(.+?)\s+(APR|REP|REPF|REPMF|TRANC|DISP|MATR|CANC|INCORP)\s+([A-Z0-9]{4,8})\s+(\d+)\s+([\d\.-]+)(\s+([A-Z]{2}))?/g;

  let match;
  // Usar o texto completo sem quebras de linha forçadas para evitar que a regex falhe
  const normalizedText = text.replace(/\n/g, ' ');

  while ((match = fullRowRegex.exec(normalizedText)) !== null) {
    const periodo = match[1];
    let nomeCompleto = match[2].trim();
    const situacaoRaw = match[3];
    const codigo = match[4];
    const ch = parseInt(match[5], 10);
    const notaStr = match[6];
    const nota = (notaStr === '--' || notaStr === '---' || notaStr === '-') ? 0 : parseFloat(notaStr.replace(',', '.'));
    const naturezaRaw = match[8] || 'OB';

    // Limpeza profunda do nome:
    // O nome da disciplina no SIGAA UFBA é sempre em MAIÚSCULO.
    // O que vem depois (professores, etc) costuma ter letras minúsculas.

    // 1. Tentar pegar apenas a parte em maiúsculo no início
    let nome = nomeCompleto;

    // Se o nome contém "Dr." ou similares, corta ali
    nome = nome.split(/Dr\.|Dra\.|MSc\.|(?=\(\d+h\))/)[0].trim();

    // 2. Se o nome ainda contém o semestre no início (ex: "2021.1 INTRODUÇÃO...")
    // removemos o semestre do nome, pois ele já foi capturado no grupo 1 da regex
    nome = nome.replace(/^\d{4}\.\d\s+/, '');

    // 3. Se ainda houver lixo de cabeçalho (ex: "Semestre Componente Curricular..."), remove
    nome = nome.replace(/.*Componente Curricular\s+Situação CH\s+Nota\s+/i, '');
    nome = nome.replace(/.*ENADE\s+\d\s+---/i, '');

    // 3. Padrão específico: se o nome começar com o semestre anterior ou lixo de página
    if (nome.includes('Página')) {
      nome = nome.split(/Página\s+\d\s+de/)[1] || nome;
    }

    nome = nome.trim();

    if (!nome || nome.length < 2 || nome === 'Componente Curricular') continue;

    // Tentar inferir a natureza pelo código ou pelo NOME da disciplina no catálogo
    const findNaturezaNoCatalogo = (codigo: string, nomeDisciplina: string): Natureza | null => {
      const data = disciplinasData as any;

      // 1. Tentar encontrar o código via nome no catálogo, se não tiver código
      let codigoBusca = codigo;
      if (!codigoBusca) {
        const itemCatalogo = Object.values(data.catalogo).find((d: any) => d.nome.toUpperCase() === nomeDisciplina.toUpperCase());
        if (itemCatalogo) codigoBusca = (itemCatalogo as any).codigo;
      }

      for (const cursoDisciplinas of Object.values(data.cursos)) {
        // Tentar por código
        const discPorCodigo = (cursoDisciplinas as any[]).find((d: any) => d.codigo === codigoBusca || codigoBusca.startsWith(d.codigo));
        if (discPorCodigo) return discPorCodigo.natureza as Natureza;
      }
      return null;
    };

    const { resultado, trancamento, dispensada, emcurso } = mapSituacao(situacaoRaw);

    // Prioridade: 1. Catálogo (por código ou nome) | 2. PDF (naturezaRaw) | 3. Padrão (OB)
    let naturezaCatalogo = findNaturezaNoCatalogo(codigo, nome);

    // Lógica especial para BICTI: 
    // Se a disciplina não existe no catálogo do BICTI mas existe em outros cursos, 
    // ou se não existe em nenhum catálogo, marcar como OP (Optativa) para o usuário revisar.
    const data = disciplinasData as any;
    const bictiDisciplinas = data.cursos.BICTI as any[];

    let existeNoBicti = bictiDisciplinas.some((d: any) => d.codigo === codigo);
    if (!existeNoBicti) {
      // Checar pelo nome via catálogo
      const itemCatalogo = Object.values(data.catalogo).find((d: any) => d.nome.toUpperCase() === nome.toUpperCase());
      if (itemCatalogo) {
        existeNoBicti = bictiDisciplinas.some((d: any) => d.codigo === (itemCatalogo as any).codigo);
      }
    }

    if (!existeNoBicti && naturezaCatalogo === 'OB') {
      // Se no catálogo geral é OB mas não existe no BICTI, provavelmente é de outro curso
      naturezaCatalogo = 'OP';
      if (!avisos.includes('Algumas disciplinas de outros cursos foram marcadas como OP. Revise-as no seu histórico.')) {
        avisos.push('Algumas disciplinas de outros cursos foram marcadas como OP. Revise-as no seu histórico.');
      }
    }

    const natureza = naturezaCatalogo || mapNatureza(naturezaRaw, codigo);

    disciplinas.push({
      periodo,
      codigo,
      nome,
      natureza,
      ch,
      nota,
      trancamento,
      dispensada,
      emcurso,
      resultado: resultado || calcularResultado(nota, trancamento, dispensada, emcurso, natureza)
    });
  }

  return {
    disciplinas,
    nomeAluno,
    matricula,
    curso,
    avisos
  };
}
