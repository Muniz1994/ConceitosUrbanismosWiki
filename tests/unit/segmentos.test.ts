import { describe, expect, it } from 'vitest';
import { segmentarTexto } from '@/lib/segmentos';

const juntar = (s: ReturnType<typeof segmentarTexto>) => s.map((x) => x.texto).join('');

describe('segmentarTexto', () => {
  it('liga «Figura 1» à subfigura do conceito', () => {
    const s = segmentarTexto('Ver Figura 1.', { figuras: ['figura-1a'] });
    expect(s).toEqual([
      { tipo: 'texto', texto: 'Ver ' },
      { tipo: 'figura', texto: 'Figura 1', figura: 'figura-1a' },
      { tipo: 'texto', texto: '.' },
    ]);
  });

  it('liga «Figura 4a» à figura exata', () => {
    const s = segmentarTexto('Ver Figura 4a.', { figuras: ['figura-1b', 'figura-4a'] });
    expect(s.find((x) => x.tipo === 'figura')).toMatchObject({ figura: 'figura-4a' });
  });

  it('deixa como texto uma figura que o conceito não tem', () => {
    expect(segmentarTexto('Ver Figura 2.', { figuras: ['figura-1a'] })).toEqual([{ tipo: 'texto', texto: 'Ver Figura 2.' }]);
  });

  it('inclui menções e nunca altera o texto', () => {
    const texto = 'Distância entre a fachada e o edifício. Ver Figura 3.';
    const s = segmentarTexto(texto, {
      figuras: ['figura-3a', 'figura-3b'],
      mencoes: [{ inicio: 18, fim: 25, slug: 'fachada' }],
    });
    expect(juntar(s)).toBe(texto);
    expect(s.filter((x) => x.tipo !== 'texto').map((x) => x.tipo)).toEqual(['conceito', 'figura']);
  });
});
