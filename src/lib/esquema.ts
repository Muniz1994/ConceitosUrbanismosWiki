/**
 * Esquema dos ficheiros de conceito. Separado de content.config.ts para poder ser
 * usado também pelos testes (Vitest) sem o runtime do Astro.
 */
import { z } from 'astro/zod';

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
