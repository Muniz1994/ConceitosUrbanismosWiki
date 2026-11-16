import { describe, expect, it } from 'vitest';
import type { ConceitoCliente } from '@/lib/dados-cliente';
import { carregarIndice, cortarTrecho, criarIndice, pesquisar } from '@/lib/pesquisa';
import { carregarConceitosReais } from './apoio/conteudo-real';

const conceitos: ConceitoCliente[] = carregarConceitosReais().map((c) => ({
  slug: c.slug,
  conceito: c.conceito,
  anexo: c.anexo,
  ficha: c.ficha,
  abreviatura: c.abreviatura,
  unidades: c.unidades,
  aliases: c.aliases,
  definicao: c.definicao,
  notas: c.notas,
  comentario: c.comentario,
}));
// Como no site: o índice é serializado no build e carregado no navegador.
const indice = carregarIndice(JSON.parse(JSON.stringify(criarIndice(conceitos).toJSON())));
const nomes = (q: string, opcoes = {}) => pesquisar(indice, conceitos, q, opcoes).map((r) => r.conceito.conceito);

describe('pesquisa', () => {
  it('abreviatura «Af» → Afastamento primeiro', () => {
    expect(nomes('Af')[0]).toBe('Afastamento');
  });

  it('abreviatura partilhada «Ai» → os dois conceitos acima de correspondências no texto', () => {
    expect(nomes('Ai').slice(0, 2).sort()).toEqual(['Área de implantação do edifício', 'Área total de implantação']);
  });

  it('«recuo» → Recuo primeiro', () => {
    expect(nomes('recuo')[0]).toBe('Recuo');
  });

  it('sem acentos: «area implantacao» encontra Área de implantação do edifício entre os primeiros', () => {
    expect(nomes('area implantacao').slice(0, 3)).toContain('Área de implantação do edifício');
  });

  it('prefixo enquanto se escreve: «afast»', () => {
    expect(nomes('afast')).toContain('Afastamento');
  });

  it('erro de escrita: «fachda» encontra Fachada', () => {
    expect(nomes('fachda')).toContain('Fachada');
  });

  it('indica o campo que corresponde e destaca o trecho', () => {
    const r = pesquisar(indice, conceitos, 'proto-urbanístico').find((x) => x.conceito.slug === 'alinhamento')!;
    expect(r.campo).toBe('notas');
    expect(r.trecho.some((t) => t.destaque && /proto/i.test(t.texto))).toBe(true);
  });

  it('filtra por anexo', () => {
    const r = pesquisar(indice, conceitos, 'planta', { anexo: 'II' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.conceito.anexo === 'II')).toBe(true);
  });

  it('sem resultados para «xyzzy»', () => {
    expect(nomes('xyzzy')).toEqual([]);
  });
});

describe('cortarTrecho', () => {
  it('destaca a palavra inteira que começa pelo termo, ignorando acentos', () => {
    expect(cortarTrecho('A Área de implantação.', ['implantacao'])).toEqual([
      { texto: 'A Área de ', destaque: false },
      { texto: 'implantação', destaque: true },
      { texto: '.', destaque: false },
    ]);
  });
});
