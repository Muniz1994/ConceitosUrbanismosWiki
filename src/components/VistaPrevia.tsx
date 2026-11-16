import { Popover as PopoverPrimitive } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';
import { t } from '@/i18n/pt-PT';
import { carregarDados, type ConceitoCliente } from '@/lib/dados-cliente';
import { resumo } from '@/lib/indice';

const ATRASO_ABRIR = 350;
const ATRASO_FECHAR = 200;

/**
 * Pré-visualização de conceitos: um único popover para toda a página, ativado por
 * qualquer ligação com `data-conceito` (ao passar o cursor ou ao focar com o teclado).
 * Em ecrãs táteis (sem «hover»), o toque segue a ligação diretamente.
 */
export default function VistaPrevia() {
  const [conceito, setConceito] = useState<ConceitoCliente | null>(null);
  const [aberto, setAberto] = useState(false);
  const ancora = useRef<HTMLElement | null>(null);
  const virtualRef = useRef({ getBoundingClientRect: () => ancora.current?.getBoundingClientRect() ?? new DOMRect() });
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    const comCursor = matchMedia('(hover: hover) and (pointer: fine)');
    const limpar = () => window.clearTimeout(temporizador.current);

    const mostrar = (el: HTMLElement, atraso: number) => {
      const slug = el.dataset.conceito;
      if (!slug || el.closest('[data-vista-previa]')) return;
      if (location.pathname.endsWith(`/conceitos/${slug}/`) && el.closest('[data-barra-lateral]')) return;
      limpar();
      temporizador.current = window.setTimeout(async () => {
        try {
          const { conceitos } = await carregarDados();
          const c = conceitos.find((x) => x.slug === slug);
          if (!c) return;
          ancora.current = el;
          setConceito(c);
          setAberto(true);
        } catch {
          /* sem dados: a ligação continua a funcionar normalmente */
        }
      }, atraso);
    };
    const esconder = (atraso = ATRASO_FECHAR) => {
      limpar();
      temporizador.current = window.setTimeout(() => setAberto(false), atraso);
    };
    const ligacaoDe = (alvo: EventTarget | null) =>
      alvo instanceof Element ? alvo.closest<HTMLElement>('a[data-conceito]') : null;

    const aoEntrar = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !comCursor.matches) return;
      const el = ligacaoDe(e.target);
      if (el) mostrar(el, ATRASO_ABRIR);
    };
    const aoSair = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = ligacaoDe(e.target);
      const destino = e.relatedTarget instanceof Element ? e.relatedTarget : null;
      if (el && !destino?.closest('[data-vista-previa]') && ligacaoDe(destino) !== el) esconder();
    };
    const aoFocar = (e: FocusEvent) => {
      const el = ligacaoDe(e.target);
      if (el?.matches(':focus-visible')) mostrar(el, 0);
    };
    const aoDesfocar = (e: FocusEvent) => {
      if (ligacaoDe(e.target)) esconder(0);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') esconder(0);
    };

    document.addEventListener('pointerover', aoEntrar);
    document.addEventListener('pointerout', aoSair);
    document.addEventListener('focusin', aoFocar);
    document.addEventListener('focusout', aoDesfocar);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      limpar();
      document.removeEventListener('pointerover', aoEntrar);
      document.removeEventListener('pointerout', aoSair);
      document.removeEventListener('focusin', aoFocar);
      document.removeEventListener('focusout', aoDesfocar);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, []);

  return (
    <>
    <span hidden data-vista-previa-raiz />
    <PopoverPrimitive.Root open={aberto && !!conceito} onOpenChange={setAberto} modal={false}>
      <PopoverPrimitive.Anchor virtualRef={virtualRef} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerEnter={() => window.clearTimeout(temporizador.current)}
          onPointerLeave={() => {
            window.clearTimeout(temporizador.current);
            temporizador.current = window.setTimeout(() => setAberto(false), ATRASO_FECHAR);
          }}
          data-vista-previa
          role="tooltip"
          className="z-50 w-80 max-w-[calc(100vw-24px)] rounded-lg bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          {conceito && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`size-1.5 rounded-full ${conceito.anexo === 'I' ? 'bg-anexo-i' : 'bg-anexo-ii'}`}
                  aria-hidden="true"
                />
                {t.anexo[conceito.anexo]} · {t.conceito.ficha} {conceito.ficha}
              </p>
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold">{conceito.conceito}</span>
                {conceito.abreviatura && (
                  <span className="rounded border px-1.5 text-xs font-semibold" title={t.conceito.abreviatura}>
                    {conceito.abreviatura}
                  </span>
                )}
              </p>
              <p className="leading-relaxed text-muted-foreground">{resumo(conceito.definicao, 220)}</p>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
    </>
  );
}
