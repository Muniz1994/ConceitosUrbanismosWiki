// Corre localmente os mesmos passos do workflow de publicação, pela mesma ordem.
// Uso: npm run ci
import { spawnSync } from 'node:child_process';

const env = { ...process.env };
// As ligações «Editar no GitHub» precisam do repositório; em GitHub Actions vem de GITHUB_REPOSITORY.
env.PUBLIC_REPOSITORIO_GITHUB ||= env.GITHUB_REPOSITORY || 'local/ConceitosUrbanismosWiki';

const passos = [
  ['Testes unitários', 'npm test'],
  ['Validação de conteúdo inválido', 'npm run test:validacao'],
  ['Build', 'npm run build'],
  ['Verificação de ligações', 'npm run verificar-ligacoes'],
  ['Testes no navegador', 'npm run test:e2e'],
];

for (const [nome, comando] of passos) {
  console.log(`\n▶ ${nome}: ${comando}`);
  const r = spawnSync(comando, { stdio: 'inherit', shell: true, env });
  if (r.status !== 0) {
    console.error(`\n✗ Falhou: ${nome}`);
    process.exit(r.status ?? 1);
  }
}
console.log('\n✓ Todos os passos passaram.');
