"""Arma las hojas de estados del alambique simple y de la cascada a partir de un solo
cuerpo limpio (sin grifo), para que el cuerpo quede en los mismos píxeles en todos los
cuadros y estados (sin temblor). Guarda también los puntos de conexión medidos."""
import json
import numpy as np
from PIL import Image, ImageFilter

DESBORDE = '/home/claude/dia2/arte/efecto_desborde.png'


def cargar(f):
    return Image.open(f).convert('RGBA')


def brillo(body, pos, ancho=0.10, fuerza=0.14):
    a = np.asarray(body).astype(float)
    h, w = a.shape[:2]
    x = np.arange(w)[None, :] / w
    banda = np.exp(-((x - pos) / ancho) ** 2) * fuerza
    banda = np.repeat(banda, h, 0)[..., None]
    rgb = a[..., :3] + (255 - a[..., :3]) * banda
    out = np.dstack([rgb, a[..., 3]])
    return Image.fromarray(np.clip(out, 0, 255).astype('uint8'), 'RGBA')


def alarma(body, runas, escala):
    a = np.asarray(body).astype(float)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    rgb = a[..., :3].copy()
    for (cx, cy, r) in runas:
        cx, cy, r = cx * escala, cy * escala, r * escala
        d = np.hypot(xx - cx, yy - cy)
        m = (d < r) & (a[..., 3] > 0)
        lum = rgb[..., :3].mean(-1)
        base_l = np.median(lum[m])
        oscuro = m & (lum < base_l * 0.62)  # grabado de la runa y remaches
        rgb[oscuro] = rgb[oscuro] * 0.25 + np.array([255, 30, 50]) * 0.75
        rgb[m & ~oscuro] = rgb[m & ~oscuro] * 0.8 + np.array([255, 40, 60]) * 0.2
    cuerpo = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a[..., 3]]).astype('uint8'), 'RGBA')
    # resplandor rojo alrededor de la silueta
    al = body.split()[3]
    halo = al.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    glow = Image.new('RGBA', body.size, (255, 23, 68, 0))
    glow.putalpha(halo.point(lambda v: int(v * 0.8)))
    base = Image.new('RGBA', body.size, (0, 0, 0, 0))
    base.alpha_composite(glow)
    base.alpha_composite(cuerpo)
    return base


def desborde_frames():
    s = cargar(DESBORDE)
    n = 6
    w = s.width // n
    return [s.crop((k * w, 0, (k + 1) * w, s.height)) for k in range(n)]


def falla(body, dome_x, dome_y, dome_w, idx):
    fr = desborde_frames()[idx]
    bb = fr.getbbox()
    fr = fr.crop(bb)
    # quita el magenta
    a = np.asarray(fr).astype(int)
    mag = (a[..., 0] > 200) & (a[..., 1] < 60) & (a[..., 2] > 200)
    a[mag, 3] = 0
    fr = Image.fromarray(a.astype('uint8'), 'RGBA')
    s = dome_w / fr.width
    fr = fr.resize((max(1, int(fr.width * s)), max(1, int(fr.height * s))), Image.LANCZOS)
    out = body.copy()
    out.alpha_composite(fr, (int(dome_x - fr.width / 2), int(dome_y)))
    return out


def construir(nombre, cuerpo, alto_cuerpo, FW, FH, top, puntos, runas, dome_w_frac):
    body = cargar(cuerpo)
    esc = alto_cuerpo / body.height
    body = body.resize((round(body.width * esc), alto_cuerpo), Image.LANCZOS)
    ox = (FW - body.width) // 2
    oy = top

    def lienzo(img):
        c = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        c.alpha_composite(img, (ox, oy))
        return c

    dome_x = body.width / 2
    estados = {
        'reposo': [body],
        'funcionando': [brillo(body, p) for p in (0.25, 0.45, 0.65, 0.85)],
        'alarma': [alarma(body, runas, esc), body],
        'falla': [falla(body, dome_x, -8, body.width * dome_w_frac, i) for i in (1, 3, 4, 5)],
    }
    meta = {'frameWidth': FW, 'frameHeight': FH, 'cuadros': {}, 'puntos': {}}
    for est, frames in estados.items():
        hoja = Image.new('RGBA', (FW * len(frames), FH), (0, 0, 0, 0))
        for k, f in enumerate(frames):
            hoja.alpha_composite(lienzo(f), (k * FW, 0))
        hoja.save(f'{nombre}_{est}.png', optimize=True)
        meta['cuadros'][est] = len(frames)

    def frac(x, y):
        return [round((ox + x * esc) / FW, 4), round((oy + y * esc) / FH, 4)]

    for k, v in puntos.items():
        if len(v) == 2:
            meta['puntos'][k] = frac(*v)
        else:
            x0, x1, y0, y1 = v
            p0, p1 = frac(x0, y0), frac(x1, y1)
            meta['puntos'][k] = {'x': p0[0], 'y': p0[1], 'w': round(p1[0] - p0[0], 4), 'h': round(p1[1] - p0[1], 4)}
    json.dump(meta, open(f'{nombre}.json', 'w'), indent=2, ensure_ascii=False)
    return meta, esc, ox, oy


if __name__ == '__main__':
    m1 = construir('alambique_simple', 's_reposo_body.png', 620, 320, 680, 40, {
        'entrada': (462, 0), 'salida': (960, 1550), 'base': (450, 2100),
        'visor1': (408, 514, 430, 1194),
    }, [(461, 1448, 165)], 0.62)
    m2 = construir('alambique_cascada', 'c_reposo_body.png', 740, 320, 800, 40, {
        'entrada': (303, 0), 'salida': (633, 1744), 'base': (298, 2103),
        'visor1': (269, 339, 278, 566), 'visor2': (268, 340, 1219, 1532),
        'q12': (707, 769, 922, 1089),
    }, [(309, 700, 100), (300, 1705, 100)], 0.62)
    print(json.dumps(m1[0]['puntos'], indent=1)); print(json.dumps(m2[0]['puntos'], indent=1))
