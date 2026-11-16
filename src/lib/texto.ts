/**
 * Utilitários de texto partilhados pelo site, pelo script de importação e pelos testes.
 * Sem dependências do Astro, para poderem correr em Node puro.
 */

const MARCAS_COMBINANTES = /\p{M}+/gu;

/** Remove acentos e outros diacríticos, mantendo maiúsculas/minúsculas. */
export function semAcentos(texto: string): string {
  return texto.normalize('NFD').replace(MARCAS_COMBINANTES, '').normalize('NFC');
}

/**
 * Forma normalizada usada para comparar nomes e referências:
 * sem acentos, minúsculas, pontuação substituída por espaços, espaços colapsados.
 */
export function normalizar(texto: string): string {
  return semAcentos(texto)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Endereço estável a partir do nome do conceito: `Área de implantação` → `area-de-implantacao`. */
export function slugify(texto: string): string {
  return normalizar(texto).replace(/ /g, '-');
}

const SOBRESCRITOS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

/**
 * Formata unidades tal como vêm da fonte para a forma tipográfica.
 * `[m2]` → `m²`, `[m3/m2]` → `m³/m²`, `[m2]; [km2]; [ha]` → `m², km², ha`.
 */
export function formatarUnidades(bruto: string): string {
  return bruto
    .split(';')
    .map((parte) =>
      parte
        .trim()
        .replace(/^\[(.*)\]$/, '$1')
        .replace(/(\p{L})(\d+)/gu, (_, letra: string, digitos: string) =>
          letra + [...digitos].map((d) => SOBRESCRITOS[d]).join(''),
        ),
    )
    .filter(Boolean)
    .join(', ');
}

export interface Wikilink {
  /** Nome ou alias do conceito referido, tal como escrito. */
  alvo: string;
  /** Texto a mostrar (`[[Alvo|Rótulo]]`), ou o próprio alvo. */
  rotulo: string;
  inicio: number;
  fim: number;
}

const WIKILINK = /\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g;

/** Encontra todas as ligações `[[Alvo]]` ou `[[Alvo|Rótulo]]` num texto. */
export function extrairWikilinks(texto: string): Wikilink[] {
  return [...texto.matchAll(WIKILINK)].map((m) => ({
    alvo: m[1]!.trim(),
    rotulo: (m[2] ?? m[1]!).trim(),
    inicio: m.index!,
    fim: m.index! + m[0].length,
  }));
}

/** `"[[Recuo]]"` → `"Recuo"`; texto sem parênteses retos é devolvido aparado. */
export function desembrulharWikilink(valor: string): string {
  const m = /^\s*\[\[([^\[\]|]+?)(?:\|[^\[\]]+?)?\]\]\s*$/.exec(valor);
  return (m ? m[1]! : valor).trim();
}

/** Ordenação alfabética portuguesa (acentos agrupados com a letra base). */
export const colador = new Intl.Collator('pt-PT', { sensitivity: 'base', numeric: true });

export function compararPt(a: string, b: string): number {
  return colador.compare(a, b);
}

/** Letra do índice A–Z: `Área` → `A`. */
export function letraInicial(texto: string): string {
  return semAcentos(texto.trim()).charAt(0).toUpperCase();
}
