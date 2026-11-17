"""Arma las hojas de estados del equipo principal (alambique simple y cascada) a partir
de los sprites del día 1, con el MISMO tamaño de cuadro que el sprite original. Así el
juego cambia de textura sin mover el equipo ni sus visores (sin temblor ni saltos).

Estados (una fila por hoja, misma escala y posición en todos los cuadros):
  reposo 1 · funcionando 4 · falla 4 · alarma 2

Uso (desde la raíz del proyecto):  python scripts/hojas_equipo.py
Requiere: pip install pillow numpy
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
SPRITES = RAIZ / 'public' / 'assets' / 'sprites'
SALIDA = SPRITES / 'equipo'
EQUIPOS = {
    'alambique_simple': SPRITES / 'alambique_cuerpo_vacio.png',
    'alambique_cascada': SPRITES / 'alambique_cascada.png',
}
CUADROS = {'reposo': 1, 'funcionando': 4, 'falla': 4, 'alarma': 2}
LIQUIDO = np.array([92, 214, 120], float)  # verde de la poción (igual al visor)
ROJO = np.array([255, 40, 60], float)


def cargar(ruta):
    return np.asarray(Image.open(ruta).convert('RGBA')).astype(float)


def a_imagen(a):
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'), 'RGBA')


def brillo(a, pos, ancho=0.09, fuerza=0.16):
    """Reflejo diagonal que recorre el cobre: el equipo 'trabaja'. Solo aclara los
    píxeles ya visibles, así la silueta no cambia."""
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    u = (xx / w) + 0.35 * (yy / h)  # banda inclinada
    banda = np.exp(-((u - pos) / ancho) ** 2) * fuerza
    out = a.copy()
    out[..., :3] += (255 - a[..., :3]) * banda[..., None]
    return out


def borde_interior(alfa, radio):
    """Máscara (0..1) de la franja interior del contorno, para un resplandor sin
    salirse del cuadro."""
    m = Image.fromarray((alfa > 8).astype('uint8') * 255)
    erosion = m.filter(ImageFilter.MinFilter(2 * radio + 1))
    franja = np.asarray(m, float) - np.asarray(erosion, float)
    franja = Image.fromarray(franja.clip(0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(radio / 2))
    return np.asarray(franja, float) / 255.0


def alarma(a, fuerte=True):
    if not fuerte:
        return a.copy()
    out = a.copy()
    alfa = a[..., 3]
    lum = a[..., :3].mean(-1)
    # tinte rojo general suave y más fuerte en los remaches y bordes oscuros
    tinte = np.where(lum < 90, 0.45, 0.10) * (alfa > 8)
    out[..., :3] = out[..., :3] * (1 - tinte[..., None]) + ROJO * tinte[..., None]
    franja = borde_interior(alfa, 6) * 0.6
    out[..., :3] = out[..., :3] * (1 - franja[..., None]) + np.array([255, 23, 68]) * franja[..., None]
    return out


def falla(a, k, n=4, semilla=11):
    """Cobre oscurecido y chorreado de poción que escurre desde la tapa: el líquido
    rebasó el alambique. k = 0..n-1 avanza el chorreado."""
    rng = np.random.default_rng(semilla)
    out = a.copy()
    alfa = a[..., 3]
    visible = alfa > 8
    gris = out[..., :3].mean(-1, keepdims=True)
    out[..., :3] = (out[..., :3] * 0.55 + gris * 0.45) * 0.72  # quemado
    h, w = alfa.shape
    filas = np.where(visible.any(1))[0]
    top = filas.min()
    # columnas donde nace cada gota (sobre la tapa)
    cols = np.where(visible[top + int(0.06 * h)])[0]
    x0, x1 = cols.min(), cols.max()
    gotas = rng.uniform(x0 + 6, x1 - 6, 7)
    largos = rng.uniform(0.25, 0.75, 7)
    grosor = rng.uniform(2.5, 5.0, 7)
    yy, xx = np.mgrid[0:h, 0:w]
    capa = np.zeros((h, w))
    avance = (k + 1) / n
    for gx, lg, gr in zip(gotas, largos, grosor):
        ymax = top + (0.05 + lg * avance) * h
        ondula = gx + 1.5 * np.sin(yy / 9.0 + gx)
        cuerpo = (np.abs(xx - ondula) < gr) & (yy > top) & (yy < ymax)
        punta = (xx - gx) ** 2 + (yy - ymax) ** 2 < (gr * 1.5) ** 2
        capa = np.maximum(capa, (cuerpo | punta).astype(float))
    # charco en la tapa
    capa[top:top + int(0.05 * h)] = np.maximum(capa[top:top + int(0.05 * h)], 0.9)
    capa = np.asarray(Image.fromarray((capa * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8)), float) / 255
    capa *= visible
    liquido = LIQUIDO * (0.85 + 0.25 * np.sin(yy / 6.0 + k)[..., None])
    out[..., :3] = out[..., :3] * (1 - capa[..., None]) + liquido * capa[..., None]
    return out


def hoja(cuadros):
    h, w = cuadros[0].shape[:2]
    lienzo = np.zeros((h, w * len(cuadros), 4))
    for i, c in enumerate(cuadros):
        lienzo[:, i * w:(i + 1) * w] = c
    return a_imagen(lienzo)


def construir(nombre, ruta):
    a = cargar(ruta)
    h, w = a.shape[:2]
    estados = {
        'reposo': [a],
        'funcionando': [brillo(a, p) for p in (-0.05, 0.35, 0.75, 1.15)],
        'falla': [falla(a, k) for k in range(4)],
        'alarma': [alarma(a, True), alarma(a, False)],
    }
    SALIDA.mkdir(parents=True, exist_ok=True)
    meta = {'fuente': ruta.name, 'frameWidth': w, 'frameHeight': h, 'estados': {}}
    for estado, cuadros in estados.items():
        assert len(cuadros) == CUADROS[estado]
        archivo = f'{nombre}_{estado}.png'
        hoja(cuadros).save(SALIDA / archivo, optimize=True)
        meta['estados'][estado] = {'archivo': archivo, 'cuadros': len(cuadros)}
    (SALIDA / f'{nombre}.json').write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding='utf-8')
    return meta


if __name__ == '__main__':
    for nombre, ruta in EQUIPOS.items():
        m = construir(nombre, ruta)
        print(nombre, m['frameWidth'], 'x', m['frameHeight'], {k: v['cuadros'] for k, v in m['estados'].items()})
