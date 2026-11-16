import { describe, expect, it } from 'vitest';
import { arestasDoGrafo, dispor, vizinhanca } from '@/lib/disposicao';
import { construirGrafo } from '@/lib/grafo';
import { carregarConceitosReais } from './apoio/conteudo-real';

const grafo = construirGrafo(carregarConceitosReais());
const arestas = arestasDoGrafo(grafo);

describe('arestas', () => {
  it('a ligação explícita prevalece sobre a menção no mesmo par', () => {
    const par = arestas.find((e) => e.a === 'afastamento' && e.b === 'fachada')!;
    expect(par.tipo).toBe('explicita');
    expect(arestas.find((e) => e.a === 'afastamento' && e.b === 'edificio')!.tipo).toBe('mencao');
  });
});

describe('vizinhanca', () => {
  it('inclui o próprio conceito e vizinhos até duas ligações', () => {
    const v = vizinhanca(arestas, 'afastamento');
    expect(v.has('afastamento')).toBe(true);
    expect(v.has('fachada')).toBe(true);
    expect(vizinhanca(arestas, 'rgb')).toEqual(new Set(['rgb']));
  });
});

describe('dispor', () => {
  it('é determinística: duas execuções dão posições idênticas', () => {
    const todos = grafo.conceitos.map((c) => c.slug);
    const a = dispor(grafo, todos, arestas, { separarAnexos: true });
    const b = dispor(grafo, todos, arestas, { separarAnexos: true });
    expect(a).toEqual(b);
    expect(a.nos).toHaveLength(101);
  });

  it('fixa o conceito em foco no centro', () => {
    const d = dispor(grafo, vizinhanca(arestas, 'afastamento'), arestas, { foco: 'afastamento' });
    expect(d.nos.find((n) => n.foco)).toMatchObject({ slug: 'afastamento', x: 0, y: 0 });
  });
});
