/**
 * Disposição dos grafos calculada no build (d3-force com semente fixa), para que o SVG
 * seja determinístico, apareça sem JavaScript e não custe tempo no navegador.
 */
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { Grafo } from './grafo';

export type TipoAresta = 'explicita' | 'mencao';

export interface Aresta {
  a: string;
  b: string;
  tipo: TipoAresta;
}

export interface NoDisposto {
  slug: string;
  conceito: string;
  anexo: 'I' | 'II';
  grau: number;
  x: number;
  y: number;
  foco?: boolean;
}

export interface Disposicao {
  nos: NoDisposto[];
  arestas: Aresta[];
  /** viewBox: [x, y, largura, altura] */
  caixa: [number, number, number, number];
}

/** Pares não dirigidos; uma ligação explícita em qualquer sentido prevalece sobre uma menção. */
export function arestasDoGrafo(grafo: Grafo): Aresta[] {
  const pares = new Map<string, Aresta>();
  const juntar = (a: string, b: string, tipo: TipoAresta) => {
    const [x, y] = [a, b].sort() as [string, string];
    const chave = `${x}|${y}`;
    const existente = pares.get(chave);
    if (!existente || (existente.tipo === 'mencao' && tipo === 'explicita')) pares.set(chave, { a: x, b: y, tipo });
  };
  for (const [origem, alvos] of [...grafo.verTambem, ...grafo.ligacoesComentario]) {
    for (const alvo of alvos) juntar(origem, alvo, 'explicita');
  }
  for (const [origem, alvos] of grafo.menciona) {
    for (const alvo of alvos) juntar(origem, alvo, 'mencao');
  }
  return [...pares.values()].sort((p, q) => `${p.a}|${p.b}`.localeCompare(`${q.a}|${q.b}`));
}

/**
 * Vizinhança para o grafo local: todos os vizinhos diretos (explícitos e menções) e,
 * a partir destes, os vizinhos por ligações explícitas até `saltos` de distância.
 * (As menções a conceitos muito gerais, como «Edifício», trariam quase todo o anexo.)
 */
export function vizinhanca(arestas: Aresta[], slug: string, saltos = 2): Set<string> {
  const adj = (tipos: TipoAresta[]) => {
    const m = new Map<string, string[]>();
    for (const { a, b, tipo } of arestas) {
      if (!tipos.includes(tipo)) continue;
      m.set(a, [...(m.get(a) ?? []), b]);
      m.set(b, [...(m.get(b) ?? []), a]);
    }
    return m;
  };
  const todas = adj(['explicita', 'mencao']);
  const explicitas = adj(['explicita']);
  const vistos = new Set([slug]);
  let fronteira = [slug];
  for (let i = 0; i < saltos; i++) {
    const mapa = i === 0 ? todas : explicitas;
    fronteira = fronteira.flatMap((s) => mapa.get(s) ?? []).filter((s) => !vistos.has(s) && (vistos.add(s), true));
  }
  return vistos;
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
function aleatorio(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface NoSim extends SimulationNodeDatum {
  slug: string;
  anexo: 'I' | 'II';
}

export interface OpcoesDisposicao {
  /** Conceito em foco, fixado no centro (grafo local). */
  foco?: string;
  semente?: number;
  iteracoes?: number;
  /** Separa os anexos horizontalmente (grafo completo). */
  separarAnexos?: boolean;
}

export function dispor(grafo: Grafo, slugs: Iterable<string>, todas: Aresta[], opcoes: OpcoesDisposicao = {}): Disposicao {
  const { foco, semente = 2019, iteracoes = 400, separarAnexos = false } = opcoes;
  const conjunto = new Set(slugs);
  const ordenados = [...conjunto].sort();
  const arestas = todas.filter((e) => conjunto.has(e.a) && conjunto.has(e.b));
  const rnd = aleatorio(semente);

  const nos: NoSim[] = ordenados.map((slug, i) => {
    const c = grafo.porSlug.get(slug)!;
    const angulo = (i / ordenados.length) * Math.PI * 2;
    const raio = 120 + rnd() * 80;
    return {
      slug,
      anexo: c.anexo,
      x: Math.cos(angulo) * raio + (separarAnexos ? (c.anexo === 'I' ? -260 : 260) : 0),
      y: Math.sin(angulo) * raio,
      ...(slug === foco ? { fx: 0, fy: 0 } : {}),
    };
  });
  const ligacoes: SimulationLinkDatum<NoSim>[] = arestas.map((e) => ({ source: e.a, target: e.b }));

  const simulacao = forceSimulation(nos)
    .randomSource(rnd)
    .force(
      'ligacoes',
      forceLink<NoSim, SimulationLinkDatum<NoSim>>(ligacoes)
        .id((n) => n.slug)
        .distance(foco ? 80 : 70)
        .strength(0.5),
    )
    .force('repulsao', forceManyBody<NoSim>().strength(foco ? -320 : -220))
    .force('colisao', forceCollide<NoSim>(foco ? 26 : 16))
    .force('x', forceX<NoSim>((n) => (separarAnexos ? (n.anexo === 'I' ? -300 : 380) : 0)).strength(separarAnexos ? 0.08 : 0.05))
    .force('y', forceY<NoSim>(0).strength(separarAnexos ? 0.1 : 0.05))
    .stop();
  for (let i = 0; i < iteracoes; i++) simulacao.tick();

  const grau = new Map<string, number>();
  for (const e of arestas) {
    grau.set(e.a, (grau.get(e.a) ?? 0) + 1);
    grau.set(e.b, (grau.get(e.b) ?? 0) + 1);
  }
  const arred = (v: number) => Math.round(v * 10) / 10;
  const dispostos: NoDisposto[] = nos.map((n) => ({
    slug: n.slug,
    conceito: grafo.porSlug.get(n.slug)!.conceito,
    anexo: n.anexo,
    grau: grau.get(n.slug) ?? 0,
    x: arred(n.x!),
    y: arred(n.y!),
    ...(n.slug === foco ? { foco: true } : {}),
  }));

  const margem = foco ? 70 : 90;
  const xs = dispostos.map((n) => n.x);
  const ys = dispostos.map((n) => n.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return {
    nos: dispostos,
    arestas,
    caixa: [arred(x0 - margem), arred(y0 - margem / 2), arred(x1 - x0 + margem * 2), arred(y1 - y0 + margem)],
  };
}
