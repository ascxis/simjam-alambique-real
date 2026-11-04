"""Sintetizador de efectos al estilo sfxr/jsfxr (onda cuadrada, sierra, seno y ruido,
envolvente ataque-sostenido-caída, deslizamiento de tono, cambio de nota, repetición y filtro).
Genera los efectos de docs/audio.md como WAV mono de 44,1 kHz y 16 bits."""
import numpy as np
import wave

SR = 44100
rng = np.random.default_rng(7)


def env(n, a=0.005, d=None, total=None):
    t = np.arange(n) / SR
    total = total or n / SR
    d = d if d is not None else total - a
    e = np.minimum(1, t / max(a, 1e-4))
    e *= np.clip(1 - (t - a) / max(d, 1e-4), 0, 1) ** 1.5
    return e


def osc(f, forma='cuadrada', duty=0.5):
    f = np.asarray(f, float)
    fase = np.cumsum(f) / SR % 1.0
    if forma == 'cuadrada':
        return np.where(fase < duty, 1.0, -1.0)
    if forma == 'sierra':
        return 2 * fase - 1
    if forma == 'seno':
        return np.sin(2 * np.pi * fase)
    raise ValueError(forma)


def ruido(n):
    return rng.uniform(-1, 1, n)


def pasa_bajos(x, fc):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * fc[i] / SR)
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def pasa_banda(x, fc, q=4.0):
    return pasa_bajos(x, fc * 1.4) - pasa_bajos(x, fc / 1.4)


def barrido(f0, f1, n, curva=1.0):
    t = np.linspace(0, 1, n) ** curva
    return f0 + (f1 - f0) * t


def notas(fs, dur):
    n = int(dur * SR)
    out = np.concatenate([np.full(n, f) for f in fs])
    return out


def guardar(nombre, x, pico_db=-3.0):
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (pico_db / 20)
    # rampa de 3 ms al final para evitar chasquidos
    r = int(0.003 * SR)
    x[-r:] *= np.linspace(1, 0, r)
    w = wave.open(nombre, 'wb')
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())
    w.close()


def n_(s):
    return int(s * SR)


