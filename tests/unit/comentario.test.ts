import { describe, expect, it } from 'vitest';
import { ligarWikilinksHtml } from '@/lib/comentario';
import { construirConceitos } from '@/lib/conteudo';
import { criarIndiceNomes } from '@/lib/grafo';

const conceitos = construirConceitos(
  ['Recuo', 'Piso (de um edifício)'].map((conceito, i) => ({
    ficheiro: `${conceito}.md`,
    dados: {
      conceito,
      anexo: 'I' as const,
      ficha: `I-${i + 1}`,
      definicao: 'x',
      notas: [],
      ver_tambem: [],
      aliases: conceito === 'Recuo' ? [] : ['Piso'],
      figuras: [],
    },
  })),
);
const indice = criarIndiceNomes(conceitos);
const urlDe = (slug: string) => `/base/conceitos/${slug}/`;

describe('ligarWikilinksHtml', () => {
  it('converte [[Alvo]] e [[Alvo|Rótulo]] em ligações', () => {
    const html = '<p>Comparar com [[Recuo]] e com os [[Piso|pisos]].</p>';
    expect(ligarWikilinksHtml(html, indice, urlDe)).toBe(
      '<p>Comparar com <a href="/base/conceitos/recuo/" data-conceito="recuo" class="ligacao-conceito">Recuo</a> e com os ' +
        '<a href="/base/conceitos/piso-de-um-edificio/" data-conceito="piso-de-um-edificio" class="ligacao-conceito">pisos</a>.</p>',
    );
  });

  it('deixa intacto texto sem ligações', () => {
    expect(ligarWikilinksHtml('<p>Sem ligações [nota].</p>', indice, urlDe)).toBe('<p>Sem ligações [nota].</p>');
  });
});
