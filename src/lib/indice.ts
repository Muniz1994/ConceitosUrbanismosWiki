import type { Conceito } from './conteudo';
import { compararPt, letraInicial } from './texto';

export interface GrupoLetra {
  letra: string;
  conceitos: Conceito[];
}

/** Ordena alfabeticamente (regras portuguesas) e agrupa pela letra inicial sem acentos. */
export function agruparPorLetra(conceitos: Conceito[]): GrupoLetra[] {
  const grupos = new Map<string, Conceito[]>();
  for (const c of [...conceitos].sort((a, b) => compararPt(a.conceito, b.conceito))) {
    const letra = letraInicial(c.conceito);
    grupos.set(letra, [...(grupos.get(letra) ?? []), c]);
  }
  return [...grupos].map(([letra, lista]) => ({ letra, conceitos: lista }));
}

/** Início da definição, cortado numa fronteira de palavra. */
export function resumo(texto: string, maximo = 160): string {
  if (texto.length <= maximo) return texto;
  const corte = texto.slice(0, maximo);
  return `${corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:.]$/, '')}…`;
}
