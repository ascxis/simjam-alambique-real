import sys
import numpy as np
import pandas as pd
import control as ct
import matplotlib.pyplot as plt
from scipy.optimize import least_squares


def cargar(ruta, entrada="u"):
    d = pd.read_csv(ruta)
    t = np.arange(d["t"].iloc[0], d["t"].iloc[-1], 1 / 30)   # paso uniforme
    u = np.interp(t, d["t"], d[entrada]); y = np.interp(t, d["t"], d["y"])
    return t - t[0], u - u[0], y - y[0]                     # variables de desviación


def modelo(p, orden):
    if orden == 1:
        K, tau = p
        return ct.tf([K], [tau, 1])
    K, zeta, wn = p
    return ct.tf([K * wn**2], [1, 2 * zeta * wn, wn**2])


def simular(G, t, u):
    _, y = ct.forced_response(G, T=t, U=u)
    return y


def metricas(y, ym):
    rmse = np.sqrt(np.mean((y - ym) ** 2))
    r2 = 1 - np.sum((y - ym) ** 2) / np.sum((y - np.mean(y)) ** 2)
    return rmse, r2


orden = int(sys.argv[1]) if len(sys.argv) > 1 else 1
entrada = sys.argv[2] if len(sys.argv) > 2 else "u"        # "u" o "u_crudo"
t, u, y = cargar("docs/ident_1.csv", entrada)
p0 = [1.0, 1.0] if orden == 1 else [1.0, 0.5, 3.0]
ajuste = least_squares(lambda p: simular(modelo(p, orden), t, u) - y,
                       p0, bounds=(1e-3, np.inf))
G = modelo(ajuste.x, orden)
print("Parámetros:", np.round(ajuste.x, 4)); print("G(s) =", G)
print("Polos:", np.round(G.poles(), 4))
print("Respuesta al escalón:", ct.step_info(G))

for nombre, ruta in [("identificación", "docs/ident_1.csv"), ("validación", "docs/valid_1.csv")]:
    tv, uv, yv = cargar(ruta, entrada)
    ym = simular(G, tv, uv)
    rmse, r2 = metricas(yv, ym)
    print(f"{nombre}: RMSE = {rmse:.4f} R2 = {r2:.4f}")
    plt.figure(); plt.plot(tv, yv, label="juego"); plt.plot(tv, ym, "--", label="modelo identificado")
    plt.xlabel("t (s)"); plt.ylabel("y"); plt.title(f"{nombre} (R² = {r2:.3f})"); plt.legend()
    plt.savefig(f"analisis/{nombre}.png", dpi=150)
plt.show()
