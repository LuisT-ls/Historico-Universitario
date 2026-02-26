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
  if (s === 'DISP' || s === 'DISPENSADO' || s === 'CUMPRIU' || s === 'TRANSF' || s === 'TRANSFERIDO') {
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
/**
 * Extrai o texto de um PDF usando PDF.js preservando a estrutura de linhas
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

      // Algoritmo de agrupamento por tolerância (mais robusto que arredondamento fixo)
      const items = (textContent.items as any[])
        .filter(item => 'str' in item && item.str.trim() !== '')
        .map(item => ({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5]
        }));

      if (items.length === 0) continue;

      // Ordenar itens por Y (cima para baixo)
      items.sort((a, b) => b.y - a.y);

      const lines: string[][] = [];
      let currentLine: any[] = [items[0]];

      for (let j = 1; j < items.length; j++) {
        const item = items[j];
        const prevItem = currentLine[currentLine.length - 1];

        // Se a diferença de Y for pequena (mesma linha), agrupar
        // Threshold de 5 unidades é seguro para a maioria dos PDFs
        if (Math.abs(item.y - prevItem.y) < 5) {
          currentLine.push(item);
        } else {
          // Nova linha: ordenar a anterior por X e salvar
          lines.push(currentLine.sort((a, b) => a.x - b.x).map(i => i.str));
          currentLine = [item];
        }
      }
      // Adicionar a última linha
      lines.push(currentLine.sort((a, b) => a.x - b.x).map(i => i.str));

      const pageText = lines.map(cols => cols.join(' ')).join('\n');
      fullText += pageText + '\n';
    }

    console.log('Linhas reconstruídas no PDF:', fullText.split('\n').length);

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

  // Regex para capturar uma linha de disciplina (Semestre opcional, Natureza opcional, Código, Nome, CH, Nota, Situação)
  const rowRegex = /^(\d{4}\.\d)?\s*(EB|EP|OP|AC|OB|LV|OG|OH|OX|OZ)?\s*([A-Z]{2,4}[0-9]{2,4}[A-Z0-9]?)\s+(.+?)\s+(\d+)\s+([\d\.,-]+)\s+(APR|REP|REPF|REPMF|TRANC|DISP|DISPENSADO|MATR|CANC|INCORP|CUMPRIU|TRANSF|TRANSFERIDO)/i;

  let currentPeriod = '';
  const data = disciplinasData as any;
  const bictiDisciplinas = data.cursos.BICTI as any[];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Tentar encontrar o padrão da linha
    const match = trimmedLine.match(rowRegex);

    if (!match) {
      // Se não for uma linha de disciplina, ver se é apenas um período (ex: quebra de página)
      const periodOnlyMatch = trimmedLine.match(/^(\d{4}\.\d)$/);
      if (periodOnlyMatch) currentPeriod = periodOnlyMatch[1];
      continue;
    }

    // Se encontramos uma linha, atualizar o período se ele estiver presente
    if (match[1]) currentPeriod = match[1];

    const periodo = currentPeriod || '0000.0';
    const naturezaCapturada = match[2];
    let codigo = match[3];
    let nomeCompleto = match[4].trim();
    const ch = parseInt(match[5], 10);
    const notaStr = match[6];
    const nota = (notaStr === '--' || notaStr === '---' || notaStr === '-') ? 0 : parseFloat(notaStr.replace(',', '.'));
    const situacaoRaw = match[7];

    // 1. Limpeza do Código: Remover 'A' final (indicador de turma) se o código tiver mais de 5 caracteres
    if (codigo.endsWith('A') && codigo.length >= 6) {
      codigo = codigo.slice(0, -1);
    }

    // 2. Limpeza Profunda do Nome (Remover professores):
    let nome = nomeCompleto;
    nome = nome.split(/Dr\.|Dra\.|MSc\./)[0].trim();
    nome = nome.split(/\(\d+h\)/)[0].trim();

    const palavras = nome.split(' ');
    let indexProfessor = -1;
    for (let i = 0; i < palavras.length; i++) {
      if (/[a-z]/.test(palavras[i]) && !/^(de|do|da|e|o|a)$/i.test(palavras[i])) {
        indexProfessor = i;
        break;
      }
    }
    if (indexProfessor !== -1) {
      nome = palavras.slice(0, indexProfessor).join(' ').trim();
    }

    // 3. Natureza: Usar a capturada na regex ou 'OB' como padrão
    const naturezaRaw = naturezaCapturada === 'EB' ? 'OB' : (naturezaCapturada === 'EP' ? 'OP' : (naturezaCapturada || 'OB'));

    if (!nome || nome.length < 2 || nome === 'Componente Curricular') continue;

    const findNaturezaNoCatalogo = (codigo: string, nomeDisciplina: string): Natureza | null => {
      let codigoBusca = codigo;
      if (!codigoBusca && nomeDisciplina) {
        const itemCatalogo = Object.values(data.catalogo).find((d: any) =>
          d?.nome && d.nome.toUpperCase() === nomeDisciplina.toUpperCase()
        );
        if (itemCatalogo) codigoBusca = (itemCatalogo as any).codigo;
      }

      for (const cursoDisciplinas of Object.values(data.cursos)) {
        const discPorCodigo = (cursoDisciplinas as any[]).find((d: any) => d.codigo === codigoBusca || codigoBusca.startsWith(d.codigo));
        if (discPorCodigo) return discPorCodigo.natureza as Natureza;
      }
      return null;
    };

    const { resultado, trancamento, dispensada, emcurso } = mapSituacao(situacaoRaw);

    const discBicti = bictiDisciplinas.find((d: any) => d.codigo === codigo || (d.codigo.length > 3 && codigo.startsWith(d.codigo)));
    if (discBicti?.nome) {
      nome = discBicti.nome.toUpperCase();
    } else {
      for (const cursoDisciplinas of Object.values(data.cursos)) {
        const discOutro = (cursoDisciplinas as any[]).find((d: any) => d.codigo === codigo || (d.codigo.length > 3 && codigo.startsWith(d.codigo)));
        if (discOutro?.nome) {
          nome = discOutro.nome.toUpperCase();
          break;
        }
      }
    }

    let naturezaCatalogo = findNaturezaNoCatalogo(codigo, nome);
    let existeNoBicti = bictiDisciplinas.some((d: any) => d.codigo === codigo);
    if (!existeNoBicti) {
      const itemCatalogo = Object.values(data.catalogo).find((d: any) => d?.nome && d.nome.toUpperCase() === nome.toUpperCase());
      if (itemCatalogo) {
        existeNoBicti = bictiDisciplinas.some((d: any) => d.codigo === (itemCatalogo as any).codigo);
      }
    }

    if (!existeNoBicti && naturezaCatalogo === 'OB') {
      naturezaCatalogo = 'OP';
      if (!avisos.includes('Algumas disciplinas de outros cursos foram marcadas como OP. Revise-as no seu histórico.')) {
        avisos.push('Algumas disciplinas de outros cursos foram marcadas como OP. Revise-as no seu histórico.');
      }
    }

    const naturezaNormal = naturezaCatalogo || mapNatureza(naturezaRaw, codigo);
    const natureza = codigo.startsWith('MAT') ? 'OP' : naturezaNormal;

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