def efectos():
    sfx = {}
    # ---- interfaz ----
    n = n_(0.12)
    sfx['sfx_interfaz_clic'] = (osc(np.full(n, 1400), 'cuadrada', 0.3) * env(n, 0.001, 0.06), -6)
    n = n_(0.20)
    sfx['sfx_interfaz_aceptar'] = (osc(barrido(600, 1200, n), 'cuadrada', 0.4) * env(n, 0.002), -6)
    sfx['sfx_interfaz_cancelar'] = (osc(barrido(900, 420, n), 'cuadrada', 0.4) * env(n, 0.002), -6)
    # ---- actuadores ----
    n = n_(0.40)
    t = np.arange(n) / SR
    tren = (np.sin(2 * np.pi * 22 * t) > 0.6).astype(float)  # trinquete del volante
    x = pasa_banda(ruido(n), 900) * (0.35 + tren) + 0.25 * osc(np.full(n, 110), 'sierra')
    sfx['sfx_actuador_mover'] = (x * env(n, 0.02, 0.38), -4)
    n = n_(0.20)
    x = osc(barrido(140, 55, n, 0.5), 'seno') + 0.6 * pasa_bajos(ruido(n), 600) * env(n, 0.001, 0.05)
    sfx['sfx_actuador_tope'] = (x * env(n, 0.001), -3)
    # ---- perturbaciones ----
    n = n_(0.50)
    t = np.arange(n) / SR
    campana = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in
                  [(392, 1.0, 5), (392 * 2.76, 0.5, 9), (392 * 5.4, 0.25, 14)])
    sfx['sfx_perturbacion_aviso'] = (campana * env(n, 0.003), -3)
    n = n_(0.60)
    fc = barrido(1800, 250, n, 0.7)
    x = pasa_bajos(ruido(n), fc) * 3 + 0.3 * osc(barrido(300, 90, n), 'seno')
    sfx['sfx_perturbacion_inicio'] = (x * env(n, 0.03, 0.55), -4)
    n = n_(0.40)
    x = osc(barrido(950, 280, n, 0.4), 'seno') * env(n, 0.002, 0.25)
    x[n_(0.18):] += 0.5 * osc(barrido(600, 900, n - n_(0.18)), 'seno') * env(n - n_(0.18), 0.002, 0.15)
    sfx['sfx_perturbacion_fin'] = (x, -6)
    # ---- resultado ----
    x = osc(notas([523.3, 659.3, 784.0, 1046.5], 0.16), 'cuadrada', 0.35)
    cola = osc(np.full(n_(0.26), 1046.5), 'cuadrada', 0.35) * np.exp(-np.arange(n_(0.26)) / SR * 8)
    x = np.concatenate([x, cola])
    sfx['sfx_resultado_superado'] = (x * env(len(x), 0.003, len(x) / SR), -4)
    n = n_(0.80)
    x = osc(barrido(220, 70, n, 0.6), 'sierra') * 0.7 + pasa_bajos(ruido(n), 1200) * np.linspace(0.2, 1, n)
    sfx['sfx_resultado_fallido'] = (pasa_bajos(x, 1500) * env(n, 0.01), -3)
    # ---- eventos del modelo ----
    x = osc(notas([988, 1319], 0.08), 'cuadrada', 0.5)
    x = np.concatenate([x, osc(np.full(n_(0.14), 1319), 'cuadrada', 0.5) * np.exp(-np.arange(n_(0.14)) / SR * 18)])
    sfx['sfx_modelo_en_banda'] = (x * env(len(x), 0.002, len(x) / SR), -5)
    n = n_(0.30)
    sfx['sfx_modelo_fuera_banda'] = (osc(barrido(420, 230, n), 'cuadrada', 0.5) * env(n, 0.003), -5)
    n1 = n_(0.24)
    t = np.arange(n1) / SR
    def campanita(f):
        return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * d) for k, a, d in [(1, 1, 7), (2.76, 0.4, 12)])
    x = np.concatenate([campanita(880), campanita(660), np.zeros(n_(0.02))])
    sfx['sfx_modelo_cambio_referencia'] = (x, -4)
    # alarma H: un tono ámbar medio, dos pulsos
    n = n_(0.50)
    t = np.arange(n) / SR
    puerta = ((t % 0.25) < 0.17).astype(float)
    sfx['sfx_alarma_h'] = (osc(np.full(n, 660), 'cuadrada', 0.5) * puerta * env(n, 0.002, 0.5), -2)
    # alarma HH: dos tonos agudos alternados con pulso rápido
    n = n_(0.75)
    t = np.arange(n) / SR
    f = np.where((t * 8) % 2 < 1, 1175, 1568)
    puerta = ((t % 0.125) < 0.10).astype(float)
    sfx['sfx_alarma_hh'] = (osc(f, 'cuadrada', 0.5) * puerta * env(n, 0.002, 0.75), -1)
    # desborde: rumor de líquido que cae y burbujas
    n = n_(1.00)
    t = np.arange(n) / SR
    rumor = pasa_bajos(ruido(n), barrido(2500, 700, n)) * 2.5
    burbujas = np.zeros(n)
    for _ in range(14):
        i0 = rng.integers(0, n - n_(0.08))
        m = n_(rng.uniform(0.03, 0.07))
        f0 = rng.uniform(300, 700)
        burbujas[i0:i0 + m] += osc(barrido(f0, f0 * 1.8, m), 'seno') * env(m, 0.002)
    x = rumor + 0.5 * burbujas
    sfx['sfx_modelo_desborde'] = (x * env(n, 0.01, 0.99), -2)
    return sfx


if __name__ == '__main__':
    for nombre, (x, pico) in efectos().items():
        guardar(f'{nombre}.wav', x.astype(float), pico)
        print(f'{nombre}.wav  {len(x) / SR:.2f} s')
