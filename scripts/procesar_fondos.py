"""Fondos del escenario (guía 2, tabla 5.2 y etapa 5): tres capas fijas de 1280x720.

Lee arte_fuente/originales/fondo_lejano.png, fondo_medio.png y fondo_cercano.png
(2576x1438, RGB) y escribe public/assets/fondos/fondo_lejano.png, fondo_medio.png y
fondo_cercano.png. Los originales no se tocan.

1. Recorte mínimo al centro para llegar a 16:9 (2576x1438 -> 2556x1438: 10 px por lado).
2. En la media y la cercana el magenta pasa a transparencia sin halos:
   - Fondo: píxeles casi magenta (R y B altos, G bajo) que forman zonas grandes
     conectadas. Así una poción morada o rosada dentro del dibujo no se borra.
   - El magenta puro se borra aunque la zona sea pequeña (huecos de los eslabones).
   - Vidrio sobre magenta (parte vacía de los frascos): zona teñida conectada al magenta casi
     puro; queda gris con alfa parcial (>= 0,35). Las pociones moradas están separadas por
     su contorno y se conservan.
   - Borde: en una franja de 3 px alrededor del fondo se estima el alfa con la
     "cantidad de magenta" del píxel y se le quita el magenta al color
     (C = a·F + (1 − a)·M  ->  F = (C − (1 − a)·M) / a).
   - El escalado se hace con alfa premultiplicado, para que el color de los píxeles
     transparentes no se mezcle en el borde.
3. Escalado a 1280x720 con Lanczos.

Uso: python scripts/procesar_fondos.py   (o npm run fondos)
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'arte_fuente' / 'originales'
DESTINO = RAIZ / 'public' / 'assets' / 'fondos'
TAM = (1280, 720)
CAPAS = {'fondo_lejano': False, 'fondo_medio': True, 'fondo_cercano': True}  # nombre: ¿tiene magenta?

MAGENTA = np.array([255.0, 0.0, 255.0])
AREA_MINIMA = 400   # px (en el original) para que una zona magenta cuente como fondo
BANDA = 3           # px de borde con alfa parcial


def recortar_16_9(img):
    ancho, alto = img.size
    objetivo = round(alto * 16 / 9)
    if objetivo <= ancho:
        x = (ancho - objetivo) // 2
        return img.crop((x, 0, x + objetivo, alto))
    alto_obj = round(ancho * 9 / 16)
    y = (alto - alto_obj) // 2
    return img.crop((0, y, ancho, y + alto_obj))


def quitar_magenta(rgb):
    """rgb: array HxWx3 en float 0-255. Devuelve (rgb sin magenta, alfa 0-1)."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    nucleo = (r > 170) & (b > 170) & (g < 90) & (np.abs(r - b) < 80)
    etiquetas, n = ndimage.label(nucleo)
    if n:
        areas = ndimage.sum(nucleo, etiquetas, index=np.arange(1, n + 1))
        grandes = np.zeros(n + 1, bool)
        grandes[1:] = areas >= AREA_MINIMA
        fondo = grandes[etiquetas]
    else:
        fondo = np.zeros_like(nucleo)
    # Cerrar huecos de 1 px dentro del fondo (ruido de compresión del generador).
    fondo = ndimage.binary_closing(fondo, iterations=1) | fondo

    # Magenta puro de cualquier tamaño (por ejemplo, el hueco de cada eslabón de las cadenas).
    puro = (r > 225) & (b > 225) & (g < 45)
    fondo = fondo | puro

    alfa = np.ones(r.shape)
    alfa[fondo] = 0.0
    banda = ndimage.binary_dilation(fondo, iterations=BANDA) & ~fondo
    # Cantidad de magenta: cuánto supera min(R, B) al verde, relativo a 255.
    k = np.clip((np.minimum(r, b) - g) / 255.0, 0.0, 1.0)
    # Vidrio sobre magenta (parte vacía de los frascos). El color se solapa con el de las
    # pociones moradas, así que se usa la conexión: el vidrio es la zona teñida
    # (|R − B| < 60, min(R, B) − G > 30) unida al magenta casi puro (R y B > 200, G < 60).
    # Las pociones moradas están separadas por el contorno negro y no se tocan.
    # Queda gris con alfa >= 0,35.
    mn = np.minimum(r, b)
    tenido = ~fondo & ~banda & (np.abs(r - b) < 60) & (mn - g > 30)
    semillas = (r > 200) & (b > 200) & (g < 60) & (np.abs(r - b) < 60)
    vidrio = ndimage.binary_propagation(semillas, mask=tenido | semillas | fondo | banda) & tenido
    alfa[banda] = np.clip(1.0 - k[banda] * 1.15, 0.0, 1.0)
    alfa[vidrio] = np.clip(1.0 - k[vidrio] * 1.15, 0.35, 1.0)
    parcial = banda | vidrio

    limpio = rgb.copy()
    a = alfa[..., None]
    con_borde = parcial & (alfa > 0.02)
    recuperado = (rgb - (1.0 - a) * MAGENTA) / np.maximum(a, 0.02)
    limpio[con_borde] = np.clip(recuperado[con_borde], 0, 255)
    # En el vidrio la separación color/magenta es ambigua (saldría verdoso): se deja un gris
    # con la luminosidad del canal verde, que es la parte del píxel que no aporta el magenta.
    gris = np.clip(g * 1.1 + 20, 0, 255)
    solo_vidrio = vidrio & (alfa > 0.02)
    limpio[solo_vidrio] = gris[solo_vidrio][:, None]
    limpio[~(alfa > 0)] = 0.0
    return limpio, alfa


def escalar_premultiplicado(rgb, alfa):
    rgba = np.dstack([rgb * alfa[..., None], alfa * 255.0]).round().clip(0, 255).astype(np.uint8)
    img = Image.frombytes('RGBa', (rgba.shape[1], rgba.shape[0]), rgba.tobytes())
    return img.resize(TAM, Image.LANCZOS).convert('RGBA')


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nombre, con_magenta in CAPAS.items():
        original = Image.open(ORIGEN / f'{nombre}.png').convert('RGB')
        recorte = recortar_16_9(original)
        if con_magenta:
            rgb, alfa = quitar_magenta(np.asarray(recorte, dtype=np.float64))
            salida = escalar_premultiplicado(rgb, alfa)
            transparente = (np.asarray(salida)[..., 3] == 0).mean() * 100
            detalle = f'{transparente:.1f} % transparente'
        else:
            salida = recorte.resize(TAM, Image.LANCZOS)
            detalle = 'opaca'
        ruta = DESTINO / f'{nombre}.png'
        salida.save(ruta, optimize=True)
        print(f'{nombre}: {original.size} -> recorte {recorte.size} -> {salida.size}, {detalle}, '
              f'{ruta.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
