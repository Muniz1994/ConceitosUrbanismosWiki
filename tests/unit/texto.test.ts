import { describe, expect, it } from 'vitest';
import {
  compararPt,
  desembrulharWikilink,
  extrairWikilinks,
  formatarUnidades,
  letraInicial,
  normalizar,
  slugify,
} from '@/lib/texto';

describe('slugify', () => {
  it('remove acentos e separa palavras com hífen', () => {
    expect(slugify('Área de implantação do edifício')).toBe('area-de-implantacao-do-edificio');
  });
  it('trata parênteses e pontuação', () => {
    expect(slugify('Piso (de um edifício)')).toBe('piso-de-um-edificio');
    expect(slugify('Pé-direito')).toBe('pe-direito');
    expect(slugify('Catálogo de objetos, Modelo de dados')).toBe('catalogo-de-objetos-modelo-de-dados');
  });
});

describe('normalizar', () => {
  it('ignora maiúsculas, acentos e pontuação', () => {
    expect(normalizar('Altura da Edificação')).toBe(normalizar('Altura da edificação'));
    expect(normalizar('Pé direito')).toBe(normalizar('Pé-direito'));
  });
});

describe('formatarUnidades', () => {
  it.each([
    ['[m]', 'm'],
    ['[m2]', 'm²'],
    ['[m3]', 'm³'],
    ['[m3/m2]', 'm³/m²'],
    ['[%]', '%'],
    ['[graus]', 'graus'],
    ['adimensional', 'adimensional'],
    ['[m2]; [km2]; [ha]', 'm², km², ha'],
  ])('%s → %s', (bruto, esperado) => {
    expect(formatarUnidades(bruto)).toBe(esperado);
  });
});

describe('wikilinks', () => {
  it('extrai alvo, rótulo e posições', () => {
    const texto = 'Comparar com [[Recuo]] e [[Piso (de um edifício)|pisos]].';
    const ligacoes = extrairWikilinks(texto);
    expect(ligacoes.map((l) => [l.alvo, l.rotulo])).toEqual([
      ['Recuo', 'Recuo'],
      ['Piso (de um edifício)', 'pisos'],
    ]);
    expect(texto.slice(ligacoes[0]!.inicio, ligacoes[0]!.fim)).toBe('[[Recuo]]');
  });
  it('desembrulha valores de cabeçalho', () => {
    expect(desembrulharWikilink('[[Recuo]]')).toBe('Recuo');
    expect(desembrulharWikilink(' Recuo ')).toBe('Recuo');
  });
});

describe('ordenação portuguesa', () => {
  it('agrupa acentos com a letra base', () => {
    const nomes = ['Atualização cartográfica', 'Área total de construção', 'Altura entre pisos'];
    expect([...nomes].sort(compararPt)).toEqual([
      'Altura entre pisos',
      'Área total de construção',
      'Atualização cartográfica',
    ]);
    expect(letraInicial('Área')).toBe('A');
    expect(letraInicial('Índice')).toBe('I');
  });
});
