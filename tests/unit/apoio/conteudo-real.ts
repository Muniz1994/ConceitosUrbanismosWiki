/** Carrega o conteúdo real (src/content/conceitos) para testes, com o mesmo esquema do build. */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { construirConceitos, type Conceito } from '@/lib/conteudo';
import { esquemaConceito } from '@/lib/esquema';

const PASTA = path.resolve(__dirname, '../../../src/content/conceitos');

export function carregarConceitosReais(): Conceito[] {
  return construirConceitos(
    readdirSync(PASTA)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const ficheiro = path.join('src/content/conceitos', f);
        const [, cabecalho, ...resto] = readFileSync(path.join(PASTA, f), 'utf8').split(/^---\s*$/m);
        return { ficheiro, dados: esquemaConceito.parse(parse(cabecalho!)), corpo: resto.join('---') };
      }),
  );
}
