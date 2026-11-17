"""Regresión del modelo (guía del día 2, sección 5.7 a).

Compara las métricas de la respuesta al escalón de cada CSV con la línea base:
valor final (< 0,5 %), tiempo de subida del 10 al 90 % (< 2 %) y sobreimpulso
(< 1 punto porcentual). No compara punto a punto: el registro a 30 Hz desplaza el
instante del escalón algunos milisegundos según los FPS.

Uso: python analisis/regresion.py docs/dia2_escalon.csv docs/dia2_escalon_lento.csv
"""
import sys
import numpy as np
import pandas as pd


def cruce(t, yn, nivel):
    """Instante interpolado en que la respuesta normalizada cruza 'nivel'."""
    k = np.argmax(yn >= nivel)
    return t[k - 1] + (nivel - yn[k - 1]) / (yn[k] - yn[k - 1]) * (t[k] - t[k - 1])


def metricas(ruta):
    # utf-8-sig: el juego guarda el CSV con BOM para que las tildes se lean bien
    d = pd.read_csv(ruta, encoding="utf-8-sig")
    t, u, y = d["t"].to_numpy(), d["u"].to_numpy(), d["y"].to_numpy()
    k0 = np.argmax(np.abs(u - u[0]) > 1e-9)               # muestra del escalón
    y0 = y[max(k0 - 1, 0)]                                # valor antes del escalón
    yf = y[-max(1, len(y) // 10):].mean()                 # valor final
    yn = (y[k0:] - y0) / (yf - y0)                        # respuesta normalizada
    tr = cruce(t[k0:], yn, 0.9) - cruce(t[k0:], yn, 0.1)  # tiempo de subida 10-90 %
    mp = max(0.0, yn.max() - 1) * 100                     # sobreimpulso (%)
    return yf, tr, mp


yb, trb, mpb = metricas("docs/linea_base_escalon.csv")
print(f"línea base: valor final = {yb:.4f} tr = {trb:.3f} s                 Mp = {mpb:.2f} %")
for ruta in sys.argv[1:]:
    yf, tr, mp = metricas(ruta)
    e_yf, e_tr, e_mp = abs(yf - yb) / abs(yb), abs(tr - trb) / trb, abs(mp - mpb)
    pasa = e_yf < 0.005 and e_tr < 0.02 and e_mp < 1.0
    print(f"{ruta}: valor final {100 * e_yf:.2f} %, tr {100 * e_tr:.2f} %, "
          f"Mp {e_mp:.2f} puntos", "-> pasa" if pasa else "-> NO pasa")
