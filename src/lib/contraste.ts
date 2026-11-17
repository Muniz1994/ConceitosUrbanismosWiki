/**
 * Cálculo de contraste WCAG a partir de cores oklch, usado para verificar as paletas.
 * Implementa o mesmo `color-mix(in oklch, …)` que o CSS usa na camada do site.
 */

/** Cor oklch: luminosidade (0–1), croma e matiz (graus). */
export type Oklch = { l: number; c: number; h: number };

/** Lê `oklch(L C H)` ou `oklch(L% C H)`. Devolve `undefined` para qualquer outro formato. */
export function lerOklch(valor: string): Oklch | undefined {
  const m = /^\s*oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)\s*$/i.exec(valor);
  if (!m) return undefined;
  const l = Number(m[1]) / (m[2] ? 100 : 1);
  return { l, c: Number(m[3]), h: Number(m[4]) };
}

/** Converte oklch em sRGB linear (cada canal limitado a 0–1). */
export function paraSrgbLinear({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb: [number, number, number] = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return rgb.map((v) => Math.min(1, Math.max(0, v))) as [number, number, number];
}

/** Luminância relativa (WCAG). */
export function luminancia(cor: Oklch): number {
  const [r, g, b] = paraSrgbLinear(cor);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores (1–21). */
export function contraste(a: Oklch, b: Oklch): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Equivalente a `color-mix(in oklch, a p%, b)`: interpola L, C e a matiz pelo caminho mais curto.
 * Como no navegador, uma matiz escrita explicitamente conta mesmo num cinzento: misturar com
 * `oklch(0 0 0)` puxa a matiz para 0 (só `none` seria ignorado, e as paletas não o usam).
 */
export function misturar(a: Oklch, p: number, b: Oklch): Oklch {
  const ha = a.h;
  const hb = b.h;
  let d = hb - ha;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  const h = (((ha + d * (1 - p)) % 360) + 360) % 360;
  return { l: a.l * p + b.l * (1 - p), c: a.c * p + b.c * (1 - p), h };
}
