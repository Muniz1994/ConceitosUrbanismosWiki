// Verifica todas as ligações e recursos internos do site gerado (dist/).
// Uso: node scripts/verificar-ligacoes.mjs [pasta] [caminho-base]
//   pasta: predefinição «dist»; caminho-base: predefinição BASE_PATH ou «/ConceitosUrbanismosWiki».
// Termina com código 1 e lista as páginas e endereços partidos, se houver algum.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const pasta = path.resolve(process.argv[2] ?? 'dist');
const base = `/${(process.argv[3] ?? process.env.BASE_PATH ?? '/ConceitosUrbanismosWiki').replace(/^\/+|\/+$/g, '')}/`;

/** Recursos pedidos pelo JavaScript (não aparecem como atributos no HTML). */
const RECURSOS_EXTRA = ['pesquisa.json'];

function* ficheirosHtml(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = path.join(dir, nome);
    if (statSync(caminho).isDirectory()) yield* ficheirosHtml(caminho);
    else if (nome.endsWith('.html')) yield caminho;
  }
}

const ATRIBUTOS = /\s(?:href|src|component-url|renderer-url|before-hydration-url)="([^"]*)"/g;
const SRCSET = /\ssrcset="([^"]*)"/g;
const IDS = /\sid="([^"]*)"/g;

function existeNoSite(caminhoUrl) {
  const relativo = decodeURIComponent(caminhoUrl.slice(base.length));
  const alvo = path.join(pasta, relativo);
  if (relativo === '' || relativo.endsWith('/')) return existsSync(path.join(alvo, 'index.html'));
  return existsSync(alvo) && statSync(alvo).isFile();
}

const quebradas = [];
let verificadas = 0;

for (const ficheiro of ficheirosHtml(pasta)) {
  const html = readFileSync(ficheiro, 'utf8');
  const pagina = `/${path.relative(pasta, ficheiro).split(path.sep).join('/')}`;
  const ids = new Set([...html.matchAll(IDS)].map((m) => m[1]));
  const referencias = [
    ...[...html.matchAll(ATRIBUTOS)].map((m) => m[1]),
    ...[...html.matchAll(SRCSET)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
  ];
  for (const bruto of referencias) {
    const ref = bruto.replace(/&amp;/g, '&');
    if (!ref || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref) || ref.startsWith('//')) continue;
    verificadas++;
    if (ref.startsWith('#')) {
      if (ref.length > 1 && !ids.has(decodeURIComponent(ref.slice(1)))) quebradas.push([pagina, ref]);
      continue;
    }
    const [semFragmento, fragmento] = ref.split('#');
    const caminhoUrl = semFragmento.split('?')[0];
    if (!caminhoUrl.startsWith('/')) {
      quebradas.push([pagina, `${ref} (relativo: usar endereços com o caminho base)`]);
    } else if (!caminhoUrl.startsWith(base)) {
      quebradas.push([pagina, `${ref} (fora do caminho base ${base})`]);
    } else if (!existeNoSite(caminhoUrl)) {
      quebradas.push([pagina, ref]);
    } else if (fragmento && caminhoUrl.endsWith('/')) {
      const destino = readFileSync(path.join(pasta, decodeURIComponent(caminhoUrl.slice(base.length)), 'index.html'), 'utf8');
      if (!destino.includes(`id="${fragmento}"`)) quebradas.push([pagina, ref]);
    }
  }
}

for (const recurso of RECURSOS_EXTRA) {
  verificadas++;
  if (!existeNoSite(base + recurso)) quebradas.push(['(JavaScript)', base + recurso]);
}

if (quebradas.length) {
  console.error(`✗ ${quebradas.length} ligações partidas (de ${verificadas} verificadas):`);
  for (const [pagina, ref] of quebradas) console.error(`  ${pagina} → ${ref}`);
  process.exit(1);
}
console.log(`✓ ${verificadas} ligações e recursos internos verificados em ${pasta}, sem erros.`);
