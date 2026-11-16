/**
 * Importação única: cria um ficheiro Markdown por conceito a partir do CSV de origem.
 * Depois da importação, os ficheiros Markdown passam a ser a fonte de verdade.
 *
 * Uso: npm run importar [-- --force]
 */
import { parse } from 'csv-parse/sync';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { normalizar } from '../src/lib/texto';

export interface LinhaCsv {
  anexo: string;
  ficha: string;
  conceito: string;
  abreviatura: string;
  unidades: string;
  definicao: string;
  notas_complementares: string;
  ver_tambem: string;
}

/** Variantes de nome usadas no «ver também» → conceito canónico (passam a ser aliases). */
export const ALIASES: Record<string, string> = {
  'Piso': 'Piso (de um edifício)',
  'Piso ou pavimento': 'Piso (de um edifício)',
  'Utilização do edifício': 'Utilizações do edifício',
  'Uso do solo': 'Usos do solo',
  'Área de construção': 'Área de construção do edifício',
  'Folha de planta': 'Folha da planta',
  'Conjuntos de dados geográficos': 'Conjunto de dados geográficos',
  'Serviços de dados geográficos': 'Serviço de dados geográficos',
};

/** Referências sem correspondência clara, removidas na importação. */
export const REFERENCIAS_REMOVIDAS = ['Zona'];

/** Abreviaturas que a fonte colocou na coluna de unidades. */
export const ABREVIATURAS_EM_UNIDADES = ['Dhab', 'D'];

/**
 * Caracteres mal codificados na camada de texto do PDF (e herdados pelo CSV).
 * Verificado visualmente: na tabela do Anexo I (DR p. 11), a abreviatura da
 * inclinação da cobertura é «α», mas o texto do PDF tem U+01A1 «ơ».
 */
export const CORRECOES_CARACTERES: Record<string, string> = { 'ơ': 'α' };

/** Conceitos nomeados em cada legenda de figura do DR (pp. 87–90). */
export const CONCEITOS_POR_FIGURA: Record<string, string[]> = {
  'figura-1a': ['Alinhamento', 'Afastamento', 'Recuo'],
  'figura-1b': ['Área de implantação do edifício', 'Polígono de implantação'],
  'figura-2': ['Alçado'],
  'figura-3a': ['Altura da fachada', 'Altura da edificação'],
  'figura-3b': ['Cota de soleira', 'Elevação da soleira'],
  'figura-4a': ['Área de construção do edifício'],
  'figura-4b': ['Área de implantação do edifício'],
};

export interface Relatorio {
  aliasesAdicionados: string[];
  referenciasRemovidas: string[];
  camposMovidos: string[];
  avisos: string[];
}

export interface FicheiroConceito {
  nome: string;
  dados: Record<string, unknown>;
  conteudo: string;
}

const dividir = (texto: string, separador: string | RegExp) =>
  texto.split(separador).map((s) => s.trim()).filter(Boolean);

