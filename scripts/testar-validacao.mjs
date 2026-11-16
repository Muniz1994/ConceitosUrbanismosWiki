// Verifica que o build falha com mensagens claras para conteúdo inválido.
// Uso: npm run test:validacao
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const casos = [
  { pasta: 'valido', deveFalhar: false },
  { pasta: 'sem-definicao', deveFalhar: true, espera: ['Afastamento.md', 'definicao'] },
  { pasta: 'anexo-invalido', deveFalhar: true, espera: ['Afastamento.md', 'anexo'] },
  { pasta: 'ficha-duplicada', deveFalhar: true, espera: ['Ficha duplicada', 'Recuo.md'] },
];

const limparCache = () =>
  ['.astro', 'node_modules/.astro'].forEach((p) => rmSync(p, { recursive: true, force: true }));

let falhas = 0;
for (const caso of casos) {
  limparCache();
  const r = spawnSync('npx', ['astro', 'build', '--outDir', 'dist-validacao'], {
    env: { ...process.env, CONCEITOS_DIR: `./tests/fixtures/conteudo/${caso.pasta}` },
    encoding: 'utf8',
    shell: true,
  });
  const saida = (r.stdout + r.stderr).replace(/\x1b\[[0-9;]*m/g, '');
  const falhou = r.status !== 0;
  const mensagensOk = (caso.espera ?? []).every((t) => saida.includes(t));
  const ok = falhou === caso.deveFalhar && mensagensOk;
  if (!ok) falhas++;
  console.log(`${ok ? '✓' : '✗'} ${caso.pasta}: build ${falhou ? 'falhou' : 'passou'}`);
}
limparCache();
rmSync('dist-validacao', { recursive: true, force: true });
process.exit(falhas ? 1 : 0);
