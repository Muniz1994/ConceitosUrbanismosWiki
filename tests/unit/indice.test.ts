import { describe, expect, it } from 'vitest';
import { agruparPorLetra, resumo } from '@/lib/indice';
import { carregarConceitosReais } from './apoio/conteudo-real';

describe('agruparPorLetra', () => {
  const grupos = agruparPorLetra(carregarConceitosReais());

  it('coloca nomes acentuados com a letra base, por ordem portuguesa', () => {
    const a = grupos.find((g) => g.letra === 'A')!.conceitos.map((c) => c.conceito);
    expect(a).toContain('Área de construção do edifício');
    const i = (nome: string) => a.indexOf(nome);
    expect(i('Altura entre pisos')).toBeLessThan(i('Área total de construção'));
    expect(i('Área total de construção')).toBeLessThan(i('Atualização cartográfica'));
    expect(grupos.some((g) => g.letra === 'Á')).toBe(false);
  });

  it('inclui todos os conceitos uma vez, com letras por ordem', () => {
    expect(grupos.flatMap((g) => g.conceitos)).toHaveLength(101);
    const letras = grupos.map((g) => g.letra);
    expect(letras).toEqual([...letras].sort());
  });
});

describe('resumo', () => {
  it('corta numa fronteira de palavra', () => {
    expect(resumo('O afastamento é a distância entre a fachada', 20)).toBe('O afastamento é a…');
    expect(resumo('Curto.', 20)).toBe('Curto.');
  });
});
