import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/pt-PT';

type Tema = 'claro' | 'escuro' | 'sistema';
const ORDEM: Tema[] = ['claro', 'escuro', 'sistema'];
const ROTULOS: Record<Tema, string> = { claro: t.tema.claro, escuro: t.tema.escuro, sistema: t.tema.sistema };

function lerTema(): Tema {
  try {
    const v = localStorage.getItem('tema');
    return v === 'claro' || v === 'escuro' ? v : 'sistema';
  } catch {
    return 'sistema';
  }
}

/** Aplica o tema ao elemento raiz (o mesmo cálculo do script inline em Base.astro). */
function aplicar(tema: Tema) {
  const escuro = tema === 'escuro' || (tema === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', escuro);
  document.documentElement.dataset.tema = tema;
}

/** Botão que alterna entre tema claro, escuro e do sistema; a escolha fica guardada neste dispositivo. */
export default function AlternarTema() {
  const [tema, setTema] = useState<Tema>('sistema');

  useEffect(() => setTema(lerTema()), []);

  useEffect(() => {
    if (tema !== 'sistema') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const ouvir = () => aplicar('sistema');
    mq.addEventListener('change', ouvir);
    return () => mq.removeEventListener('change', ouvir);
  }, [tema]);

  const mudar = () => {
    const seguinte = ORDEM[(ORDEM.indexOf(tema) + 1) % ORDEM.length]!;
    try {
      localStorage.setItem('tema', seguinte);
    } catch {
      /* armazenamento indisponível: a escolha vale só para esta página */
    }
    aplicar(seguinte);
    setTema(seguinte);
  };

  const Icone = tema === 'claro' ? Sun : tema === 'escuro' ? Moon : Monitor;
  const rotulo = t.tema.alternar(ROTULOS[tema]);
  return (
    <Button variant="ghost" size="icon" onClick={mudar} aria-label={rotulo} title={rotulo} data-tema-atual={tema}>
      <Icone aria-hidden="true" />
    </Button>
  );
}
