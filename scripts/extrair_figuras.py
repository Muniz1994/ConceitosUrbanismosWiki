"""Extração única das figuras do DR 5/2019 (pp. 87–90 do DR; páginas 81–84 do PDF).

As páginas 81–83 são digitalizações divididas em faixas; por isso recortamos
regiões da página renderizada em vez de extrair as imagens embutidas.
O resultado é guardado em src/assets/figuras/ e versionado; este script não faz
parte do build.

Uso (a partir da raiz do projeto):
    python -I scripts/extrair_figuras.py [--dpi 300] [--pre-visualizar PASTA]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF

RAIZ = Path(__file__).resolve().parent.parent
PDF = RAIZ / "fontes" / "DR_5_2019.pdf"
DESTINO = RAIZ / "src" / "assets" / "figuras"

# id: (página do PDF, retângulo em pontos: x0, y0, x1, y1)
RECORTES: dict[str, tuple[int, tuple[float, float, float, float]]] = {
    "figura-1a": (81, (90, 140, 462, 330)),
    "figura-1b": (81, (90, 400, 462, 600)),
    "figura-2": (82, (90, 110, 460, 545)),
    "figura-3a": (83, (88, 118, 460, 395)),
    "figura-3b": (83, (88, 436, 460, 620)),
    "figura-4a": (84, (84, 90, 502, 362)),
    "figura-4b": (84, (84, 400, 502, 720)),
}


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dpi", type=int, default=300)
    parser.add_argument("--pre-visualizar", type=Path, help="também grava versões a 60 dpi nesta pasta")
    args = parser.parse_args()

    DESTINO.mkdir(parents=True, exist_ok=True)
    documento = fitz.open(PDF)
    for identificador, (pagina, retangulo) in RECORTES.items():
        pagina_pdf = documento[pagina - 1]
        clip = fitz.Rect(*retangulo)
        pixmap = pagina_pdf.get_pixmap(dpi=args.dpi, clip=clip, colorspace=fitz.csGRAY)
        saida = DESTINO / f"{identificador}.png"
        pixmap.save(saida)
        print(f"{identificador}: página {pagina} → {saida.relative_to(RAIZ)} ({pixmap.width}×{pixmap.height})")
        if args.pre_visualizar:
            args.pre_visualizar.mkdir(parents=True, exist_ok=True)
            pagina_pdf.get_pixmap(dpi=60, clip=clip).save(args.pre_visualizar / f"{identificador}.png")


if __name__ == "__main__":
    main()
