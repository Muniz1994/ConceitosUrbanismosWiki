/**
 * Contraste mínimo de cada paleta, em cada modo, com a camada do site aplicada.
 * Uma paleta que falhe aqui faz falhar `npm run ci` e não é publicada.
 */
import { describe, expect, it } from 'vitest';
import { IDS_PALETAS } from '@/lib/aparencia';
import { contraste, lerOklch, misturar, type Oklch } from '@/lib/contraste';
import { camadaSite, variaveisPaleta, type Modo } from './apoio/paletas';

const site = camadaSite();

/** Pares a verificar: descrição, cor do texto ou elemento, cor de fundo, mínimo. */
type Par = { nome: string; a: string; b: string; minimo: number };
const PARES: Par[] = ([
  ['foreground/background', 'foreground', 'background', 7],
  ['muted-foreground/background', 'muted-foreground', 'background', 4.5],
  ['primary-foreground/primary', 'primary-foreground', 'primary', 4.5],
  ['foreground/passar', 'foreground', '@passar', 4.5],
  // Superfícies com texto secundário também mudam de cor ao passar o cursor (p. ex. cartões da página inicial).
  ['muted-foreground/passar', 'muted-foreground', '@passar', 4.5],
  ['foreground/selecionado', 'foreground', '@selecionado', 4.5],
  ['foco/background', '@foco', 'background', 3],
  ['anexo-i/background', 'anexo-i', 'background', 3],
  ['anexo-ii/background', 'anexo-ii', 'background', 3],
  ['anexo-i/card', 'anexo-i', 'card', 3],
  ['anexo-ii/card', 'anexo-ii', 'card', 3],
] as const).map(([nome, a, b, minimo]) => ({ nome, a, b, minimo }));

function resolver(id: (typeof IDS_PALETAS)[number], modo: Modo) {
  const vars = { ...site.anexosClaro, ...(modo === 'escuro' ? site.anexosEscuro : {}), ...variaveisPaleta(id, modo) };
  const cor = (nome: string): Oklch => {
    const valor = vars[nome];
    if (valor === undefined) throw new Error(`${id} (${modo}): falta --${nome}`);
    const c = lerOklch(valor);
    if (!c) throw new Error(`${id} (${modo}): --${nome} tem de estar em oklch(), mas é «${valor}»`);
    return c;
  };
  const mistura = (m: typeof site.passar) => misturar(cor(m.cor), m.percentagem, cor(m.fundo));
  return (nome: string): Oklch => {
    if (nome === '@passar') return mistura(site.passar);
    if (nome === '@selecionado') return mistura(site.selecionado);
    if (nome === '@foco') return cor(site.foco);
    return cor(nome);
  };
}

describe('contraste das paletas', () => {
  for (const id of IDS_PALETAS) {
    for (const modo of ['claro', 'escuro'] as const) {
      describe(`${id} (${modo})`, () => {
        const cor = resolver(id, modo);
        it.each(PARES)('$nome ≥ $minimo:1', ({ nome, a, b, minimo }) => {
          const razao = contraste(cor(a), cor(b));
          expect(razao, `${id}, modo ${modo}, ${nome}: ${razao.toFixed(2)}:1 (mínimo ${minimo}:1)`).toBeGreaterThanOrEqual(minimo);
        });
      });
    }
  }
});
