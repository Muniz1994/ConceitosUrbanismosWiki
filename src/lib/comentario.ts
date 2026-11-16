/**
 * O comentário (corpo Markdown) é renderizado pelo Astro; as ligações `[[Alvo]]` e
 * `[[Alvo|Rótulo]]` chegam ao HTML como texto e são aqui convertidas em ligações.
 * As referências já foram validadas em construirGrafo (referências inválidas fazem falhar o build).
 */
import type { IndiceNomes } from './grafo';
import { normalizar } from './texto';

const WIKILINK_HTML = /\[\[([^\[\]|<>]+?)(?:\|([^\[\]<>]+?))?\]\]/g;

export function ligarWikilinksHtml(html: string, indice: IndiceNomes, urlDe: (slug: string) => string): string {
  return html.replace(WIKILINK_HTML, (original, alvo: string, rotulo?: string) => {
    const candidatos = indice.get(normalizar(alvo.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&')));
    if (!candidatos || candidatos.length !== 1) return original;
    const slug = candidatos[0]!.slug;
    return `<a href="${urlDe(slug)}" data-conceito="${slug}" class="ligacao-conceito">${(rotulo ?? alvo).trim()}</a>`;
  });
}
