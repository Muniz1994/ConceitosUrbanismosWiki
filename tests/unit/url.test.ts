import { beforeEach, describe, expect, it, vi } from 'vitest';
import { url, urlConceito, urlEditar } from '@/lib/url';

describe('url', () => {
  // O Astro define BASE_URL a partir de `base` em astro.config.mjs; aqui simulamos o mesmo valor.
  beforeEach(() => {
    vi.stubEnv('BASE_URL', '/ConceitosUrbanismosWiki/');
    return () => vi.unstubAllEnvs();
  });

  it('inclui o caminho base', () => {
    expect(url('/conceitos/recuo/')).toBe('/ConceitosUrbanismosWiki/conceitos/recuo/');
    expect(urlConceito('recuo')).toBe('/ConceitosUrbanismosWiki/conceitos/recuo/');
    expect(url('')).toBe('/ConceitosUrbanismosWiki/');
  });

  it('funciona com base sem barra final', () => {
    expect(url('grafo/', '/repo')).toBe('/repo/grafo/');
  });

  it('gera endereço de edição no GitHub com caracteres codificados', () => {
    expect(urlEditar('src\\content\\conceitos\\Área de solo.md', 'u/r')).toBe(
      'https://github.com/u/r/edit/main/src/content/conceitos/%C3%81rea%20de%20solo.md',
    );
    expect(urlEditar('x.md', undefined)).toBeUndefined();
  });
});
