import { describe, expect, it } from 'vitest';
import { construirGrafo } from '@/lib/grafo';
import { carregarConceitosReais } from './apoio/conteudo-real';

describe('conteúdo importado', () => {
  const conceitos = carregarConceitosReais();
  const grafo = construirGrafo(conceitos);

  it('tem 101 conceitos: 73 no Anexo I e 28 no Anexo II', () => {
    expect(conceitos).toHaveLength(101);
    expect(conceitos.filter((c) => c.anexo === 'I')).toHaveLength(73);
    expect(conceitos.filter((c) => c.anexo === 'II')).toHaveLength(28);
  });

  it('tem 177 ligações «ver também» resolvidas', () => {
    const total = [...grafo.verTambem.values()].reduce((n, alvos) => n + alvos.length, 0);
    expect(total).toBe(177);
  });

  it('tem 12 conceitos sem ligações explícitas', () => {
    const isolados = conceitos.filter(
      (c) => grafo.verTambem.get(c.slug)!.length === 0 && grafo.referidoPor.get(c.slug)!.length === 0,
    );
    expect(isolados.map((c) => c.conceito)).toHaveLength(12);
    expect(isolados.map((c) => c.conceito)).toContain('RGB');
  });

  it('não tem ligações entre anexos', () => {
    for (const [origem, alvos] of grafo.verTambem) {
      for (const alvo of alvos) expect(grafo.porSlug.get(alvo)!.anexo).toBe(grafo.porSlug.get(origem)!.anexo);
    }
  });
});

describe('figuras', () => {
  it('todas as figuras referidas existem em figuras.yaml e em src/assets/figuras', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const { parse } = await import('yaml');
    const { validarFiguras } = await import('@/lib/conteudo');
    const figuras = parse(readFileSync('src/content/figuras.yaml', 'utf8')) as Record<string, { ficheiro: string }>;
    expect(() => validarFiguras(carregarConceitosReais(), Object.keys(figuras))).not.toThrow();
    for (const f of Object.values(figuras)) expect(existsSync(`src/assets/figuras/${f.ficheiro}`)).toBe(true);
  });
});
