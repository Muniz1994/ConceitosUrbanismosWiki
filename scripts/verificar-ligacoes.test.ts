import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const correr = (pasta: string) =>
  spawnSync(process.execPath, ['scripts/verificar-ligacoes.mjs', pasta, '/ConceitosUrbanismosWiki'], { encoding: 'utf8' });

describe('verificar-ligacoes', () => {
  it('falha e lista a página e o endereço partido', () => {
    const r = correr('tests/fixtures/dist-quebrado');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('/index.html → /ConceitosUrbanismosWiki/conceitos/nao-existe/');
    expect(r.stderr).toContain('/index.html → #inexistente');
    expect(r.stderr).not.toContain('conceitos/recuo/');
    expect(r.stderr).not.toContain('example.com');
  });

  it('passa com ligações válidas (incluindo fragmentos noutra página)', () => {
    const r = correr('tests/fixtures/dist-valido');
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
  });
});
