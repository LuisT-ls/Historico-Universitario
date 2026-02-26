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

  // Regex robusta para capturar o padrão do Histórico Escolar UFBA
  // Padrão identificado na imagem: (Semestre) (Natureza)? (Código) (Nome + Professores) (CH) (Nota) (Situação)
  // Alguns casos a Natureza (EB/EP/OP) vem antes do código.
  const fullRowRegex = /(\d{4}\.\d)\s+([A-Z]{2})?\s*([A-Z0-9]{4,8})\s+(.+?)\s+(\d+)\s+([\d\.-]+)\s+(APR|REP|REPF|REPMF|TRANC|DISP|DISPENSADO|MATR|CANC|INCORP|CUMPRIU|TRANSF|TRANSFERIDO)/g;

  let match;
  // Usar o texto completo sem quebras de linha forçadas para evitar que a regex falhe
  const normalizedText = text.replace(/\n/g, ' ');

  const data = disciplinasData as any;
  const bictiDisciplinas = data.cursos.BICTI as any[];

  while ((match = fullRowRegex.exec(normalizedText)) !== null) {
    const periodo = match[1];
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
    // Padrão observado: O nome da disciplina é MAIÚSCULO, professores têm letras minúsculas (Misto).
    let nome = nomeCompleto;

    // Remover Dr., Dra., MSc. e o que vem depois
    nome = nome.split(/Dr\.|Dra\.|MSc\./)[0].trim();

    // Remover padrões como "(34h)", "(68h)" etc.
    nome = nome.split(/\(\d+h\)/)[0].trim();

    // Se o nome contém letras minúsculas a partir de certo ponto, 
    // provavelmente chegamos no nome do professor (ex: "INTRODUÇÃO RAMON SILVA")
    // O SIGAA UFBA costuma colocar o nome da disciplina todo em UPPERCASE.
    // Vamos procurar a primeira palavra que tenha letras minúsculas e cortar ali.
    const palavras = nome.split(' ');
    let indexProfessor = -1;
    for (let i = 0; i < palavras.length; i++) {
      // Se a palavra tem pelo menos uma letra minúscula e não é uma preposição (do, de, da)
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

    // Tentar encontrar o nome oficial no catálogo usando o código limpo
    const discBicti = bictiDisciplinas.find((d: any) => d.codigo === codigo || (d.codigo.length > 3 && codigo.startsWith(d.codigo)));
    if (discBicti) {
      nome = discBicti.nome.toUpperCase();
    } else {
      // Se não está no BICTI, procurar em outros cursos
      for (const cursoDisciplinas of Object.values(data.cursos)) {
        const discOutro = (cursoDisciplinas as any[]).find((d: any) => d.codigo === codigo || (d.codigo.length > 3 && codigo.startsWith(d.codigo)));
        if (discOutro) {
          nome = discOutro.nome.toUpperCase();
          break;
        }
      }
    }

    // Prioridade: 1. Catálogo (por código ou nome) | 2. PDF (naturezaRaw) | 3. Padrão (OB)
    let naturezaCatalogo = findNaturezaNoCatalogo(codigo, nome);

    // Lógica especial para BICTI: 
    // Se a disciplina não existe no catálogo do BICTI mas existe em outros cursos, 
    // ou se não existe em nenhum catálogo, marcar como OP (Optativa) para o usuário revisar.
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
