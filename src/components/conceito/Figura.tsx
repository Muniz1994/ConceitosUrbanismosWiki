import { Expand } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { t } from '@/i18n/pt-PT';

export interface PropsFigura {
  id: string;
  legenda: string;
  alt: string;
  pagina: number;
  src: string;
  largura: number;
  altura: number;
  srcGrande: string;
}

/** Figura do decreto com legenda; ativá-la abre a versão ampliada (fecha com Esc ou com o botão). */
export default function Figura({ id, legenda, alt, pagina, src, largura, altura, srcGrande }: PropsFigura) {
  return (
    <figure id={id} className="scroll-mt-20 overflow-hidden rounded-xl border bg-card" data-figura={id}>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full cursor-zoom-in bg-white p-3"
            aria-label={t.conceito.ampliar(legenda)}
          >
            <img src={src} width={largura} height={altura} alt={alt} loading="lazy" decoding="async" className="mx-auto h-auto max-h-96 w-auto" />
            <span className="absolute top-2 right-2 rounded-md bg-background/90 p-1.5 opacity-70 shadow-sm transition-opacity group-hover:opacity-100">
              <Expand className="size-4" aria-hidden="true" />
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[95dvh] w-[95vw] max-w-5xl overflow-auto sm:max-w-5xl">
          <DialogTitle>{legenda}</DialogTitle>
          <DialogDescription>{t.conceito.paginaDr(pagina)}</DialogDescription>
          <div className="rounded-md bg-white p-2">
            <img src={srcGrande} alt={alt} className="mx-auto h-auto w-full" />
          </div>
        </DialogContent>
      </Dialog>
      <figcaption className="border-t px-4 py-3 text-sm">
        <span className="font-medium">{legenda}</span>
        <span className="text-muted-foreground"> · {t.conceito.paginaDr(pagina)}</span>
      </figcaption>
    </figure>
  );
}
