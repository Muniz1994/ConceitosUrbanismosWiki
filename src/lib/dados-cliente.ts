/**
 * Dados dos conceitos para o navegador (pesquisa e pré-visualizações), servidos em
 * `pesquisa.json`. Carregados uma única vez por página.
 */
export interface ConceitoCliente {
  slug: string;
  conceito: string;
  anexo: 'I' | 'II';
  ficha: string;
  abreviatura?: string;
  unidades?: string;
  aliases: string[];
  definicao: string;
  notas: string[];
  comentario: string;
}

export interface DadosPesquisa {
  conceitos: ConceitoCliente[];
  /** Índice MiniSearch serializado (ver src/lib/pesquisa.ts). */
  indice?: unknown;
}

let pedido: Promise<DadosPesquisa> | undefined;

export function carregarDados(): Promise<DadosPesquisa> {
  pedido ??= fetch(`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}pesquisa.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`pesquisa.json: ${r.status}`);
      return r.json() as Promise<DadosPesquisa>;
    })
    .catch((erro) => {
      pedido = undefined; // permite tentar de novo
      throw erro;
    });
  return pedido;
}

/** Pré-carrega os dados quando o navegador estiver livre. */
export function preCarregarQuandoLivre() {
  const iniciar = () => void carregarDados().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(iniciar, { timeout: 3000 });
  else setTimeout(iniciar, 1500);
}
