/**
 * Aparência do site: modo (claro, escuro, sistema) e paleta.
 * Fonte única da lista de paletas, usada pelo script inline em Base.astro,
 * pelo componente «Aparência» e pelo teste de contraste.
 */

export type Modo = 'claro' | 'escuro' | 'sistema';
export const MODOS: readonly Modo[] = ['claro', 'escuro', 'sistema'];
export const MODO_PREDEFINIDO: Modo = 'sistema';

/** Paletas disponíveis, pela ordem em que aparecem no seletor. O `id` é o nome do tema no tweakcn. */
export const PALETAS = [
  { id: 'soft-pop', nome: 'Soft Pop' },
  { id: 'vercel', nome: 'Vercel' },
  { id: 'nature', nome: 'Nature' },
  { id: 'vintage-paper', nome: 'Vintage Paper' },
] as const;

export type Paleta = (typeof PALETAS)[number]['id'];
export const PALETA_PREDEFINIDA: Paleta = 'soft-pop';
export const IDS_PALETAS: readonly Paleta[] = PALETAS.map((p) => p.id);

/** Chaves em localStorage. */
export const CHAVE_MODO = 'tema';
export const CHAVE_PALETA = 'paleta';

/** Converte um valor guardado numa paleta válida; qualquer outro valor dá a predefinida. */
export function lerPaleta(valor: string | null | undefined): Paleta {
  return (IDS_PALETAS as readonly string[]).includes(valor ?? '') ? (valor as Paleta) : PALETA_PREDEFINIDA;
}

/** Converte um valor guardado num modo válido; qualquer outro valor dá o predefinido. */
export function lerModo(valor: string | null | undefined): Modo {
  return (MODOS as readonly string[]).includes(valor ?? '') ? (valor as Modo) : MODO_PREDEFINIDO;
}
