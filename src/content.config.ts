import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { esquemaConceito } from './lib/esquema';

/**
 * Pasta dos conceitos. Pode ser substituída por CONCEITOS_DIR (usado nos testes
 * de validação com ficheiros de exemplo inválidos).
 */
const CONCEITOS_DIR = process.env.CONCEITOS_DIR ?? './src/content/conceitos';
const FIGURAS_FICHEIRO = process.env.FIGURAS_FICHEIRO ?? './src/content/figuras.yaml';

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
