# Pruebas de control — Alambique Real (sección 5.9)

La verificación numérica (5.9 a) está en docs/modelo.md, sección "Verificación del modelo (sección 5.9 a)".

## 5.9 b) Prueba de gestos

**Cómo se hizo:** en el nivel 3, con la vista de depuración (D) activa. Cada intento consiste en llevar la marca ▲ de la barra a la zona objetivo y sostenerla 1 s. Cada intento se cuenta así:
- **Acierto:** la ▲ llega a la zona en menos de 1 s y se mantiene.
- **No detectado:** la ▲ no se mueve o la mano aparece "fuera".
- **Falso:** con la mano quieta, la ▲ salta a otra zona, o se mueve la barra de la otra mano.

### Prueba 1 (punto 5): integrante 1, distancia normal de juego (sin medir)

| Gesto | Zona objetivo (▲) | Intentos | Aciertos | No detectados | Falsos | % acierto | Umbral final |
|---|---|---|---|---|---|---|---|
| Mano derecha arriba | v1 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Mano derecha abajo | v1 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |
| Pellizco izquierdo abierto | v2 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Pellizco izquierdo cerrado | v2 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |

### Punto 6: otro integrante y otras distancias

#### Prueba 2: integrante 1, 40 cm

| Gesto | Zona objetivo (▲) | Intentos | Aciertos | No detectados | Falsos | % acierto | Umbral final |
|---|---|---|---|---|---|---|---|
| Mano derecha arriba | v1 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Mano derecha abajo | v1 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |
| Pellizco izquierdo abierto | v2 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Pellizco izquierdo cerrado | v2 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |

#### Prueba 3: integrante 2, 40 cm

| Gesto | Zona objetivo (▲) | Intentos | Aciertos | No detectados | Falsos | % acierto | Umbral final |
|---|---|---|---|---|---|---|---|
| Mano derecha arriba | v1 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Mano derecha abajo | v1 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |
| Pellizco izquierdo abierto | v2 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Pellizco izquierdo cerrado | v2 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |

#### Prueba 4: integrante 1, 80 cm

| Gesto | Zona objetivo (▲) | Intentos | Aciertos | No detectados | Falsos | % acierto | Umbral final |
|---|---|---|---|---|---|---|---|
| Mano derecha arriba | v1 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Mano derecha abajo | v1 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |
| Pellizco izquierdo abierto | v2 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Pellizco izquierdo cerrado | v2 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |

#### Prueba 5: integrante 2, 80 cm

| Gesto | Zona objetivo (▲) | Intentos | Aciertos | No detectados | Falsos | % acierto | Umbral final |
|---|---|---|---|---|---|---|---|
| Mano derecha arriba | v1 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Mano derecha abajo | v1 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |
| Pellizco izquierdo abierto | v2 ≥ 90 % | 20 | 20 | 0 | 0 | 100 % | ≥ 90 % |
| Pellizco izquierdo cerrado | v2 ≤ 10 % | 20 | 20 | 0 | 0 | 100 % | ≤ 10 % |

#### Resumen de los puntos 5 y 6

| Prueba | Integrante | Distancia | Intentos | Aciertos | No detectados | Falsos | % acierto |
|---|---|---|---|---|---|---|---|
| 1 | 1 | Normal (sin medir) | 80 | 80 | 0 | 0 | 100 % |
| 2 | 1 | 40 cm | 80 | 80 | 0 | 0 | 100 % |
| 3 | 2 | 40 cm | 80 | 80 | 0 | 0 | 100 % |
| 4 | 1 | 80 cm | 80 | 80 | 0 | 0 | 100 % |
| 5 | 2 | 80 cm | 80 | 80 | 0 | 0 | 100 % |
| **Total** | | | **400** | **400** | **0** | **0** | **100 %** |

