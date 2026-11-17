import { Monitor, Moon, Palette as IconePaleta, Sun } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { t } from '@/i18n/pt-PT';
import {
  CHAVE_MODO,
  CHAVE_PALETA,
  lerModo,
  lerPaleta,
  MODO_PREDEFINIDO,
  MODOS,
  PALETA_PREDEFINIDA,
  PALETAS,
  type Modo,
  type Paleta,
} from '@/lib/aparencia';

const ICONES: Record<Modo, typeof Sun> = { claro: Sun, escuro: Moon, sistema: Monitor };

/** Aplica o modo ao elemento raiz (o mesmo cálculo do script inline em Base.astro). */
function aplicarModo(modo: Modo) {
  const escuro = modo === 'escuro' || (modo === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', escuro);
  document.documentElement.dataset.tema = modo;
}

function guardar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    /* armazenamento indisponível: a escolha vale só para esta página */
  }
}

/** Amostras da paleta (fundo, principal, destaque), desenhadas com as cores reais dessa paleta. */
function Amostras({ paleta }: { paleta: Paleta }) {
  const cores = ['var(--background)', 'var(--primary)', 'var(--accent)'];
  return (
    <span data-paleta={paleta} className="flex shrink-0 -space-x-1" aria-hidden="true">
      {cores.map((cor) => (
        <span key={cor} className="size-4 rounded-full border border-foreground/20" style={{ background: cor }} />
      ))}
    </span>
  );
}

/** Botão «Aparência» do cabeçalho: escolhe o modo (claro, escuro, sistema) e a paleta; fica guardado neste dispositivo. */
export default function Aparencia() {
  const id = useId();
  const [modo, setModo] = useState<Modo>(MODO_PREDEFINIDO);
  const [paleta, setPaleta] = useState<Paleta>(PALETA_PREDEFINIDA);

  // O script inline já aplicou as escolhas guardadas ao <html>; partir daí.
  useEffect(() => {
    setModo(lerModo(document.documentElement.dataset.tema));
    setPaleta(lerPaleta(document.documentElement.dataset.paleta));
  }, []);

  useEffect(() => {
    if (modo !== 'sistema') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const ouvir = () => aplicarModo('sistema');
    mq.addEventListener('change', ouvir);
    return () => mq.removeEventListener('change', ouvir);
  }, [modo]);

  const mudarModo = (valor: string) => {
    const novo = lerModo(valor);
    guardar(CHAVE_MODO, novo);
    aplicarModo(novo);
    setModo(novo);
  };

  const mudarPaleta = (valor: string) => {
    const nova = lerPaleta(valor);
    guardar(CHAVE_PALETA, nova);
    document.documentElement.dataset.paleta = nova;
    setPaleta(nova);
  };

  const rotulo = t.aparencia.rotulo(t.aparencia.modos[modo], t.aparencia.paletas[paleta]);
  const opcao = 'flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={rotulo} title={rotulo} data-aparencia data-modo={modo} data-paleta-atual={paleta}>
          <IconePaleta aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-3" data-painel-aparencia>
        <section className="space-y-1">
          <h2 id={`${id}-modo`} className="px-2 text-xs font-medium text-muted-foreground">
            {t.aparencia.modo}
          </h2>
          <RadioGroup value={modo} onValueChange={mudarModo} aria-labelledby={`${id}-modo`} className="gap-0.5">
            {MODOS.map((m) => {
              const Icone = ICONES[m];
              return (
                <label key={m} htmlFor={`${id}-modo-${m}`} className={opcao}>
                  <RadioGroupItem value={m} id={`${id}-modo-${m}`} />
                  <Icone className="size-4 text-muted-foreground" aria-hidden="true" />
                  {t.aparencia.modos[m]}
                </label>
              );
            })}
          </RadioGroup>
        </section>
        <section className="space-y-1">
          <h2 id={`${id}-paleta`} className="px-2 text-xs font-medium text-muted-foreground">
            {t.aparencia.paleta}
          </h2>
          <RadioGroup value={paleta} onValueChange={mudarPaleta} aria-labelledby={`${id}-paleta`} className="gap-0.5">
            {PALETAS.map((p) => (
              <label key={p.id} htmlFor={`${id}-paleta-${p.id}`} className={opcao}>
                <RadioGroupItem value={p.id} id={`${id}-paleta-${p.id}`} />
                <span className="flex-1">
                  {p.nome}
                  {p.id === PALETA_PREDEFINIDA && <span className="text-muted-foreground"> ({t.aparencia.predefinida})</span>}
                </span>
                <Amostras paleta={p.id} />
              </label>
            ))}
          </RadioGroup>
        </section>
      </PopoverContent>
    </Popover>
  );
}
