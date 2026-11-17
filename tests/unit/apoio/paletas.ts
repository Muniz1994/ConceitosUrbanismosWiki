/**
 * Lê as paletas (src/styles/paletas/*.css) e a camada do site (src/styles/global.css)
 * e resolve as cores efetivas de cada paleta em cada modo, como o navegador as resolveria.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Paleta } from '@/lib/aparencia';

const ESTILOS = path.resolve(__dirname, '../../../src/styles');

type Bloco = { seletor: string; vars: Record<string, string> };

/** Blocos `seletor { --var: valor; … }` de primeiro nível (os ficheiros de paleta não têm aninhamento). */
function lerBlocos(css: string): Bloco[] {
  const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...semComentarios.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    seletor: m[1]!.trim().replace(/\s+/g, ' '),
    vars: Object.fromEntries([...m[2]!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((v) => [v[1]!, v[2]!.trim()])),
  }));
}

export type Modo = 'claro' | 'escuro';

/**
 * Variáveis efetivas de uma paleta: no modo claro, os blocos `[data-paleta='x']` por ordem
 * (as correções vêm depois e ganham); no escuro, os mesmos e depois os blocos `.dark…`, mais específicos.
 */
export function variaveisPaleta(id: Paleta, modo: Modo): Record<string, string> {
  const blocos = lerBlocos(readFileSync(path.join(ESTILOS, 'paletas', `${id}.css`), 'utf8'));
  const claro = `[data-paleta='${id}']`;
  const vars: Record<string, string> = {};
  for (const b of blocos) if (b.seletor === claro) Object.assign(vars, b.vars);
  if (modo === 'escuro') for (const b of blocos) if (b.seletor.startsWith('.dark')) Object.assign(vars, b.vars);
  return vars;
}

/** Camada do site em global.css: misturas do destaque, cor do foco e cores dos anexos por omissão. */
export function camadaSite() {
  const css = readFileSync(path.join(ESTILOS, 'global.css'), 'utf8');
  const mistura = (nome: string) => {
    const m = new RegExp(`--${nome}:\\s*color-mix\\(in oklch, var\\(--([\\w-]+)\\) (\\d+)%, var\\(--([\\w-]+)\\)\\)`).exec(css);
    if (!m) throw new Error(`global.css: não encontrei a mistura --${nome}`);
    return { cor: m[1]!, percentagem: Number(m[2]) / 100, fundo: m[3]! };
  };
  const foco = /--foco:\s*var\(--([\w-]+)\)/.exec(css)?.[1];
  if (!foco) throw new Error('global.css: não encontrei --foco');
  const blocos = lerBlocos(css);
  const anexos = (seletor: string) => blocos.find((b) => b.seletor === seletor)?.vars ?? {};
  return {
    passar: mistura('color-accent'),
    selecionado: mistura('color-selecionado'),
    foco,
    anexosClaro: anexos(':where(:root)'),
    anexosEscuro: anexos(':where(.dark)'),
  };
}
