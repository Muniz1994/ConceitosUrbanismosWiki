import type { APIRoute } from 'astro';
import { carregarGrafo } from '@/lib/colecao';
import type { ConceitoCliente, DadosPesquisa } from '@/lib/dados-cliente';
import { criarIndice } from '@/lib/pesquisa';

/** Dados para a pesquisa e as pré-visualizações, gerados no build. */
export const GET: APIRoute = async () => {
  const { conceitos } = await carregarGrafo();
  const dados: DadosPesquisa = {
    conceitos: conceitos.map(
      (c): ConceitoCliente => ({
        slug: c.slug,
        conceito: c.conceito,
        anexo: c.anexo,
        ficha: c.ficha,
        abreviatura: c.abreviatura,
        unidades: c.unidades,
        aliases: c.aliases,
        definicao: c.definicao,
        notas: c.notas,
        comentario: c.comentario,
      }),
    ),
  };
  dados.indice = criarIndice(dados.conceitos).toJSON();
  return new Response(JSON.stringify(dados), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
