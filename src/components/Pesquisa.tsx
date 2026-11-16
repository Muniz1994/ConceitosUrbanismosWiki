import { useEffect, useMemo, useState } from 'react';
import { Command, CommandDialog, CommandInput, CommandList } from '@/components/ui/command';
import { t } from '@/i18n/pt-PT';
import { preCarregarQuandoLivre } from '@/lib/dados-cliente';
import {
  FiltroAnexo,
  ListaResultados,
  lerRecentes,
  registarVisita,
  urlDe,
  useMotorPesquisa,
  type Filtro,
} from './pesquisa/comum';

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
  const [recentes, setRecentes] = useState<string[]>([]);
  const { dados, erro, resultados } = useMotorPesquisa(consulta, filtro, aberto);

  // Registar a visita à página de conceito atual e pré-carregar os dados quando houver tempo.
  useEffect(() => {
    const slug = document.querySelector<HTMLElement>('[data-pagina-conceito]')?.dataset.paginaConceito;
    if (slug) registarVisita(slug);
    preCarregarQuandoLivre();
  }, []);

  // Atalhos de teclado e botões de abertura.
  useEffect(() => {
    const abrir = () => {
      setConsulta('');
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
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('click', aoClicar);
    document.documentElement.dataset.pesquisaPronta = 'sim';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('click', aoClicar);
    };
  }, []);

  const conceitosRecentes = useMemo(
    () => (dados ? recentes.map((s) => dados.conceitos.find((c) => c.slug === s)).filter((c) => !!c) : []),
    [dados, recentes],
  );

  const ir = (slug: string) => {
    setAberto(false);
    window.location.href = urlDe(slug);
  };

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
        <div className="px-2 pt-2">
          <FiltroAnexo filtro={filtro} setFiltro={setFiltro} />
        </div>
        <CommandList className="max-h-[min(60vh,28rem)]">
          <ListaResultados
            consulta={consulta}
            dados={dados}
            erro={erro}
            resultados={resultados}
            recentes={conceitosRecentes}
            aoEscolher={ir}
          />
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
