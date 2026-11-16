import { describe, expect, it } from 'vitest';
import { construirConceitos, type EntradaBruta } from '@/lib/conteudo';
import { construirGrafo, criarIndiceNomes, resolverReferencia } from '@/lib/grafo';

let n = 0;
const entrada = (conceito: string, extra: Partial<EntradaBruta['dados']> = {}, corpo = ''): EntradaBruta => ({
  ficheiro: `${conceito}.md`,
  dados: {
    conceito,
    anexo: 'I',
    ficha: `I-${++n}`,
    definicao: 'Definição.',
    notas: [],
    ver_tambem: [],
    aliases: [],
    figuras: [],
    ...extra,
  },
  corpo,
});

const base = () =>
  construirConceitos([
    entrada('Piso (de um edifício)', { aliases: ['Piso', 'Piso ou pavimento'] }),
    entrada('Altura da edificação'),
    entrada('Recuo'),
    entrada('Afastamento', { ver_tambem: ['[[Recuo]]', '[[Altura da Edificação]]', '[[Piso]]'] }, 'Ver [[Recuo]].'),
  ]);

describe('resolverReferencia', () => {
  const conceitos = base();
  const indice = criarIndiceNomes(conceitos);

  it('resolve por alias', () => {
    expect(resolverReferencia(indice, 'Piso', 'x').conceito).toBe('Piso (de um edifício)');
    expect(resolverReferencia(indice, '[[Piso ou pavimento]]', 'x').conceito).toBe('Piso (de um edifício)');
  });

  it('ignora diferenças de maiúsculas e acentos', () => {
    expect(resolverReferencia(indice, 'Altura da Edificação', 'x').conceito).toBe('Altura da edificação');
    expect(resolverReferencia(indice, 'altura da edificacao', 'x').conceito).toBe('Altura da edificação');
  });

  it('falha com referência desconhecida, nomeando a origem', () => {
    expect(() => resolverReferencia(indice, '[[Conceito inexistente]]', 'Recuo.md (comentário)')).toThrow(
      'Referência não resolvida «Conceito inexistente» em Recuo.md (comentário)',
    );
  });

  it('falha com alias ambíguo', () => {
    const ambiguo = criarIndiceNomes(
      construirConceitos([entrada('Fachada', { aliases: ['Frente'] }), entrada('Frente do prédio', { aliases: ['Frente'] })]),
    );
    expect(() => resolverReferencia(ambiguo, 'Frente', 'x.md')).toThrow(/Referência ambígua «Frente».*«Fachada».*«Frente do prédio»/);
  });
});

describe('construirGrafo', () => {
  it('liga «ver também» e comentário, e calcula retroligações', () => {
    const g = construirGrafo(base());
    expect(g.verTambem.get('afastamento')).toEqual(['recuo', 'altura-da-edificacao', 'piso-de-um-edificio']);
    expect(g.ligacoesComentario.get('afastamento')).toEqual(['recuo']);
    expect(g.referidoPor.get('recuo')).toEqual(['afastamento']);
  });

  it('junta todos os erros de referência numa só mensagem', () => {
    const conceitos = construirConceitos([
      entrada('A', { ver_tambem: ['[[X]]'] }, 'Ver [[Y]].'),
    ]);
    expect(() => construirGrafo(conceitos)).toThrow(/«X» em A\.md \(ver_tambem\)\n.*«Y» em A\.md \(comentário\)/);
  });
});