/** Converte as linhas do CSV em ficheiros de conceito e num relatório de limpeza. */
export function transformar(linhas: LinhaCsv[]): { ficheiros: FicheiroConceito[]; relatorio: Relatorio } {
  const relatorio: Relatorio = { aliasesAdicionados: [], referenciasRemovidas: [], camposMovidos: [], avisos: [] };
  const canonico = new Map(linhas.map((l) => [normalizar(l.conceito), l.conceito.trim()]));
  const aliasPorNorma = new Map(Object.entries(ALIASES).map(([v, c]) => [normalizar(v), { variante: v, canonico: c }]));
  const removidas = new Set(REFERENCIAS_REMOVIDAS.map(normalizar));
  const aliasesDe = new Map<string, Set<string>>();

  for (const [variante, alvo] of Object.entries(ALIASES)) {
    if (!canonico.has(normalizar(alvo))) relatorio.avisos.push(`Alias «${variante}» aponta para conceito inexistente «${alvo}»`);
  }
  for (const [figura, nomes] of Object.entries(CONCEITOS_POR_FIGURA)) {
    for (const nome of nomes) {
      if (!canonico.has(normalizar(nome))) relatorio.avisos.push(`${figura}: conceito inexistente «${nome}»`);
    }
  }

  /** Devolve o nome canónico, regista o alias usado, ou null se a referência for desconhecida. */
  const resolver = (ref: string, origem: string): string | null => {
    const n = normalizar(ref);
    const direto = canonico.get(n);
    if (direto) return direto;
    const alias = aliasPorNorma.get(n);
    if (alias) {
      const conjunto = aliasesDe.get(alias.canonico) ?? new Set();
      if (!conjunto.has(alias.variante)) {
        conjunto.add(alias.variante);
        aliasesDe.set(alias.canonico, conjunto);
        relatorio.aliasesAdicionados.push(`«${alias.variante}» → «${alias.canonico}» (usado em ${origem})`);
      }
      return alias.canonico;
    }
    return null;
  };

  const intermedio = linhas.map((l) => {
    const conceito = l.conceito.trim();
    let abreviatura = l.abreviatura.trim();
    let unidades = l.unidades.trim();
    if (!abreviatura && ABREVIATURAS_EM_UNIDADES.includes(unidades)) {
      relatorio.camposMovidos.push(`${conceito}: «${unidades}» movido de unidades para abreviatura`);
      abreviatura = unidades;
      unidades = '';
    }
    for (const [errado, certo] of Object.entries(CORRECOES_CARACTERES)) {
      if (abreviatura.includes(errado)) {
        const corrigida = abreviatura.replaceAll(errado, certo);
        relatorio.camposMovidos.push(`${conceito}: abreviatura «${abreviatura}» corrigida para «${corrigida}»`);
        abreviatura = corrigida;
      }
    }

    const verTambem: string[] = [];
    for (const entrada of dividir(l.ver_tambem, ';')) {
      const partes = resolver(entrada, conceito) || removidas.has(normalizar(entrada)) ? [entrada] : dividir(entrada, ',');
      for (const parte of partes) {
        if (removidas.has(normalizar(parte))) {
          relatorio.referenciasRemovidas.push(`«${parte}» removida de ${conceito}`);
          continue;
        }
        const alvo = resolver(parte, conceito);
        if (!alvo) {
          relatorio.avisos.push(`${conceito}: referência não resolvida «${parte}» (mantida; o build vai falhar)`);
          verTambem.push(parte);
        } else if (alvo !== conceito && !verTambem.includes(alvo)) {
          verTambem.push(alvo);
        }
      }
    }

    const textoFiguras = `${l.definicao} ${l.notas_complementares}`;
    const figuras = Object.entries(CONCEITOS_POR_FIGURA)
      .filter(([id, nomes]) => {
        if (nomes.some((n) => normalizar(n) === normalizar(conceito))) return true;
        const [, numero, letra] = /^figura-(\d)([a-z]?)$/.exec(id)!;
        const citadas = [...textoFiguras.matchAll(/Figura\s+(\d)([a-z]?)\b/g)];
        return citadas.some(([, n, sub]) => {
          if (n !== numero) return false;
          if (sub) return sub === letra;
          // «Figura N» sem letra: as subfiguras de N que nomeiam o conceito, ou todas se nenhuma o nomeia.
          const irmas = Object.entries(CONCEITOS_POR_FIGURA).filter(([i]) => i.startsWith(`figura-${n}`));
          const nomeiam = irmas.filter(([, ns]) => ns.some((x) => normalizar(x) === normalizar(conceito)));
          return nomeiam.length === 0 || nomeiam.some(([i]) => i === id);
        });
      })
      .map(([id]) => id);

    return {
      conceito,
      anexo: l.anexo.replace(/^Anexo\s+/, '').trim(),
      ficha: l.ficha.replace(/^Ficha n\.º\s+/, '').trim(),
      abreviatura,
      unidades,
      verTambem,
      figuras,
      definicao: l.definicao.trim(),
      notas: dividir(l.notas_complementares, ' | '),
    };
  });

  const ficheiros = intermedio.map((c) => {
    const dados: Record<string, unknown> = { conceito: c.conceito, anexo: c.anexo, ficha: c.ficha };
    if (c.abreviatura) dados.abreviatura = c.abreviatura;
    if (c.unidades) dados.unidades = c.unidades;
    const aliases = [...(aliasesDe.get(c.conceito) ?? [])];
    if (aliases.length) dados.aliases = aliases;
    if (c.verTambem.length) dados.ver_tambem = c.verTambem.map((v) => `[[${v}]]`);
    if (c.figuras.length) dados.figuras = c.figuras;
    dados.definicao = c.definicao;
    if (c.notas.length) dados.notas = c.notas;

    const yaml = stringify(dados, { lineWidth: 100, blockQuote: 'folded' });
    return {
      nome: `${c.conceito.replace(/[\\/:*?"<>|]/g, '-')}.md`,
      dados,
      conteudo: `---\n${yaml}---\n`,
    };
  });

  return { ficheiros, relatorio };
}

export interface OpcoesImportacao {
  csv: string;
  destino: string;
  forcar?: boolean;
}

/** Escreve os ficheiros; recusa substituir conteúdo existente sem `forcar`. */
export function importar({ csv, destino, forcar = false }: OpcoesImportacao) {
  const existentes = existsSync(destino) ? readdirSync(destino).filter((f) => f.endsWith('.md')) : [];
  if (existentes.length && !forcar) {
    return { escritos: 0, recusado: true as const, existentes: existentes.length };
  }
  const linhas = parse(readFileSync(csv, 'utf8'), { columns: true, bom: true, skip_empty_lines: true }) as LinhaCsv[];
  const { ficheiros, relatorio } = transformar(linhas);
  mkdirSync(destino, { recursive: true });
  for (const f of ficheiros) writeFileSync(path.join(destino, f.nome), f.conteudo, 'utf8');
  return { escritos: ficheiros.length, recusado: false as const, ficheiros, relatorio };
}

function imprimirRelatorio(r: Relatorio) {
  const secao = (titulo: string, itens: string[]) => {
    console.log(`\n${titulo} (${itens.length})`);
    for (const i of itens) console.log(`  - ${i}`);
  };
  secao('Aliases adicionados', r.aliasesAdicionados);
  secao('Referências removidas', r.referenciasRemovidas);
  secao('Campos movidos ou corrigidos', r.camposMovidos);
  secao('Avisos', r.avisos);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const resultado = importar({
    csv: path.join(raiz, 'fontes/fichas_conceitos_tecnicos_DR5_2019.csv'),
    destino: path.join(raiz, 'src/content/conceitos'),
    forcar: process.argv.includes('--force'),
  });
  if (resultado.recusado) {
    console.error(
      `Já existem ${resultado.existentes} ficheiros de conceito em src/content/conceitos. Nada foi alterado.\n` +
        'Use `npm run importar -- --force` para substituir (perde as edições feitas à mão).',
    );
    process.exit(1);
  }
  const porAnexo = resultado.ficheiros.reduce<Record<string, number>>((acc, f) => {
    const a = String(f.dados.anexo);
    acc[a] = (acc[a] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Criados ${resultado.escritos} ficheiros: ${Object.entries(porAnexo).map(([a, n]) => `Anexo ${a}: ${n}`).join(', ')}`);
  imprimirRelatorio(resultado.relatorio);
}
