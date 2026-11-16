/**
 * Divide o texto oficial (definição ou nota) em segmentos para apresentação:
 * texto simples, ligações a figuras («Ver Figura 1») e ligações a conceitos mencionados.
 * O texto em si nunca é alterado: a concatenação dos segmentos é igual ao original.
 */

export type Segmento =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'figura'; texto: string; figura: string }
  | { tipo: 'conceito'; texto: string; slug: string };

export interface Intervalo {
  inicio: number;
  fim: number;
  slug: string;
}

/** Resolve «Figura N» / «Figura Nx» para uma das figuras do conceito. */
export function resolverFigura(numero: string, letra: string, figurasDoConceito: string[]): string | undefined {
  if (letra) {
    const exata = `figura-${numero}${letra}`;
    return figurasDoConceito.includes(exata) ? exata : undefined;
  }
  return figurasDoConceito.find((f) => f === `figura-${numero}` || new RegExp(`^figura-${numero}[a-z]$`).test(f));
}

export function segmentarTexto(
  texto: string,
  { figuras = [], mencoes = [] }: { figuras?: string[]; mencoes?: Intervalo[] } = {},
): Segmento[] {
  type Marca = { inicio: number; fim: number; segmento: Segmento };
  const marcas: Marca[] = [];

  for (const m of texto.matchAll(/Figura\s+(\d+)\s?([a-z])?\b/g)) {
    const figura = resolverFigura(m[1]!, m[2] ?? '', figuras);
    if (figura) {
      marcas.push({ inicio: m.index!, fim: m.index! + m[0].length, segmento: { tipo: 'figura', texto: m[0], figura } });
    }
  }
  for (const i of mencoes) {
    marcas.push({ inicio: i.inicio, fim: i.fim, segmento: { tipo: 'conceito', texto: texto.slice(i.inicio, i.fim), slug: i.slug } });
  }

  marcas.sort((a, b) => a.inicio - b.inicio);
  const segmentos: Segmento[] = [];
  let posicao = 0;
  for (const marca of marcas) {
    if (marca.inicio < posicao) continue; // sobreposição: mantém a primeira
    if (marca.inicio > posicao) segmentos.push({ tipo: 'texto', texto: texto.slice(posicao, marca.inicio) });
    segmentos.push(marca.segmento);
    posicao = marca.fim;
  }
  if (posicao < texto.length) segmentos.push({ tipo: 'texto', texto: texto.slice(posicao) });
  return segmentos;
}
