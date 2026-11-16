/** Partes partilhadas entre o diálogo de pesquisa e a pesquisa da página inicial. */
import { History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { t } from '@/i18n/pt-PT';
import { carregarDados, type ConceitoCliente, type DadosPesquisa } from '@/lib/dados-cliente';
import { carregarIndice, pesquisar, type Resultado } from '@/lib/pesquisa';
import { cn } from '@/lib/utils';

export type Filtro = 'todos' | 'I' | 'II';

const CHAVE_RECENTES = 'conceitos-recentes';
const MAX_RECENTES = 5;

export const urlDe = (slug: string) => `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}conceitos/${slug}/`;

export function lerRecentes(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_RECENTES) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, MAX_RECENTES) : [];
  } catch {
    return [];
  }
}

export function registarVisita(slug: string) {
  try {
    const lista = [slug, ...lerRecentes().filter((s) => s !== slug)].slice(0, MAX_RECENTES);
    localStorage.setItem(CHAVE_RECENTES, JSON.stringify(lista));
  } catch {
    /* armazenamento indisponível */
  }
}

/** Carrega os dados (quando `ativo`) e calcula os resultados para a consulta e o filtro. */
export function useMotorPesquisa(consulta: string, filtro: Filtro, ativo: boolean) {
  const [dados, setDados] = useState<DadosPesquisa | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!ativo || dados) return;
    carregarDados()
      .then((d) => {
        setDados(d);
        setErro(false);
      })
      .catch(() => setErro(true));
  }, [ativo, dados]);

  const indice = useMemo(() => (dados?.indice ? carregarIndice(dados.indice) : null), [dados]);
  const resultados: Resultado[] = useMemo(
    () =>
      indice && dados && consulta.trim()
        ? pesquisar(indice, dados.conceitos, consulta, { anexo: filtro === 'todos' ? undefined : filtro })
        : [],
    [indice, dados, consulta, filtro],
  );
  return { dados, erro, resultados };
}

export function FiltroAnexo({ filtro, setFiltro }: { filtro: Filtro; setFiltro: (f: Filtro) => void }) {
  return (
    <div role="group" aria-label={t.pesquisa.filtroAnexo} className="flex gap-1">
      {(['todos', 'I', 'II'] as const).map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={filtro === f}
          data-filtro-pesquisa={f}
          onClick={() => setFiltro(f)}
          className={cn(
            'rounded-md border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground',
            filtro === f && 'border-transparent bg-accent font-medium text-foreground',
          )}
        >
          {f === 'todos' ? t.pesquisa.todos : t.anexo[f]}
        </button>
      ))}
    </div>
  );
}

interface PropsLista {
  consulta: string;
  dados: DadosPesquisa | null;
  erro: boolean;
  resultados: Resultado[];
  recentes?: ConceitoCliente[];
  aoEscolher: (slug: string) => void;
  /** Mostrar a dica e os atalhos quando a consulta está vazia. */
  comDica?: boolean;
}

/** Conteúdo da lista (dentro de um `CommandList`): carregamento, vazio, recentes e resultados. */
export function ListaResultados({ consulta, dados, erro, resultados, recentes = [], aoEscolher, comDica = true }: PropsLista) {
  const temConsulta = consulta.trim().length > 0;
  return (
    <>
      {!dados && !erro && (temConsulta || comDica) && (
        <p className="py-6 text-center text-sm text-muted-foreground">{t.pesquisa.aCarregar}</p>
      )}
      {erro && <p className="py-6 text-center text-sm text-destructive">Não foi possível carregar a pesquisa.</p>}
      {dados && temConsulta && (
        <CommandEmpty data-sem-resultados>{t.pesquisa.semResultados(consulta.trim())}</CommandEmpty>
      )}
      {dados && !temConsulta && comDica && (
        <div className="space-y-1 px-3 py-3 text-sm text-muted-foreground">
          <p>{t.pesquisa.dica}</p>
          <p className="hidden text-xs sm:block">{t.pesquisa.atalhos}</p>
        </div>
      )}
      {dados && !temConsulta && recentes.length > 0 && (
        <CommandGroup heading={t.pesquisa.recentes}>
          {recentes.map((c) => (
            <CommandItem key={c.slug} value={c.slug} onSelect={() => aoEscolher(c.slug)} data-resultado={c.slug}>
              <History className="text-muted-foreground" aria-hidden="true" />
              <span>{c.conceito}</span>
              <span className="ml-auto text-xs text-muted-foreground">{t.anexo[c.anexo]}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {resultados.length > 0 && (
        <CommandGroup heading={t.pesquisa.resultados}>
          {resultados.map((r) => (
            <CommandItem
              key={r.conceito.slug}
              value={r.conceito.slug}
              onSelect={() => aoEscolher(r.conceito.slug)}
              className="flex-col items-start gap-1"
              data-resultado={r.conceito.slug}
              data-campo={r.campo}
            >
              <div className="flex w-full items-baseline gap-2">
                <span className="font-medium">{r.conceito.conceito}</span>
                {r.conceito.abreviatura && (
                  <span className="rounded border px-1 text-[11px] font-semibold">{r.conceito.abreviatura}</span>
                )}
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {t.anexo[r.conceito.anexo]} · {r.conceito.ficha}
                </span>
              </div>
              <div className="w-full text-xs text-muted-foreground">
                <span className="mr-1.5 font-medium text-foreground/70">{t.pesquisa.campos[r.campo]}</span>
                {r.trecho.map((s, i) =>
                  s.destaque ? (
                    <mark key={i} className="rounded-sm bg-yellow-200/70 px-0.5 text-foreground dark:bg-yellow-500/30">
                      {s.texto}
                    </mark>
                  ) : (
                    <span key={i}>{s.texto}</span>
                  ),
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
