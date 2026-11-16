import { History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { t } from '@/i18n/pt-PT';
import { carregarDados, preCarregarQuandoLivre, type DadosPesquisa } from '@/lib/dados-cliente';
import { carregarIndice, pesquisar, type Resultado } from '@/lib/pesquisa';
import { cn } from '@/lib/utils';

const CHAVE_RECENTES = 'conceitos-recentes';
const MAX_RECENTES = 5;
type Filtro = 'todos' | 'I' | 'II';

const base = () => import.meta.env.BASE_URL.replace(/\/?$/, '/');
const urlDe = (slug: string) => `${base()}conceitos/${slug}/`;

function lerRecentes(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_RECENTES) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, MAX_RECENTES) : [];
  } catch {
    return [];
  }
}

function registarVisita(slug: string) {
  try {
    const lista = [slug, ...lerRecentes().filter((s) => s !== slug)].slice(0, MAX_RECENTES);
    localStorage.setItem(CHAVE_RECENTES, JSON.stringify(lista));
  } catch {
    /* armazenamento indisponível */
  }
}

/** Está a escrever num campo de texto? (o atalho «/» não deve abrir a pesquisa) */
function aEscrever(alvo: EventTarget | null) {
  return (
    alvo instanceof HTMLElement &&
    (alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName))
  );
}

/** Diálogo de pesquisa global: abre com «/», Ctrl/⌘+K ou os botões `[data-abrir-pesquisa]`. */
export default function Pesquisa() {
  const [aberto, setAberto] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [dados, setDados] = useState<DadosPesquisa | null>(null);
  const [erro, setErro] = useState(false);
  const [recentes, setRecentes] = useState<string[]>([]);

  // Registar a visita à página de conceito atual e pré-carregar os dados quando houver tempo.
  useEffect(() => {
    const slug = document.querySelector<HTMLElement>('[data-pagina-conceito]')?.dataset.paginaConceito;
    if (slug) registarVisita(slug);
    preCarregarQuandoLivre();
  }, []);

  // Atalhos de teclado e botões de abertura.
  useEffect(() => {
    const abrir = (inicial = '') => {
      setConsulta(inicial);
      setRecentes(lerRecentes());
      setAberto(true);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        abrir();
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !aEscrever(e.target)) {
        e.preventDefault();
        abrir();
      }
    };
    const aoClicar = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-abrir-pesquisa]')) abrir();
    };
    const aoPedir = (e: Event) => abrir((e as CustomEvent<{ consulta?: string }>).detail?.consulta ?? '');
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('click', aoClicar);
    window.addEventListener('pesquisa:abrir', aoPedir);
    document.documentElement.dataset.pesquisaPronta = 'sim';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('click', aoClicar);
      window.removeEventListener('pesquisa:abrir', aoPedir);
    };
  }, []);

  // Carregar os dados o mais tardar quando a pesquisa abre.
  useEffect(() => {
    if (!aberto || dados) return;
    carregarDados()
      .then((d) => {
        setDados(d);
        setErro(false);
      })
      .catch(() => setErro(true));
  }, [aberto, dados]);

  const indice = useMemo(() => (dados?.indice ? carregarIndice(dados.indice) : null), [dados]);
  const resultados: Resultado[] = useMemo(
    () =>
      indice && dados && consulta.trim()
        ? pesquisar(indice, dados.conceitos, consulta, { anexo: filtro === 'todos' ? undefined : filtro })
        : [],
    [indice, dados, consulta, filtro],
  );
  const conceitosRecentes = useMemo(
    () => (dados ? recentes.map((s) => dados.conceitos.find((c) => c.slug === s)).filter((c) => !!c) : []),
    [dados, recentes],
  );

  const ir = (slug: string) => {
    setAberto(false);
    window.location.href = urlDe(slug);
  };

  const temConsulta = consulta.trim().length > 0;

  return (
    <CommandDialog
      open={aberto}
      onOpenChange={setAberto}
      title={t.pesquisa.titulo}
      description={t.pesquisa.dica}
      className="top-[12vh] max-w-[calc(100%-1.5rem)] sm:max-w-xl"
    >
      <Command shouldFilter={false} loop label={t.pesquisa.titulo} data-pesquisa>
        <CommandInput value={consulta} onValueChange={setConsulta} placeholder={t.pesquisa.placeholder} />
        <div role="group" aria-label={t.pesquisa.filtroAnexo} className="flex gap-1 px-2 pt-2">
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
        <CommandList className="max-h-[min(60vh,28rem)]">
          {!dados && !erro && <p className="py-6 text-center text-sm text-muted-foreground">{t.pesquisa.aCarregar}</p>}
          {erro && <p className="py-6 text-center text-sm text-destructive">Não foi possível carregar a pesquisa.</p>}
          {dados && temConsulta && (
            <CommandEmpty data-sem-resultados>{t.pesquisa.semResultados(consulta.trim())}</CommandEmpty>
          )}
          {dados && !temConsulta && (
            <>
              <div className="space-y-1 px-3 py-3 text-sm text-muted-foreground">
                <p>{t.pesquisa.dica}</p>
                <p className="hidden text-xs sm:block">{t.pesquisa.atalhos}</p>
              </div>
              {conceitosRecentes.length > 0 && (
                <CommandGroup heading={t.pesquisa.recentes}>
                  {conceitosRecentes.map((c) => (
                    <CommandItem key={c.slug} value={c.slug} onSelect={() => ir(c.slug)} data-resultado={c.slug}>
                      <History className="text-muted-foreground" aria-hidden="true" />
                      <span>{c.conceito}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{t.anexo[c.anexo]}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
          {resultados.length > 0 && (
            <CommandGroup heading={t.pesquisa.resultados}>
              {resultados.map((r) => (
                <CommandItem
                  key={r.conceito.slug}
                  value={r.conceito.slug}
                  onSelect={() => ir(r.conceito.slug)}
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
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
