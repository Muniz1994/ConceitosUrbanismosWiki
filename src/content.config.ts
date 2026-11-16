import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Pasta dos conceitos. Pode ser substituída por CONCEITOS_DIR (usado nos testes
 * de validação com ficheiros de exemplo inválidos).
 */
const CONCEITOS_DIR = process.env.CONCEITOS_DIR ?? './src/content/conceitos';
const FIGURAS_FICHEIRO = process.env.FIGURAS_FICHEIRO ?? './src/content/figuras.yaml';

/** Campo de texto opcional: vazio ou nulo conta como ausente. */
const textoOpcional = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const listaTexto = z
  .array(z.string().trim().min(1, 'não pode conter entradas vazias'))
  .nullish()
  .transform((v) => v ?? []);

export const esquemaConceito = z
  .object({
    conceito: z.string().trim().min(1, 'obrigatório'),
    anexo: z.enum(['I', 'II'], { error: 'deve ser «I» ou «II»' }),
    ficha: z.string().regex(/^(I|II)-\d+$/, 'formato esperado: «I-1» ou «II-1»'),
    abreviatura: textoOpcional,
    unidades: textoOpcional,
    definicao: z.string({ error: 'obrigatório' }).trim().min(1, 'obrigatório'),
    notas: listaTexto,
    ver_tambem: listaTexto,
    aliases: listaTexto,
    figuras: listaTexto,
  })
  .refine((d) => d.ficha.split('-')[0] === d.anexo, {
    path: ['ficha'],
    message: 'o prefixo da ficha não corresponde ao anexo',
  });

export type DadosConceito = z.infer<typeof esquemaConceito>;

const conceitos = defineCollection({
  // O id é o caminho do ficheiro: o endereço público é calculado em src/lib/conteudo.ts,
  // que deteta duplicados (o glob loader apenas avisaria e descartaria um deles).
  loader: glob({ pattern: '**/*.md', base: CONCEITOS_DIR, generateId: ({ entry }) => entry }),
  schema: esquemaConceito,
});

const figuras = defineCollection({
  loader: file(FIGURAS_FICHEIRO),
  schema: z.object({
    /** Nome do ficheiro em src/assets/figuras/. */
    ficheiro: z.string().regex(/^[\w-]+\.(png|jpg|webp)$/),
    legenda: z.string().min(1),
    alt: z.string().min(1),
    /** Página no Diário da República. */
    pagina_dr: z.number().int().positive(),
  }),
});

export const collections = { conceitos, figuras };
