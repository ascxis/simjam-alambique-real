"""Prepara los recursos del escenario (etapa 5) desde arte_fuente/originales/:

* Decoraciones animadas (vela, frasco, engranaje): separa los 4 cuadros de cada hoja de
  Gemini, quita el magenta, recorta con una caja común (el objeto queda en la misma
  posición en los 4 cuadros) y guarda cada cuadro a 64x64 px en arte_fuente/atlas_piezas/
  para que scripts/crear-atlas.mjs los agrupe en el atlas.
* Baldosas: laboratorio_tiles.png (8x4 de 32x32 px) con el magenta convertido en
  transparencia -> public/assets/tiles/laboratorio_tiles.png.

Uso (desde la raíz):  python scripts/preparar_escenario.py      (pip install pillow numpy)
"""
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / 'arte_fuente' / 'originales'
ATLAS = RAIZ / 'arte_fuente' / 'atlas_piezas'
TILES = RAIZ / 'public' / 'assets' / 'tiles'
DECORACIONES = {'vela': 4, 'frasco': 4, 'engranaje': 4}
CUADRO = 64


def sin_magenta(a, tolerancia=60):
    """Vuelve transparente el fondo magenta y quita el tinte magenta de los bordes."""
    a = a.astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fondo = (r > 255 - tolerancia * 1.5) & (b > 255 - tolerancia * 1.5) & (g < tolerancia * 1.6)
    mezcla = (r > g + 50) & (b > g + 50) & ~fondo  # halo magenta en el borde
    a[..., 3] = np.where(fondo, 0, a[..., 3])
    a[mezcla, 0] = np.minimum(a[mezcla, 0], a[mezcla, 1] + 40)
    a[mezcla, 2] = np.minimum(a[mezcla, 2], a[mezcla, 1] + 40)
    a[mezcla, 3] *= 0.6
    return a.clip(0, 255).astype('uint8')


def guardar_rgba(img, ruta):
    """PNG RGBA de 8 bits sin entrelazar (formato que lee scripts/crear-atlas.mjs)."""
    ruta.parent.mkdir(parents=True, exist_ok=True)
    img.convert('RGBA').save(ruta, format='PNG', optimize=False)


def decoraciones():
    for nombre, n in DECORACIONES.items():
        a = np.asarray(Image.open(ORIG / f'deco_{nombre}.png').convert('RGBA'))
        a = sin_magenta(a)
        w = a.shape[1] // n
        cuadros = [a[:, k * w:(k + 1) * w] for k in range(n)]
        # caja común a los cuadros: el objeto no salta entre cuadros
        visibles = np.any([c[..., 3] > 20 for c in cuadros], axis=0)
        ys, xs = np.where(visibles)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        lado = max(y1 - y0, x1 - x0)
        if nombre == 'vela':
            # Gemini cambió el color del candelero entre cuadros: solo la llama se anima,
            # la parte inferior se toma siempre del primer cuadro para que no parpadee.
            corte = y0 + int(0.42 * (y1 - y0))
            cuadros = [np.concatenate([c[:corte], cuadros[0][corte:]], axis=0) for c in cuadros]
        for k, c in enumerate(cuadros):
            recorte = Image.fromarray(c[y0:y1, x0:x1])
            lienzo = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
            lienzo.alpha_composite(recorte, ((lado - recorte.width) // 2, lado - recorte.height))  # apoyado abajo
            guardar_rgba(lienzo.resize((CUADRO, CUADRO), Image.LANCZOS), ATLAS / f'deco-{nombre}-{k}.png')
        print(f'deco {nombre}: {n} cuadros de {CUADRO}x{CUADRO}')


def baldosas():
    a = np.asarray(Image.open(ORIG / 'laboratorio_tiles.png').convert('RGBA'))
    assert a.shape[:2] == (128, 256), 'Se espera una hoja de 8x4 baldosas de 32x32 px'
    guardar_rgba(Image.fromarray(sin_magenta(a)), TILES / 'laboratorio_tiles.png')
    print('baldosas: 8x4 de 32x32 px')


if __name__ == '__main__':
    decoraciones()
    baldosas()
