/**
 * Modelo de conceito usado pelo resto do site, e validações que envolvem
 * vários ficheiros (fichas e endereços duplicados). Puro: não importa `astro:content`.
 */
import { slugify } from './texto';

export type Anexo = 'I' | 'II';

export interface Conceito {
  slug: string;
  /** Caminho do ficheiro de conteúdo, relativo à raiz do projeto. */
  ficheiro: string;
  conceito: string;
  anexo: Anexo;
  ficha: string;
  /** Número da ficha dentro do anexo, para ordenação. */
  numero: number;
  abreviatura?: string;
  unidades?: string;
  definicao: string;
  notas: string[];
  ver_tambem: string[];
  aliases: string[];
  figuras: string[];
  /** Corpo Markdown (comentário pessoal), possivelmente vazio. */
  comentario: string;
}

export class ErroConteudo extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroConteudo';
  }
}

export interface EntradaBruta {
  ficheiro: string;
  dados: {
    conceito: string;
    anexo: Anexo;
    ficha: string;
    abreviatura?: string;
    unidades?: string;
    definicao: string;
    notas: string[];
    ver_tambem: string[];
    aliases: string[];
    figuras: string[];
  };
  corpo?: string;
}

/** Converte as entradas validadas pelo esquema em conceitos e verifica duplicados. */
export function construirConceitos(entradas: EntradaBruta[]): Conceito[] {
  const porSlug = new Map<string, string>();
  const porFicha = new Map<string, string>();
  const erros: string[] = [];

  const conceitos = entradas.map(({ ficheiro, dados, corpo }) => {
    const slug = slugify(dados.conceito);
    const outroSlug = porSlug.get(slug);
    if (outroSlug) {
      erros.push(`Endereço duplicado «${slug}»: ${outroSlug} e ${ficheiro}`);
    } else {
      porSlug.set(slug, ficheiro);
    }
    const outraFicha = porFicha.get(dados.ficha);
    if (outraFicha) {
      erros.push(`Ficha duplicada «${dados.ficha}» (campo ficha): ${outraFicha} e ${ficheiro}`);
    } else {
      porFicha.set(dados.ficha, ficheiro);
    }
    return {
      ...dados,
      slug,
      ficheiro,
      numero: Number(dados.ficha.split('-')[1]),
      comentario: (corpo ?? '').trim(),
    } satisfies Conceito;
  });

  if (erros.length) throw new ErroConteudo(erros.join('\n'));
  return conceitos.sort(compararFichas);
}

/** Ordem das fichas: Anexo I antes do II, depois pelo número. */
export function compararFichas(a: Pick<Conceito, 'anexo' | 'numero'>, b: Pick<Conceito, 'anexo' | 'numero'>): number {
  return a.anexo === b.anexo ? a.numero - b.numero : a.anexo === 'I' ? -1 : 1;
}
