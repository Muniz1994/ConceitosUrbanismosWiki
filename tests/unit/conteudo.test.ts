import { describe, expect, it } from 'vitest';
import { construirConceitos, type EntradaBruta } from '@/lib/conteudo';

const entrada = (ficheiro: string, conceito: string, ficha: string): EntradaBruta => ({
  ficheiro,
  dados: {
    conceito,
    anexo: ficha.startsWith('II') ? 'II' : 'I',
    ficha,
    definicao: 'Definição.',
    notas: [],
    ver_tambem: [],
    aliases: [],
    figuras: [],
  },
});

describe('construirConceitos', () => {
  it('calcula endereços e ordena por anexo e ficha', () => {
    const c = construirConceitos([
      entrada('b.md', 'RGB', 'II-24'),
      entrada('c.md', 'Recuo', 'I-57'),
      entrada('a.md', 'Afastamento', 'I-1'),
    ]);
    expect(c.map((x) => x.slug)).toEqual(['afastamento', 'recuo', 'rgb']);
  });

  it('falha com endereços duplicados, nomeando ambos os ficheiros', () => {
    expect(() =>
      construirConceitos([entrada('Pé-direito.md', 'Pé-direito', 'I-1'), entrada('Pe direito.md', 'Pé direito', 'I-2')]),
    ).toThrow(/Endereço duplicado «pe-direito»: Pé-direito\.md e Pe direito\.md/);
  });

  it('falha com fichas duplicadas', () => {
    expect(() => construirConceitos([entrada('a.md', 'A', 'I-1'), entrada('b.md', 'B', 'I-1')])).toThrow(
      /Ficha duplicada «I-1»/,
    );
  });
});

describe('validarFiguras', () => {
  it('falha com figura inexistente, nomeando o ficheiro e a figura', async () => {
    const { validarFiguras } = await import('@/lib/conteudo');
    const c = construirConceitos([{ ...entrada('Recuo.md', 'Recuo', 'I-57'), dados: { ...entrada('Recuo.md', 'Recuo', 'I-57').dados, figuras: ['figura-9'] } }]);
    expect(() => validarFiguras(c, ['figura-1a'])).toThrow('Figura inexistente «figura-9» em Recuo.md (campo figuras)');
  });
});
