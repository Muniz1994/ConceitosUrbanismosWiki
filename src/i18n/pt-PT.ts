import { PALETAS, type Modo, type Paleta } from '@/lib/aparencia';

/**
 * Todos os textos da interface, em português europeu.
 * Evitar formas do português do Brasil (p. ex. «Pesquisar», não «Buscar»; «Transferir», não «Baixar»).
 */
export const t = {
  site: {
    nome: 'Conceitos DR 5/2019',
    nomeLongo: 'Conceitos técnicos do ordenamento do território e urbanismo',
    descricao:
      'Wiki dos conceitos técnicos do Decreto Regulamentar n.º 5/2019: definições, notas complementares e ligações entre conceitos.',
    fonte: 'Decreto Regulamentar n.º 5/2019, de 27 de setembro',
  },
  nav: {
    principal: 'Navegação principal',
    inicio: 'Início',
    indice: 'Índice',
    grafo: 'Grafo',
    sobre: 'Sobre',
    saltar: 'Saltar para o conteúdo',
    menu: 'Abrir menu',
    fecharMenu: 'Fechar menu',
    conceitos: 'Conceitos',
  },
  aparencia: {
    titulo: 'Aparência',
    /** Nome acessível do botão do cabeçalho: começa por «Aparência» e diz o que está escolhido. */
    rotulo: (modo: string, paleta: string) => `Aparência: modo ${modo}, paleta ${paleta}`,
    modo: 'Modo',
    paleta: 'Paleta',
    modos: { claro: 'Claro', escuro: 'Escuro', sistema: 'Sistema' } satisfies Record<Modo, string>,
    /** Nomes próprios das paletas (os do tweakcn), definidos uma só vez em lib/aparencia. */
    paletas: Object.fromEntries(PALETAS.map((p) => [p.id, p.nome])) as Record<Paleta, string>,
    predefinida: 'predefinida',
  },
  anexo: {
    I: 'Anexo I',
    II: 'Anexo II',
    descricaoI: 'Conceitos técnicos nos domínios do ordenamento do território e do urbanismo',
    descricaoII: 'Conceitos técnicos no domínio da cartografia e da informação geográfica',
  },
  conceito: {
    ficha: 'Ficha',
    abreviatura: 'Abreviatura',
    unidades: 'Unidades',
    definicao: 'Definição',
    notas: 'Notas complementares',
    figuras: 'Figuras',
    ampliar: (legenda: string) => `Ampliar ${legenda}`,
    fechar: 'Fechar',
    comentario: 'Comentário',
    comentarioNota: 'Anotação pessoal — não faz parte do texto do decreto.',
    anterior: 'Anterior',
    seguinte: 'Seguinte',
    editar: 'Editar no GitHub',
    paginaDr: (p: number) => `DR, 1.ª série, n.º 186, p. ${p}`,
  },
  ligacoes: {
    titulo: 'Ligações',
    verTambem: 'Ver também',
    referidoPor: 'Referido por',
    menciona: 'Menciona',
    mencionadoEm: 'Mencionado em',
    mencoes: 'Menções',
    explicitas: 'Ligações explícitas',
    notaMencoes: 'Derivadas do texto oficial: o nome do conceito aparece na definição ou nas notas.',
    semLigacoes: 'Este conceito não tem ligações a outros conceitos.',
    grafoLocal: 'Conceitos ligados',
    listaNos: 'Conceitos neste grafo',
  },
  pesquisa: {
    abrir: 'Pesquisar',
    placeholder: 'Pesquisar conceitos…',
    titulo: 'Pesquisar conceitos',
    dica: 'Escreva um nome, abreviatura (p. ex. «Af») ou palavras da definição.',
    atalhos: 'Atalhos: / ou Ctrl+K para abrir · ↑ ↓ para navegar · Enter para abrir · Esc para fechar',
    recentes: 'Visitados recentemente',
    resultados: 'Resultados',
    semResultados: (q: string) => `Sem resultados para «${q}»`,
    aCarregar: 'A carregar…',
    todos: 'Todos',
    filtroAnexo: 'Filtrar por anexo',
    campos: {
      conceito: 'Nome',
      aliases: 'Nome alternativo',
      abreviatura: 'Abreviatura',
      definicao: 'Definição',
      notas: 'Notas complementares',
      comentario: 'Comentário',
    } as Record<string, string>,
  },
  indice: {
    titulo: 'Índice de conceitos',
    descricao: 'Todos os conceitos por ordem alfabética.',
    filtros: 'Filtros',
    comAbreviatura: 'Com abreviatura',
    mostrando: (n: number, total: number) => `${n} de ${total} conceitos`,
    nenhum: 'Nenhum conceito corresponde aos filtros.',
    letras: 'Letras',
  },
  grafo: {
    titulo: 'Grafo de conceitos',
    descricao:
      'Todos os conceitos e as ligações entre eles. Passe o cursor sobre um conceito para destacar os vizinhos; selecione-o para abrir.',
    mostrar: 'Mostrar',
    zoomMais: 'Aproximar',
    zoomMenos: 'Afastar',
    repor: 'Repor vista',
  },
  inicio: {
    titulo: 'Conceitos técnicos do DR 5/2019',
    introducao:
      'Definições, notas complementares e ligações entre os conceitos técnicos fixados pelo Decreto Regulamentar n.º 5/2019 para o ordenamento do território, o urbanismo e a cartografia.',
    /** Nome acessível do ícone que mostra a introdução em ecrãs estreitos (o estado aberto/fechado é anunciado à parte). */
    mostrarIntroducao: 'Introdução',
    conceitos: (n: number) => `${n} conceitos`,
    explorarIndice: 'Ver o índice A–Z',
    explorarGrafo: 'Explorar o grafo',
  },
  naoEncontrado: {
    titulo: 'Página não encontrada',
    texto: 'O endereço que procura não existe. Pesquise um conceito ou consulte o índice.',
  },
  rodape: {
    aviso: 'O texto oficial publicado no Diário da República prevalece sobre o conteúdo deste sítio.',
  },
} as const;
