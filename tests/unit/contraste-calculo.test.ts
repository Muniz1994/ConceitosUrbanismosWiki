import { describe, expect, it } from 'vitest';
import { contraste, lerOklch, misturar, type Oklch } from '@/lib/contraste';

const cor = (v: string): Oklch => {
  const c = lerOklch(v);
  if (!c) throw new Error(`cor inválida: ${v}`);
  return c;
};

describe('lerOklch', () => {
  it('lê valores decimais e em percentagem', () => {
    expect(lerOklch('oklch(0.5106 0.2301 276.9656)')).toEqual({ l: 0.5106, c: 0.2301, h: 276.9656 });
    expect(lerOklch('oklch(51.06% 0.2301 276.9656)')?.l).toBeCloseTo(0.5106, 6);
  });

  it('rejeita outros formatos', () => {
    expect(lerOklch('#ffffff')).toBeUndefined();
    expect(lerOklch('hsl(0 0% 100%)')).toBeUndefined();
    expect(lerOklch('var(--x)')).toBeUndefined();
  });
});

describe('contraste', () => {
  it('branco contra preto = 21', () => {
    expect(contraste(cor('oklch(1 0 0)'), cor('oklch(0 0 0)'))).toBeCloseTo(21, 1);
  });

  it('Soft Pop claro: --ring sobre --background ≈ 1,88', () => {
    expect(contraste(cor('oklch(0.7853 0.1041 274.7134)'), cor('oklch(0.9789 0.0082 121.6272)'))).toBeCloseTo(1.88, 2);
  });

  it('Vintage Paper claro: primary-foreground sobre primary ≈ 3,73', () => {
    expect(contraste(cor('oklch(1.0000 0 0)'), cor('oklch(0.6180 0.0778 65.5444)'))).toBeCloseTo(3.73, 2);
  });
});

describe('misturar', () => {
  it('mistura nos extremos devolve as próprias cores', () => {
    const a = cor('oklch(0.7686 0.1647 70.0804)');
    const b = cor('oklch(0.9789 0.0082 121.6272)');
    expect(misturar(a, 1, b).l).toBeCloseTo(a.l, 6);
    expect(misturar(a, 0, b).l).toBeCloseTo(b.l, 6);
  });

  it('reproduz o Chrome: com oklch(0 0 0), a matiz 0 conta na interpolação', () => {
    // Medido no Chrome: color-mix(in oklch, oklch(0.879 0.1534 91.6054) 45%, oklch(0 0 0))
    // → oklch(0.39555 0.06903 41.2224) (Soft Pop escuro, item selecionado).
    const m = misturar(cor('oklch(0.8790 0.1534 91.6054)'), 0.45, cor('oklch(0 0 0)'));
    expect(m.l).toBeCloseTo(0.39555, 4);
    expect(m.c).toBeCloseTo(0.06903, 4);
    expect(m.h).toBeCloseTo(41.2224, 3);
  });

  it('interpola a matiz pelo caminho mais curto', () => {
    const m = misturar(cor('oklch(0.5 0.1 350)'), 0.5, cor('oklch(0.5 0.1 10)'));
    expect(m.h === 0 || m.h === 360 || Math.abs(m.h) < 1e-9).toBe(true);
  });
});
