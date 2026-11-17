import { describe, expect, it } from 'vitest';
import { IDS_PALETAS, lerModo, lerPaleta, PALETA_PREDEFINIDA } from '@/lib/aparencia';

describe('lerPaleta', () => {
  it('aceita as quatro paletas', () => {
    expect(IDS_PALETAS).toEqual(['soft-pop', 'vercel', 'nature', 'vintage-paper']);
    for (const id of IDS_PALETAS) expect(lerPaleta(id)).toBe(id);
  });

  it('valores desconhecidos, vazios ou ausentes dão Soft Pop', () => {
    expect(PALETA_PREDEFINIDA).toBe('soft-pop');
    expect(lerPaleta('cyberpunk')).toBe('soft-pop');
    expect(lerPaleta('')).toBe('soft-pop');
    expect(lerPaleta(null)).toBe('soft-pop');
    expect(lerPaleta(undefined)).toBe('soft-pop');
  });
});

describe('lerModo', () => {
  it('valores desconhecidos dão «sistema»', () => {
    expect(lerModo('escuro')).toBe('escuro');
    expect(lerModo('dark')).toBe('sistema');
    expect(lerModo(null)).toBe('sistema');
  });
});
