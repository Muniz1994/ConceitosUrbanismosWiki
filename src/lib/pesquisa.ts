/**
 * Motor de pesquisa (MiniSearch), partilhado entre o build (cria e serializa o índice)
 * e o navegador (carrega o índice serializado e pesquisa sem pedidos à rede).
 */
import MiniSearch, { type Options, type SearchResult } from 'minisearch';
import type { ConceitoCliente } from './dados-cliente';
import { normalizarComMapa } from './mencoes';
import { normalizar } from './texto';

export type Campo = 'conceito' | 'aliases' | 'abreviatura' | 'definicao' | 'notas' | 'comentario';

/** Ordem de prioridade do campo mostrado como «onde corresponde». */
const PRIORIDADE: Campo[] = ['abreviatura', 'conceito', 'aliases', 'definicao', 'notas', 'comentario'];

const PALAVRAS_VAZIAS = new Set([
  'a', 'o', 'as', 'os', 'e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'por', 'para', 'com', 'que', 'ao', 'aos', 'se', 'ou',
]);

export const OPCOES: Options<ConceitoCliente> = {
  idField: 'slug',
  fields: ['conceito', 'aliases', 'abreviatura', 'definicao', 'notas', 'comentario'],
  storeFields: [],
  extractField: (doc, campo) => {
    const valor = doc[campo as keyof ConceitoCliente];
    return Array.isArray(valor) ? valor.join(' \n ') : ((valor as string | undefined) ?? '');
  },
  // Sem acentos e sem maiúsculas, tanto no índice como na consulta.
  processTerm: (termo) => {
    const t = normalizar(termo);
    return !t || PALAVRAS_VAZIAS.has(t) ? null : t;
  },
  searchOptions: {
    boost: { conceito: 4, aliases: 4, abreviatura: 4, definicao: 2, notas: 1, comentario: 1 },
    prefix: true,
    fuzzy: (termo) => (termo.length >= 4 ? 0.2 : 0),
    combineWith: 'AND',
  },
};

export function criarIndice(conceitos: ConceitoCliente[]): MiniSearch<ConceitoCliente> {
  const indice = new MiniSearch<ConceitoCliente>(OPCOES);
  indice.addAll(conceitos);
  return indice;
}

export function carregarIndice(json: unknown): MiniSearch<ConceitoCliente> {
  return MiniSearch.loadJS(json as Parameters<typeof MiniSearch.loadJS>[0], OPCOES);
}

export interface Trecho {
  texto: string;
  destaque: boolean;
}

export interface Resultado {
  conceito: ConceitoCliente;
  campo: Campo;
  /** Trecho do campo de texto com os termos destacados (vazio para nome/abreviatura). */
  trecho: Trecho[];
  exato: boolean;
}

/** Corta um trecho à volta da primeira ocorrência de um dos termos, destacando-os. */
export function cortarTrecho(texto: string, termos: string[], raio = 70): Trecho[] {
  const { texto: norm, origem } = normalizarComMapa(texto);
  const intervalos: Array<[number, number]> = [];
  for (const termo of termos) {
    let desde = 0;
    for (;;) {
      const p = norm.indexOf(` ${termo}`, desde);
      if (p === -1) break;
      desde = p + 1;
      let fim = p + 1 + termo.length;
      while (fim < norm.length && norm[fim] !== ' ') fim++; // palavra inteira (correspondência por prefixo)
      intervalos.push([origem[p + 1]!, origem[fim - 1]! + 1]);
    }
  }
  if (intervalos.length === 0) return [{ texto: texto.length > raio * 2 ? `${texto.slice(0, raio * 2)}…` : texto, destaque: false }];
  intervalos.sort((a, b) => a[0] - b[0]);

  const [primeiro] = intervalos[0]!;
  let inicio = Math.max(0, primeiro - raio);
  let fim = Math.min(texto.length, primeiro + raio * 1.5);
  if (inicio > 0) inicio = texto.indexOf(' ', inicio) + 1 || inicio;
  if (fim < texto.length) fim = texto.lastIndexOf(' ', fim) > primeiro ? texto.lastIndexOf(' ', fim) : fim;

  const trechos: Trecho[] = [];
  let pos = inicio;
  for (const [a, b] of intervalos) {
    if (a < pos || a >= fim) continue;
    if (a > pos) trechos.push({ texto: texto.slice(pos, a), destaque: false });
    trechos.push({ texto: texto.slice(a, Math.min(b, fim)), destaque: true });
    pos = Math.min(b, fim);
  }
  if (pos < fim) trechos.push({ texto: texto.slice(pos, fim), destaque: false });
  if (inicio > 0) trechos.unshift({ texto: '…', destaque: false });
  if (fim < texto.length) trechos.push({ texto: '…', destaque: false });
  return trechos;
}

function campoPrincipal(r: SearchResult): Campo {
  const campos = new Set(Object.values(r.match).flat() as Campo[]);
  return PRIORIDADE.find((c) => campos.has(c)) ?? 'definicao';
}

function textoDoCampo(c: ConceitoCliente, campo: Campo, termos: string[]): string {
  if (campo === 'notas') {
    return c.notas.find((n) => termos.some((t) => normalizarComMapa(n).texto.includes(` ${t}`))) ?? c.notas[0] ?? '';
  }
  if (campo === 'aliases') return c.aliases.join(', ');
  return (c[campo] as string | undefined) ?? '';
}

export interface OpcoesPesquisa {
  anexo?: 'I' | 'II';
  limite?: number;
}

/**
 * Pesquisa: correspondências exatas de abreviatura (sem distinguir maiúsculas) ou de nome/alias
 * vêm primeiro; depois os resultados do MiniSearch, ordenados pela pontuação com pesos por campo.
 */
export function pesquisar(
  indice: MiniSearch<ConceitoCliente>,
  conceitos: ConceitoCliente[],
  consulta: string,
  { anexo, limite = 30 }: OpcoesPesquisa = {},
): Resultado[] {
  const q = consulta.trim();
  if (!q) return [];
  const porSlug = new Map(conceitos.map((c) => [c.slug, c]));
  const filtro = (c: ConceitoCliente) => !anexo || c.anexo === anexo;
  const qNorm = normalizar(q);

  const exatos = conceitos.filter(
    (c) =>
      filtro(c) &&
      ((c.abreviatura && normalizar(c.abreviatura) === qNorm) ||
        normalizar(c.conceito) === qNorm ||
        c.aliases.some((a) => normalizar(a) === qNorm)),
  );
  let encontrados = indice.search(q, { filter: (r) => filtro(porSlug.get(r.id)!) });
  if (encontrados.length === 0) encontrados = indice.search(q, { combineWith: 'OR', filter: (r) => filtro(porSlug.get(r.id)!) });

  const resultados: Resultado[] = exatos.map((c) => ({
    conceito: c,
    campo: c.abreviatura && normalizar(c.abreviatura) === qNorm ? 'abreviatura' : 'conceito',
    trecho: [],
    exato: true,
  }));
  const jaIncluidos = new Set(exatos.map((c) => c.slug));
  for (const r of encontrados) {
    if (jaIncluidos.has(r.id)) continue;
    const c = porSlug.get(r.id)!;
    const campo = campoPrincipal(r);
    const textual = campo === 'definicao' || campo === 'notas' || campo === 'comentario';
    resultados.push({
      conceito: c,
      campo,
      trecho: textual ? cortarTrecho(textoDoCampo(c, campo, r.terms), r.terms) : [],
      exato: false,
    });
  }
  return resultados.slice(0, limite);
}
