import { describe, expect, it } from 'vitest';
import { construirConceitos, type EntradaBruta } from '@/lib/conteudo';
import { construirGrafo, ligacoesNoTexto } from '@/lib/grafo';
import { segmentarTexto } from '@/lib/segmentos';
import { carregarConceitosReais } from './apoio/conteudo-real';

let n = 0;
const entrada = (conceito: string, definicao: string, notas: string[] = []): EntradaBruta => ({
  ficheiro: `${conceito}.md`,
  dados: { conceito, anexo: 'I', ficha: `I-${++n}`, definicao, notas, ver_tambem: [], aliases: [], figuras: [] },
});

describe('ligações no texto oficial', () => {
  const grafo = construirGrafo(
    construirConceitos([
      entrada('Logradouro', 'Espaço do prédio não ocupado pelo edifício, junto ao edifício principal.', [
        'Pode haver edifício anexo.',
        'Outro edifício.',
      ]),
      entrada('Edifício', 'Construção.'),
      entrada('Edifício anexo', 'Construção acessória.'),
    ]),
  );
  const ligacoes = ligacoesNoTexto(grafo, 'logradouro');

  it('liga só a primeira ocorrência de cada conceito na definição', () => {
    expect(ligacoes.definicao.map((o) => o.slug)).toEqual(['edificio']);
  });

  it('nas notas, liga a primeira ocorrência de cada conceito no conjunto das notas', () => {
    expect(ligacoes.notas.map((l) => l.map((o) => o.slug))).toEqual([['edificio-anexo'], ['edificio']]);
  });
});

describe('o texto oficial nunca é alterado', () => {
  const conceitos = carregarConceitosReais();
  const grafo = construirGrafo(conceitos);

  it('a concatenação dos segmentos é igual ao texto original, em todos os conceitos', () => {
    for (const c of conceitos) {
      const l = ligacoesNoTexto(grafo, c.slug);
      const juntar = (texto: string, mencoes: typeof l.definicao) =>
        segmentarTexto(texto, { figuras: c.figuras, mencoes })
          .map((s) => s.texto)
          .join('');
      expect(juntar(c.definicao, l.definicao)).toBe(c.definicao);
      c.notas.forEach((nota, i) => expect(juntar(nota, l.notas[i]!)).toBe(nota));
    }
  });

  it('Afastamento: «fachada», «edifício» e «prédio» ligados uma vez na definição', () => {
    const c = conceitos.find((x) => x.slug === 'afastamento')!;
    const segmentos = segmentarTexto(c.definicao, { mencoes: ligacoesNoTexto(grafo, c.slug).definicao });
    expect(segmentos.filter((s) => s.tipo === 'conceito').map((s) => [s.texto, s.tipo === 'conceito' && s.slug])).toEqual([
      ['fachada', 'fachada'],
      ['edifício', 'edificio'],
      ['prédio', 'predio'],
    ]);
    expect(c.definicao.match(/edifício/g)).toHaveLength(2);
  });
});
