import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { t } from '@/i18n/pt-PT';
import { cn } from '@/lib/utils';

export interface ItemMenu {
  slug: string;
  conceito: string;
  ficha: string;
  href: string;
}

interface Props {
  ligacoes: Array<{ href: string; rotulo: string; atual?: boolean }>;
  anexos: Array<{ anexo: 'I' | 'II'; titulo: string; itens: ItemMenu[] }>;
  slugAtual?: string;
}

/** Menu lateral para ecrãs estreitos: navegação principal e lista de conceitos por anexo. */
export default function MenuMovel({ ligacoes, anexos, slugAtual }: Props) {
  const [aberto, setAberto] = useState(false);
  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t.nav.menu} data-menu-movel>
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>{t.site.nome}</SheetTitle>
          <SheetDescription className="sr-only">{t.nav.principal}</SheetDescription>
        </SheetHeader>
        <nav aria-label={t.nav.principal} className="flex flex-col gap-1 border-b p-3">
          {ligacoes.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={l.atual ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm hover:bg-accent',
                l.atual && 'bg-selecionado font-medium',
              )}
            >
              {l.rotulo}
            </a>
          ))}
        </nav>
        <ScrollArea className="min-h-0 flex-1">
          <nav aria-label={t.nav.conceitos} className="p-3">
            {anexos.map((grupo) => (
              <section key={grupo.anexo} className="mb-4">
                <h2 className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {grupo.titulo}
                </h2>
                <ul>
                  {grupo.itens.map((c) => (
                    <li key={c.slug}>
                      <a
                        href={c.href}
                        aria-current={c.slug === slugAtual ? 'page' : undefined}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm hover:bg-accent',
                          c.slug === slugAtual && 'bg-selecionado font-medium',
                        )}
                      >
                        {c.conceito}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