Los dos gestos superan con amplitud el mínimo del 90 % con los dos integrantes y a las dos distancias. Dos razones probables: el pellizco se mide como la distancia entre el pulgar y el índice dividida por el tamaño de la palma, así que casi no depende de la distancia a la cámara; y la altura se mide dentro de la zona de control, que ocupa el 80 % de la imagen, a cualquier distancia en que la mano quepa en la zona.

### Punto 7: efecto del filtro

**Cómo se midió:** en el panel D, con la altura de la mano derecha.
- **Ruido en reposo:** oscilación pico a pico del valor filtrado durante 2 s, con la mano quieta a media altura.
- **Retraso:** tiempo entre el momento en que la señal sin filtrar llega al 90 % de un salto brusco de abajo hacia arriba y el momento en que llega la señal filtrada. Se usa el promedio de 5 movimientos.
- **Valor teórico:** τ = −Ts / ln(1 − α); el retraso al 90 % es Ts · ln(0,1) / ln(1 − α).

| α del filtro | τ equivalente (ms) | Ruido en reposo (pico a pico) | Retraso observado (ms) | Retraso teórico (ms): rampa – escalón |
|---|---|---|---|---|
| 0,2 | 280–311 (Ts = 62–69 ms) | 0,0035 | ≈ 770 (4 movimientos; ver nota) | 250–280 – 640–720 |
| 0,5 | 70–90 (Ts = 49–63 ms) | 0,0333 | ≈ 161 (4 movimientos; ver nota) | 49–63 – 161–208 |
| 0,8 | 43–69 (Ts = 70–111 ms) | 0,08 (ver nota) | ≈ 39 (5 movimientos) | 17–28 – 99–159 |

**Retraso teórico, dos casos:**
- Si la señal sin filtrar salta de golpe (escalón), el filtro tarda Ts · ln(0,1) / ln(1 − α) en llegar al 90 %.
- Si la mano sube a velocidad constante (rampa), el filtro va detrás con un retraso de Ts · (1 − α) / α.
- Un movimiento brusco real queda entre los dos casos, y las mediciones caen en ese rango o muy cerca.

**Nota sobre el ruido con α = 0,8:** la primera medición dio 0,1988 porque la mano se movió un poco durante esos 2 s. Al repetirla con el codo apoyado en la mesa dio 0,08, y ese es el valor que se usa.

**Resultado:** al subir α, el retraso baja unas 20 veces (de 770 a 39 ms) y el ruido sube unas 23 veces (de 0,0035 a 0,08). Con α = 0,5 el ruido es 0,03 (±1,5 % de apertura) y el retraso 161 ms, un punto intermedio.

**α elegido: 0,5.** Razones:
- Con α = 0,2, el retraso (≈ 0,8 s) hace sentir lenta la respuesta de la barra.
- Con α = 0,8, la marca tiembla ±4 %, demasiado para mantener el nivel en la banda de ±5 % del nivel 2.
- Con α = 0,5, el retraso de 161 ms es pequeño frente a la válvula, que tarda 4 s de 0 a 100 %, y frente al alambique (τ ≈ 12 s). Además, la válvula y el alambique suavizan el temblor de ±1,5 %.

Antes de esta prueba, el juego usaba α = 0,35; desde aquí, el valor por defecto es 0,5.

**Nota sobre el último movimiento:** en cada medición, el último movimiento sale atípico: 4460 ms con α = 0,2 y 2776 ms con α = 0,5. Ese "movimiento" no es una de las subidas, sino la mano yendo a pulsar "Copiar medición": la señal cambia sin un salto limpio y el filtro tarda en alcanzarla. Por eso se descarta y se promedian los otros 4 de "media 5":
- α = 0,2: (5 · 1504,9 − 4459,9) / 4 ≈ 766 ms;
- α = 0,5: (5 · 683,6 − 2775,7) / 4 ≈ 161 ms.

### Punto 8: corrección de gestos

No fue necesaria: ningún gesto quedó por debajo del 90 % de aciertos en ninguna de las 5 pruebas.
