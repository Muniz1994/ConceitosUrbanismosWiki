import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { importar, transformar, type LinhaCsv } from './importar-csv';

let n = 0;
const linha = (conceito: string, extra: Partial<LinhaCsv> = {}): LinhaCsv => ({
  anexo: 'Anexo I',
  ficha: `Ficha n.º I-${++n}`,
  conceito,
  abreviatura: '',
  unidades: '',
  definicao: `Definição de ${conceito}.`,
  notas_complementares: '',
  ver_tambem: '',
  ...extra,
});

const amostra = () => [
  linha('Afastamento', {
    abreviatura: 'Af',
    unidades: '[m]',
    notas_complementares: 'Pode distinguir-se entre afastamento lateral e de tardoz. | O afastamento é expresso em metros. | Ver Figura 1.',
    ver_tambem: 'Alçado; Recuo',
  }),
  linha('Alçado'),
  linha('Alinhamento'),
  linha('Recuo', { notas_complementares: 'Ver Figura 1a.' }),
  linha('Piso (de um edifício)'),
  linha('Altura entre pisos', { ver_tambem: 'Piso ou pavimento; Piso' }),
  linha('Área de solo', { ver_tambem: 'Recuo; Zona' }),
  linha('Densidade habitacional', { unidades: 'Dhab' }),
  linha('Inclinação da cobertura', { abreviatura: 'ơ', unidades: '[graus]' }),
  linha('Volume do edifício', { notas_complementares: 'Ver Figura 3 e ver cota de soleira.' }),
  linha('Catálogo de objetos', { anexo: 'Anexo II', ficha: 'Ficha n.º II-1' }),
  linha('Modelo de dados', { anexo: 'Anexo II', ficha: 'Ficha n.º II-2' }),
  linha('Metadados', { anexo: 'Anexo II', ficha: 'Ficha n.º II-3', ver_tambem: 'Catálogo de objetos, Modelo de dados' }),
];

const dadosDe = (conceito: string) => {
  const { ficheiros } = transformar(amostra());
  return ficheiros.find((f) => f.dados.conceito === conceito)!.dados;
};

describe('transformar', () => {
  it('extrai anexo e ficha, e divide notas por « | »', () => {
    const d = dadosDe('Afastamento');
    expect(d).toMatchObject({ anexo: 'I', ficha: 'I-1', abreviatura: 'Af', unidades: '[m]' });
    expect(d.notas).toEqual([
      'Pode distinguir-se entre afastamento lateral e de tardoz.',
      'O afastamento é expresso em metros.',
      'Ver Figura 1.',
    ]);
  });

  it('escreve «ver também» como ligações para nomes canónicos', () => {
    expect(dadosDe('Afastamento').ver_tambem).toEqual(['[[Alçado]]', '[[Recuo]]']);
  });

  it('divide referências unidas por vírgula', () => {
    expect(dadosDe('Metadados').ver_tambem).toEqual(['[[Catálogo de objetos]]', '[[Modelo de dados]]']);
  });

  it('resolve variantes por alias e acrescenta-as ao conceito canónico', () => {
    const { ficheiros, relatorio } = transformar(amostra());
    const d = (c: string) => ficheiros.find((f) => f.dados.conceito === c)!.dados;
    expect(d('Altura entre pisos').ver_tambem).toEqual(['[[Piso (de um edifício)]]']);
    expect(d('Piso (de um edifício)').aliases).toEqual(['Piso ou pavimento', 'Piso']);
    expect(relatorio.aliasesAdicionados).toHaveLength(2);
  });

  it('remove «Zona» e regista no relatório', () => {
    const { relatorio } = transformar(amostra());
    expect(dadosDe('Área de solo').ver_tambem).toEqual(['[[Recuo]]']);
    expect(relatorio.referenciasRemovidas).toEqual(['«Zona» removida de Área de solo']);
  });

  it('move abreviaturas que estavam nas unidades', () => {
    const { relatorio } = transformar(amostra());
    const d = dadosDe('Densidade habitacional');
    expect(d.abreviatura).toBe('Dhab');
    expect(d.unidades).toBeUndefined();
    expect(relatorio.camposMovidos.filter((m) => m.includes('movido'))).toHaveLength(1);
  });

  it('corrige o carácter mal codificado da abreviatura α', () => {
    expect(dadosDe('Inclinação da cobertura').abreviatura).toBe('α');
  });

  it('associa figuras pela legenda e pelas notas', () => {
    expect(dadosDe('Afastamento').figuras).toEqual(['figura-1a']);
    expect(dadosDe('Recuo').figuras).toEqual(['figura-1a']);
    expect(dadosDe('Volume do edifício').figuras).toEqual(['figura-3a', 'figura-3b']);
    expect(dadosDe('Alçado').figuras).toEqual(['figura-2']);
  });

  it('produz YAML válido que preserva o texto oficial', () => {
    const { ficheiros } = transformar(amostra());
    const f = ficheiros.find((x) => x.dados.conceito === 'Afastamento')!;
    expect(f.nome).toBe('Afastamento.md');
    const yaml = f.conteudo.replace(/^---\n/, '').replace(/---\n$/, '');
    expect(parse(yaml)).toEqual(f.dados);
  });
});

describe('importar', () => {
  let pasta: string;
  afterEach(() => rmSync(pasta, { recursive: true, force: true }));

  const prepararCsv = () => {
    pasta = mkdtempSync(path.join(tmpdir(), 'importar-'));
    const csv = path.join(pasta, 'fonte.csv');
    const cab = 'anexo,ficha,conceito,abreviatura,unidades,definicao,notas_complementares,ver_tambem';
    writeFileSync(csv, `﻿${cab}\n"Anexo I","Ficha n.º I-1","Recuo","Re","[m]","O recuo é…","",""\n`, 'utf8');
    return { csv, destino: path.join(pasta, 'conceitos') };
  };

  it('cria ficheiros quando não há conteúdo', () => {
    const opcoes = prepararCsv();
    const r = importar(opcoes);
    expect(r.escritos).toBe(1);
    expect(readdirSync(opcoes.destino)).toEqual(['Recuo.md']);
  });

  it('não altera nada se já existir conteúdo e não for forçado', () => {
    const opcoes = prepararCsv();
    importar(opcoes);
    const ficheiro = path.join(opcoes.destino, 'Recuo.md');
    writeFileSync(ficheiro, 'editado à mão', 'utf8');
    const r = importar(opcoes);
    expect(r.recusado).toBe(true);
    expect(readFileSync(ficheiro, 'utf8')).toBe('editado à mão');
    expect(importar({ ...opcoes, forcar: true }).escritos).toBe(1);
    expect(readFileSync(ficheiro, 'utf8')).not.toBe('editado à mão');
  });
});
