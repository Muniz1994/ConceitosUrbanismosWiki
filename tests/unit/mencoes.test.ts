import { describe, expect, it } from 'vitest';
import { construirConceitos, type EntradaBruta } from '@/lib/conteudo';
import { construirGrafo } from '@/lib/grafo';
import { detetarOcorrencias, normalizarComMapa, prepararAlvos } from '@/lib/mencoes';
import { carregarConceitosReais } from './apoio/conteudo-real';

const alvos = prepararAlvos([
  { nome: 'Fachada', slug: 'fachada' },
  { nome: 'Altura da fachada', slug: 'altura-da-fachada' },
  { nome: 'Edifício', slug: 'edificio' },
  { nome: 'Edificação', slug: 'edificacao' },
  { nome: 'Piso (de um edifício)', slug: 'piso' },
  { nome: 'Piso', slug: 'piso' },
]);
const textoDe = (texto: string, ocorrencias: ReturnType<typeof detetarOcorrencias>) =>
  ocorrencias.map((o) => [texto.slice(o.inicio, o.fim), o.slug]);

describe('normalizarComMapa', () => {
  it('mantém a correspondência com as posições originais', () => {
    const { texto, origem } = normalizarComMapa('Área, (Piso)');
    expect(texto).toBe(' area piso ');
    expect(origem[1]).toBe(0); // «a» ← «Á»
    expect(origem[6]).toBe(7); // «p» ← «P»
  });
});

describe('detetarOcorrencias', () => {
  it('o nome mais longo ganha: «altura da fachada» não menciona Fachada', () => {
    const texto = 'Mede-se a Altura da Fachada e não a fachada lateral.';
    expect(textoDe(texto, detetarOcorrencias(texto, alvos))).toEqual([
      ['Altura da Fachada', 'altura-da-fachada'],
      ['fachada', 'fachada'],
    ]);
  });

  it('exige palavras inteiras', () => {
    const texto = 'As fachadas e a edificabilidade de um edifício.';
    expect(textoDe(texto, detetarOcorrencias(texto, alvos))).toEqual([['edifício', 'edificio']]);
  });

  it('ignora maiúsculas, acentos e pontuação, e encontra aliases', () => {
    const texto = 'O PISO (de um edificio) e cada piso.';
    expect(textoDe(texto, detetarOcorrencias(texto, alvos))).toEqual([
      ['PISO (de um edificio)', 'piso'],
      ['piso', 'piso'],
    ]);
  });

  it('o próprio nome consome o texto sem gerar menções a nomes mais curtos', () => {
    const texto = 'A altura da fachada mede-se…';
    expect(detetarOcorrencias(texto, alvos, 'altura-da-fachada')).toEqual([]);
  });
});

let n = 0;
const entrada = (conceito: string, definicao: string, ver_tambem: string[] = []): EntradaBruta => ({
  ficheiro: `${conceito}.md`,
  dados: { conceito, anexo: 'I', ficha: `I-${++n}`, definicao, notas: [], ver_tambem, aliases: [], figuras: [] },
});

describe('menções no grafo', () => {
  const grafo = construirGrafo(
    construirConceitos([
      entrada('Afastamento', 'Distância entre a fachada de um edifício e a estrema.', ['[[Fachada]]']),
      entrada('Fachada', 'Frente de um edifício.'),
      entrada('Edifício', 'Construção.'),
    ]),
  );

  it('exclui os alvos do «ver também» e regista o inverso', () => {
    expect(grafo.menciona.get('afastamento')).toEqual(['edificio']);
    expect(grafo.mencionadoEm.get('edificio')).toEqual(['afastamento', 'fachada']);
    expect(grafo.mencionadoEm.get('fachada')).toEqual([]);
  });

  it('guarda as ocorrências (incluindo alvos do «ver também») para ligar no texto', () => {
    expect(grafo.ocorrencias.get('afastamento')!.definicao.map((o) => o.slug)).toEqual(['fachada', 'edificio']);
  });
});

describe('conteúdo real', () => {
  it('Afastamento menciona Edifício, e não repete Fachada', () => {
    const g = construirGrafo(carregarConceitosReais());
    expect(g.menciona.get('afastamento')).toContain('edificio');
    expect(g.menciona.get('afastamento')).not.toContain('fachada');
    expect(g.mencionadoEm.get('edificio')).toContain('afastamento');
  });
});
