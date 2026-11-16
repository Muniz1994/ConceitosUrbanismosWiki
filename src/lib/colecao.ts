/**
 * Ponto único de acesso ao conteúdo durante o build. Carrega as coleções uma vez
 * e devolve conceitos validados (os erros fazem falhar o build).
 */
import { getCollection } from 'astro:content';
import path from 'node:path';
import { construirConceitos, validarFiguras, type Conceito } from './conteudo';
import { arestasDoGrafo, dispor, vizinhanca, type Aresta, type Disposicao } from './disposicao';
import { construirGrafo, type Grafo } from './grafo';

let cache: Promise<Conceito[]> | undefined;

export function carregarConceitos(): Promise<Conceito[]> {
  cache ??= (async () => {
    const [entradas, figuras] = await Promise.all([getCollection('conceitos'), getCollection('figuras')]);
    const conceitos = construirConceitos(
      entradas.map((e) => ({
        ficheiro: e.filePath ? path.normalize(e.filePath) : e.id,
        dados: e.data,
        corpo: e.body,
        corpoHtml: e.rendered?.html,
      })),
    );
    validarFiguras(conceitos, figuras.map((f) => f.id));
    return conceitos;
  })();
  return cache;
}

let cacheGrafo: Promise<Grafo> | undefined;

/** Conceitos e ligações resolvidas; referências inválidas fazem falhar o build. */
export function carregarGrafo(): Promise<Grafo> {
  cacheGrafo ??= carregarConceitos().then(construirGrafo);
  return cacheGrafo;
}

let cacheArestas: Promise<Aresta[]> | undefined;
let cacheCompleto: Promise<Disposicao> | undefined;

/** Arestas não dirigidas (explícitas e menções), calculadas uma vez. */
export function carregarArestas(): Promise<Aresta[]> {
  cacheArestas ??= carregarGrafo().then(arestasDoGrafo);
  return cacheArestas;
}

/** Disposição do grafo completo (todos os conceitos). */
export function carregarGrafoCompleto(): Promise<Disposicao> {
  cacheCompleto ??= Promise.all([carregarGrafo(), carregarArestas()]).then(([g, a]) =>
    dispor(g, g.conceitos.map((c) => c.slug), a, { separarAnexos: true }),
  );
  return cacheCompleto;
}

/** Disposição do grafo local de um conceito (vizinhos até duas ligações). */
export async function carregarGrafoLocal(slug: string): Promise<Disposicao> {
  const [g, a] = await Promise.all([carregarGrafo(), carregarArestas()]);
  return dispor(g, vizinhanca(a, slug, 2), a, { foco: slug });
}
