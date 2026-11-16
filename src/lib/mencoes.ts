/**
 * Deteção de menções: o nome (ou alias) de um conceito aparece, como palavras inteiras,
 * no texto oficial de outro. Ignora maiúsculas e acentos; o nome mais longo ganha
 * quando há sobreposição; as posições devolvidas referem-se ao texto original.
 */
import type { Intervalo } from './segmentos';
import { normalizar } from './texto';

const MARCAS = /\p{M}+/gu;
const ALFANUMERICO = /[\p{L}\p{N}]/u;

interface TextoNormalizado {
  /** Texto normalizado com um espaço inicial e final, para facilitar fronteiras de palavra. */
  texto: string;
  /** Para cada carácter normalizado, o índice do carácter original correspondente. */
  origem: number[];
}

/** Normaliza como `normalizar()`, mas guarda a correspondência de posições com o original. */
export function normalizarComMapa(original: string): TextoNormalizado {
  let texto = ' ';
  const origem = [-1];
  for (let i = 0; i < original.length; i++) {
    const base = original[i]!.normalize('NFD').replace(MARCAS, '').toLowerCase();
    for (const ch of base) {
      if (ALFANUMERICO.test(ch)) {
        texto += ch;
        origem.push(i);
      } else if (!texto.endsWith(' ')) {
        texto += ' ';
        origem.push(i);
      }
    }
  }
  if (!texto.endsWith(' ')) {
    texto += ' ';
    origem.push(original.length);
  }
  return { texto, origem };
}

export interface AlvoMencao {
  /** Nome ou alias, tal como escrito. */
  nome: string;
  slug: string;
}

/** Prepara a lista de chaves: normalizadas, sem ambiguidades, da mais longa para a mais curta. */
export function prepararAlvos(alvos: AlvoMencao[]): Array<{ chave: string; slug: string }> {
  const porChave = new Map<string, Set<string>>();
  for (const { nome, slug } of alvos) {
    const chave = normalizar(nome);
    if (!chave) continue;
    porChave.set(chave, (porChave.get(chave) ?? new Set()).add(slug));
  }
  return [...porChave]
    .filter(([, slugs]) => slugs.size === 1)
    .map(([chave, slugs]) => ({ chave, slug: [...slugs][0]! }))
    .sort((a, b) => b.chave.length - a.chave.length || a.chave.localeCompare(b.chave));
}

/**
 * Devolve todas as ocorrências de nomes de conceitos no texto (exceto o próprio conceito),
 * por ordem de posição. O próprio nome é «consumido» para não gerar menções a nomes mais curtos
 * contidos nele (p. ex. «altura da fachada» no conceito Altura da fachada não menciona Fachada).
 */
export function detetarOcorrencias(
  texto: string,
  alvos: Array<{ chave: string; slug: string }>,
  slugProprio?: string,
): Intervalo[] {
  const { texto: norm, origem } = normalizarComMapa(texto);
  const usado = new Uint8Array(norm.length);
  const encontradas: Intervalo[] = [];

  for (const { chave, slug } of alvos) {
    const procurar = ` ${chave} `;
    let desde = 0;
    for (;;) {
      const p = norm.indexOf(procurar, desde);
      if (p === -1) break;
      desde = p + 1;
      const inicio = p + 1;
      const fim = inicio + chave.length;
      if (usado.subarray(inicio, fim).some(Boolean)) continue;
      usado.fill(1, inicio, fim);
      if (slug !== slugProprio) {
        const ini = origem[inicio]!;
        let f = origem[fim - 1]! + 1;
        // Nomes como «Piso (de um edifício)»: incluir o parêntese que fecha.
        const trecho = texto.slice(ini, f);
        if (trecho.split('(').length > trecho.split(')').length && texto[f] === ')') f++;
        encontradas.push({ inicio: ini, fim: f, slug });
      }
    }
  }
  return encontradas.sort((a, b) => a.inicio - b.inicio);
}

/** Primeira ocorrência de cada conceito (para as ligações no texto: uma por secção). */
export function primeiraDeCada(ocorrencias: Intervalo[]): Intervalo[] {
  const vistos = new Set<string>();
  return ocorrencias.filter((o) => (vistos.has(o.slug) ? false : (vistos.add(o.slug), true)));
}
