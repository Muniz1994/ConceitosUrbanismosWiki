/**
 * Grafo de ligações entre conceitos, calculado uma vez no build.
 * Todas as páginas, a pesquisa e os grafos leem daqui, para que as vistas coincidam.
 */
import { ErroConteudo, type Conceito } from './conteudo';
import { detetarOcorrencias, prepararAlvos, primeiraDeCada } from './mencoes';
import type { Intervalo } from './segmentos';
import { compararPt, desembrulharWikilink, extrairWikilinks, normalizar } from './texto';

export type IndiceNomes = Map<string, Conceito[]>;

/** Índice de nomes e aliases pela forma normalizada (sem acentos, maiúsculas ou pontuação). */
export function criarIndiceNomes(conceitos: Conceito[]): IndiceNomes {
  const indice: IndiceNomes = new Map();
  for (const c of conceitos) {
    for (const nome of new Set([c.conceito, ...c.aliases].map(normalizar))) {
      const lista = indice.get(nome) ?? [];
      if (!lista.includes(c)) lista.push(c);
      indice.set(nome, lista);
    }
  }
  return indice;
}

/**
 * Resolve uma referência (nome ou alias, com ou sem `[[...]]`) para um conceito.
 * Lança ErroConteudo se não existir ou se for ambígua.
 */
export function resolverReferencia(indice: IndiceNomes, referencia: string, origem: string): Conceito {
  const nome = desembrulharWikilink(referencia);
  const candidatos = indice.get(normalizar(nome)) ?? [];
  if (candidatos.length === 0) {
    throw new ErroConteudo(`Referência não resolvida «${nome}» em ${origem}`);
  }
  if (candidatos.length > 1) {
    const nomes = candidatos.map((c) => `«${c.conceito}»`).join(', ');
    throw new ErroConteudo(`Referência ambígua «${nome}» em ${origem}: corresponde a ${nomes}`);
  }
  return candidatos[0]!;
}

export interface Grafo {
  conceitos: Conceito[];
  porSlug: Map<string, Conceito>;
  indice: IndiceNomes;
  /** «Ver também» oficial, pela ordem da fonte. */
  verTambem: Map<string, string[]>;
  /** Ligações `[[...]]` no comentário pessoal. */
  ligacoesComentario: Map<string, string[]>;
  /** Inverso de todas as ligações explícitas, por ordem alfabética. */
  referidoPor: Map<string, string[]>;
  /** Todas as ocorrências de nomes de outros conceitos no texto oficial, por secção. */
  ocorrencias: Map<string, { definicao: Intervalo[]; notas: Intervalo[][] }>;
  /** Menções derivadas (exclui os alvos do «ver também» do próprio conceito), por ordem alfabética. */
  menciona: Map<string, string[]>;
  /** Inverso de `menciona`, por ordem alfabética. */
  mencionadoEm: Map<string, string[]>;
}

const unicos = (lista: string[]) => [...new Set(lista)];

/** Constrói o grafo de ligações explícitas, juntando todos os erros de referência numa só mensagem. */
export function construirGrafo(conceitos: Conceito[]): Grafo {
  const indice = criarIndiceNomes(conceitos);
  const porSlug = new Map(conceitos.map((c) => [c.slug, c]));
  const erros: string[] = [];

  const resolverTodas = (c: Conceito, refs: string[], campo: string) =>
    unicos(
      refs.flatMap((r) => {
        try {
          const alvo = resolverReferencia(indice, r, `${c.ficheiro} (${campo})`);
          return alvo.slug === c.slug ? [] : [alvo.slug];
        } catch (e) {
          erros.push((e as Error).message);
          return [];
        }
      }),
    );

  const verTambem = new Map<string, string[]>();
  const ligacoesComentario = new Map<string, string[]>();
  for (const c of conceitos) {
    verTambem.set(c.slug, resolverTodas(c, c.ver_tambem, 'ver_tambem'));
    ligacoesComentario.set(
      c.slug,
      resolverTodas(c, extrairWikilinks(c.comentario).map((l) => l.alvo), 'comentário'),
    );
  }
  if (erros.length) throw new ErroConteudo(erros.join('\n'));

  const referidoPor = new Map<string, string[]>(conceitos.map((c) => [c.slug, []]));
  for (const c of conceitos) {
    for (const alvo of unicos([...verTambem.get(c.slug)!, ...ligacoesComentario.get(c.slug)!])) {
      referidoPor.get(alvo)!.push(c.slug);
    }
  }
  const nomeDe = (slug: string) => porSlug.get(slug)!.conceito;
  for (const lista of referidoPor.values()) lista.sort((a, b) => compararPt(nomeDe(a), nomeDe(b)));

  // Menções derivadas do texto oficial (definição e notas). As abreviaturas não contam.
  const alvos = prepararAlvos(conceitos.flatMap((c) => [c.conceito, ...c.aliases].map((nome) => ({ nome, slug: c.slug }))));
  const ocorrencias = new Map<string, { definicao: Intervalo[]; notas: Intervalo[][] }>();
  const menciona = new Map<string, string[]>();
  const mencionadoEm = new Map<string, string[]>(conceitos.map((c) => [c.slug, []]));
  for (const c of conceitos) {
    const seccoes = {
      definicao: detetarOcorrencias(c.definicao, alvos, c.slug),
      notas: c.notas.map((n) => detetarOcorrencias(n, alvos, c.slug)),
    };
    ocorrencias.set(c.slug, seccoes);
    const oficiais = new Set(verTambem.get(c.slug));
    const mencionados = unicos([...seccoes.definicao, ...seccoes.notas.flat()].map((o) => o.slug)).filter(
      (s) => !oficiais.has(s),
    );
    menciona.set(c.slug, mencionados.sort((a, b) => compararPt(nomeDe(a), nomeDe(b))));
    for (const alvo of mencionados) mencionadoEm.get(alvo)!.push(c.slug);
  }
  for (const lista of mencionadoEm.values()) lista.sort((a, b) => compararPt(nomeDe(a), nomeDe(b)));

  return { conceitos, porSlug, indice, verTambem, ligacoesComentario, referidoPor, ocorrencias, menciona, mencionadoEm };
}

/** Pares únicos (não dirigidos) de ligações explícitas. */
export function arestasExplicitas(grafo: Grafo): Array<[string, string]> {
  const vistos = new Set<string>();
  const arestas: Array<[string, string]> = [];
  for (const [origem, alvos] of [...grafo.verTambem, ...grafo.ligacoesComentario]) {
    for (const alvo of alvos) {
      const chave = [origem, alvo].sort().join('|');
      if (!vistos.has(chave)) {
        vistos.add(chave);
        arestas.push([origem, alvo]);
      }
    }
  }
  return arestas;
}

/**
 * Intervalos a ligar no texto oficial de um conceito: a primeira ocorrência de cada conceito
 * na definição, e a primeira ocorrência de cada conceito no conjunto das notas.
 */
export function ligacoesNoTexto(grafo: Grafo, slug: string): { definicao: Intervalo[]; notas: Intervalo[][] } {
  const oc = grafo.ocorrencias.get(slug)!;
  const vistosNotas = new Set<string>();
  return {
    definicao: primeiraDeCada(oc.definicao),
    notas: oc.notas.map((lista) => lista.filter((o) => (vistosNotas.has(o.slug) ? false : (vistosNotas.add(o.slug), true)))),
  };
}
