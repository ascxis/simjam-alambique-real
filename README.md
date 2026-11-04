# Alambique Real: El Arte de la Alquimia

Simulador 2D del **Operador de tanques** (simulador N.º 1 de la SimJam de Modelado y Simulación de Sistemas Continuos, Universidad de Pamplona). El jugador controla con las manos, frente a la cámara, las válvulas de uno o dos alambiques en cascada. El nivel de cada alambique sale de un modelo continuo no lineal integrado con RK4.

Integrantes: Juan David Bohorquez Prieto, Daniel Andres Galvis Marin, Andres Felipe Florez Mora — Grupo 1.

## Modelo

```
A·dh1/dt = 0,4·v1 − c1·√h1 − qd                (niveles 1 y 2)
A·dh2/dt = c1·√h1 − c2·v2·√h2 − qd             (nivel 3, cascada)
A = 1 m², c1 = c2 = 0,2 m^2,5/s, alturas de 0 a 3 m (a 3 m desborda)
```

- **Válvulas v1 y v2:** actuadores de 0 a 1 con una velocidad máxima de 0,25 1/s.
- **Integración:** RK4 con paso fijo h = 1/120 s, en `src/modelo/`.
- **Documentación:** el desarrollo completo (diagramas de Vensim, EDO, linealización, G(s), espacio de estados, verificación e identificación) está en [`docs/modelo.md`](docs/modelo.md) y [`docs/identificacion.md`](docs/identificacion.md).

## Requisitos

- Node.js 24 LTS (o 22 LTS) y npm.
- Navegador Chrome o Edge con cámara web. El juego debe abrirse en **localhost**: si se abre por una dirección IP, el navegador bloquea la cámara.
- Conexión a Internet: Phaser 3.87 y MediaPipe Tasks Vision 0.10.14 se cargan por CDN.
- Para el análisis (opcional): Python 3 con `numpy`, `pandas`, `scipy`, `matplotlib` y `control`.

## Ejecución

```bash
npm install          # instala las dependencias
npm run dev          # servidor de desarrollo (http://localhost:5173)
npm test             # pruebas del modelo (RK4, actuador, registro y comparación con Vensim)
npm run build        # compila la versión final en dist/
npm run preview      # sirve la versión compilada (http://localhost:4173)
npm run assets       # vuelve a procesar el arte de public/assets/originales/
```

Para el ZIP de entrega (con `index.html` en la raíz), en Windows:

```
cd dist
tar -a -cf ..\Grupo1_SimJam_Modelado.zip index.html assets favicon.ico favicon.svg icons.svg
```

## Controles

| Acción | Cámara (manos) | Teclado | Gamepad |
|---|---|---|---|
| Válvula de entrada v1 | Altura de la mano derecha | ↑ / ↓ | Stick derecho vertical |
| Válvula de salida v2 (nivel 3) | Pellizco de la mano izquierda (abierto = v2 abierta) | E / Q | Gatillo izquierdo |
| Pausa | Sacar las dos manos de la zona por más de 3 s | Enter | Start |
| Terminar la partida | — | F | — |
| Panel de parámetros y linealización | — | P | — |
| Panel de depuración (FPS, filtro α, mediciones) | — | D | Select (mantener) |

- **Fuente de control:** se elige en el menú, o con `?control=camara`, `?control=teclado`, `?control=gamepad` o `?control=escalon` (escalón de verificación del modelo).
- **Calibración:** se recomienda pulsar "Calibrar cámara" en el menú antes de jugar con las manos.

## Niveles

| Nivel | Objetivo | Criterio |
|---|---|---|
| 1. El Primer Destilado | Llevar h1 de 0,5 a 1,5 m | 30 s seguidos en ±10 % (máx. 120 s) |
| 2. La Demanda del Caldero Real | Mantener h1 en 1,0 m con un consumo de +0,08 m³/s entre 40 y 80 s | 80 % del tiempo en ±5 %, sin alarma HH |
| 3. El Elixir Doble en Cascada | Mantener h2 en 1,2 m y bajarlo a 0,8 m a los 75 s, con un consumo senoidal | 70 % del tiempo en ±5 %, sin desbordar |

Al terminar, la pantalla "Lo que pasó en el modelo" muestra las gráficas, las métricas (IAE, ISE, tiempo en banda, τ medido frente al teórico) y permite descargar el CSV de la partida (`t,u_crudo,u,x1,x2,y,v2,q_d,h_sp`).

## Estructura

```
src/
  vision/    cámara y MediaPipe Hand Landmarker
  entrada/   gestos, teclado, gamepad y escalón → señales de control
  modelo/    SistemaContinuo, RK4, actuadores, tanques, niveles y registro (sin Phaser)
  hmi/       tendencias, barras, alambiques, paneles y posiciones (layout.js)
  juego/     escenas de Phaser (Arranque, Menú, Calibración, Simulación, Fin)
test/        pruebas del modelo (node --test)
docs/        diseño, niveles, modelo, recursos, pruebas (5.9), identificación (5.10) y CSV
vensim/      modelos de Vensim (.mdl)
analisis/    identificar.py y gráficas de identificación y validación
scripts/     procesamiento del arte con sharp
PROMPTS.md   registro de los prompts usados con Gemini y Codex
```

## Identificación con Python

Desde la raíz del proyecto:

```bash
python analisis/identificar.py 1 u          # primer orden con la apertura real de la válvula
python analisis/identificar.py 1 u_crudo    # primer orden con la señal de la mano
python analisis/identificar.py 2 u_crudo    # segundo orden con la señal de la mano
```

El script usa `docs/ident_1.csv` (identificación) y `docs/valid_1.csv` (validación). Los resultados están en `docs/identificacion.md`.

## Créditos

- **Arte:** generado con Gemini (skill `director-arte-videojuegos`) y procesado con sharp. Ver `docs/recursos.md`.
- **Código:** desarrollado por la pareja con el asistente Codex. Todos los prompts y sus resultados están en `PROMPTS.md`.
- **Bibliotecas:** Phaser 3.87, MediaPipe Tasks Vision 0.10.14 y Vite.
