import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Command, CommandList } from '@/components/ui/command';
import { t } from '@/i18n/pt-PT';
import { FiltroAnexo, ListaResultados, urlDe, useMotorPesquisa, type Filtro } from './pesquisa/comum';

/** Campo de pesquisa grande da página inicial: o mesmo motor do diálogo, com resultados por baixo. */
export default function PesquisaInicio() {
  const [consulta, setConsulta] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ativo, setAtivo] = useState(false);
  const { dados, erro, resultados } = useMotorPesquisa(consulta, filtro, ativo || consulta.length > 0);
  const temConsulta = consulta.trim().length > 0;

  return (
    <Command
      shouldFilter={false}
      loop
      label={t.pesquisa.titulo}
      className="h-auto overflow-visible rounded-xl! border bg-background p-0 shadow-sm"
      data-pesquisa-inicio
    >
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <CommandPrimitive.Input
          data-campo-inicio
          value={consulta}
          onValueChange={setConsulta}
          onFocus={() => setAtivo(true)}
          placeholder={t.pesquisa.placeholder}
          aria-label={t.pesquisa.titulo}
          className="h-14 w-full rounded-xl bg-transparent pr-4 pl-12 text-base outline-none placeholder:text-muted-foreground"
        />
      </div>
      {temConsulta && (
        <div className="border-t">
          <div className="px-3 pt-2">
            <FiltroAnexo filtro={filtro} setFiltro={setFiltro} />
          </div>
          <CommandList className="max-h-[min(55vh,26rem)] p-1">
            <ListaResultados
              consulta={consulta}
              dados={dados}
              erro={erro}
              resultados={resultados}
              aoEscolher={(slug) => (window.location.href = urlDe(slug))}
              comDica={false}
            />
          </CommandList>
        </div>
      )}
    </Command>
  );
}
