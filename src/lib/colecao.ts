/**
 * Ponto único de acesso ao conteúdo durante o build. Carrega as coleções uma vez
 * e devolve conceitos validados (os erros fazem falhar o build).
 */
import { getCollection } from 'astro:content';
import path from 'node:path';
import { construirConceitos, validarFiguras, type Conceito } from './conteudo';
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
