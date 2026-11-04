# Identificación del sistema con Python (sección 5.10)

Script: `analisis/identificar.py` (el de la guía, sin cambios). Criterio de validez: R² ≥ 0,90 con los datos de validación.

## a) Ensayos

| Archivo | Ensayo | Nivel | Duración |
|---|---|---|---|
| `docs/ident_1.csv` | Identificación: escalones de v1 hechos con la mano (ver abajo) | 1 | 120 s |
| `docs/valid_1.csv` | Validación: partida normal llevando h1 hacia 1,5 m | 1 | 67 s |

**Ensayo de identificación (adaptado):** la guía pide apertura máxima sostenida, regreso a reposo y luego la mitad, con escalones de al menos 4τ. Con v1 = 100 % el alambique desborda a los 26,6 s, antes de cumplir 4τ (unos 37–49 s), así que la "apertura máxima" se reemplazó por la mayor que no desborda en ese tiempo:

| Tramo | v1 |
|---|---|
| 0–5 s | 35 % (reposo; equilibrio en 0,5 m) |
| 5–45 s | 60 % (apertura máxima sin desbordar) |
| 45–85 s | 35 % (regreso a reposo) |
| 85–118 s | 48 % (la mitad del escalón) |

Antes de jugar, la pareja simuló otras opciones. Con un ensayo que solo recorre niveles bajos (de 0,5 a 1,0 m), la validación en una partida normal (hasta 1,5 m) daba R² ≈ 0,81 y no pasaba, porque el alambique no es lineal. Por eso el ensayo sube hasta ≈ 1,4 m.

**Limpieza de los datos:** la primera fila de los dos CSV (t = 0) traía u_crudo = 0,5, el valor por defecto antes de leer la mano, aunque la mano todavía no había movido nada; desde la segunda fila u_crudo = 0,3536. Como el script toma el primer valor como punto de operación, ese dato metía un corrimiento falso de −0,146 en toda la señal y daba R² negativos con u_crudo. Se quitó esa fila de los dos archivos y se corrigió el registro en el juego (PROMPTS.md, entrada 61).

## b) Resultados

`python analisis/identificar.py 1 u`, `1 u_crudo` y `2 u_crudo`:

| Entrada | Modelo | Parámetros identificados | R² identificación | R² validación | ¿Pasa? (≥ 0,90) |
|---|---|---|---|---|---|
| u (apertura real de la válvula) | Primer orden | K = 3,67 m, τ = 9,31 s | 0,997 | 0,991 | Sí |
| u_crudo (señal de la mano) | Primer orden | K = 3,75 m, τ = 10,82 s | 0,995 | 0,994 | Sí |
| u_crudo | Segundo orden | K = 3,70 m, ζ = 2,00, ωn = 0,378 rad/s → polos −0,101 y −1,411 s⁻¹ (τ1 = 9,87 s, τ2 = 0,71 s) | 0,998 | 0,993 | Sí |
| u_crudo | Primer orden con retardo (Padé) | K = 3,71 m, τ = 10,05 s, L = 0,61 s | 0,998 | 0,993 | Sí |

## c) Comparación con docs/modelo.md (punto 4)

Con la entrada u, el modelo identificado debe coincidir con el de `modelo.md`. Como el alambique no es lineal, K = 0,8·√h0/c y τ = 2A·√h0/c dependen del nivel. El ensayo recorre niveles de 0,5 a 1,49 m, con un nivel medio h̄ = 0,88 m:

| Parámetro | Identificado (u) | modelo.md en h̄ = 0,88 m | Diferencia |
|---|---|---|---|
| K (m) | 3,67 | 0,8·√0,88/0,2 = 3,75 | −2,1 % |
| τ (s) | 9,31 | 2·√0,88/0,2 = 9,38 | −0,7 % |

Los parámetros recuperados coinciden con el modelo, así que el procedimiento de identificación es válido. Si se identificara alrededor de h0 = 1,5 m, se obtendrían K = 4,90 m y τ = 12,25 s (los valores de la tabla de `modelo.md`).

## d) Qué parte de la dinámica es del juego y qué parte del sensor (punto 5)

- **Con u (la apertura real):** solo aparece el alambique, con τ ≈ 9,3 s.
- **Con u_crudo (la mano):** entre la mano y el alambique hay tres etapas más:
  1. la latencia de la cámara y de MediaPipe (una detección cada 50–70 ms);
  2. el filtro exponencial con α = 0,5 (τf ≈ 70–90 ms);
  3. el actuador, que solo puede cambiar 0,25 por segundo: para recorrer un cambio de 0,25 tarda 1 s.
- **Cómo se nota en los resultados:**
  - El primer orden con u_crudo da un τ mayor (10,8 s frente a 9,3 s).
  - El modelo con retardo separa un retardo L ≈ 0,6 s.
  - El segundo orden separa dos polos: uno lento, de τ1 ≈ 9,9 s, que es el **alambique**; y uno rápido, de τ2 ≈ 0,7 s, que es la **cadena cámara + filtro + válvula**.
- **Conclusión:** la dinámica lenta pertenece al modelo del juego, y los ≈ 0,6–0,7 s adicionales al sensor y al actuador. Como 0,7 s es pequeño frente a 9–12 s, la mano sirve bien para controlar el nivel.

## e) Análisis temporal y de sensibilidad (sección 5.10 d)

**Cómo se hizo:** con `?control=escalon` y el panel de parámetros (P), en el nivel 1. El alambique arranca en el equilibrio que corresponde a cada juego de parámetros con v1 = 0,612372. A los 2 s el mando sube 0,01 y la prueba dura 120 s. Archivos: `docs/sens_c1_m20.csv`, `sens_nominal.csv`, `sens_c1_p20.csv`, `sens_A_m20.csv` y `sens_A_p20.csv`. La sensibilidad se calcula como S = (ΔM/M)/(Δp/p) respecto al nominal.

**Parámetro variado: coeficiente de descarga c1**

| Parámetro variado | Valor | Valor final h1 (m) | Mp (%) | ts (s) | Sensibilidad S (valor final / ts) |
|---|---|---|---|---|---|
| c1 | −20 % (0,16) | 2,421 | 0 | 73,9 | −2,81 / −2,61 |
| c1 | Nominal (0,2) | 1,549 | 0 | 48,5 | — |
| c1 | +20 % (0,24) | 1,076 | 0 | 33,7 | −1,53 / −1,52 |

**Parámetro variado: área A**

| Parámetro variado | Valor | Valor final h1 (m) | Mp (%) | ts (s) | Sensibilidad S (valor final / ts) |
|---|---|---|---|---|---|
| A | −20 % (0,8 m²) | 1,549 | 0 | 38,9 | 0,00 / +0,99 |
| A | Nominal (1 m²) | 1,549 | 0 | 48,5 | — |
| A | +20 % (1,2 m²) | 1,549 | 0 | 58,0 | 0,00 / +0,98 |

**Comparación con el modelo:**
- **c1:** el equilibrio es h = (0,4·v1/c1)², así que h ∝ c1⁻² y la sensibilidad local es −2. Para cambios de ±20 % la fórmula da (0,8⁻² − 1)/(−0,2) = −2,81 y (1,2⁻² − 1)/0,2 = −1,53, exactamente lo medido. Como τ = 2A·√h/c1 ∝ A/c1², ts tiene casi la misma sensibilidad.
- **A:** el área no cambia el equilibrio (S = 0 en el valor final), pero τ y ts son proporcionales a A (S ≈ +1).
- **Mp:** vale 0 % en todos los casos, porque es un sistema de primer orden sin sobreimpulso.

## f) Preguntas de análisis

**1. ¿Coinciden los parámetros identificados con u y los de docs/modelo.md? ¿Qué error relativo tiene cada uno?**

Sí. Con u se identificó K = 3,67 m y τ = 9,31 s. Evaluadas en el nivel medio del ensayo (h̄ = 0,88 m), las fórmulas de `modelo.md` dan K = 0,8·√h̄/c = 3,75 m y τ = 2A·√h̄/c = 9,38 s. Los errores relativos son −2,1 % en K y −0,7 % en τ. La pequeña diferencia viene de ajustar un modelo lineal a un tanque no lineal que recorre niveles entre 0,5 y 1,49 m.

**2. ¿Cuánto aumentan τ o el retardo cuando se identifica con u_crudo? ¿Qué parte se debe al filtro (compárela con τ = −Ts/ln(1 − α)) y qué parte a la detección de la cámara?**

- **El aumento:**
  - el primer orden pasa de τ = 9,31 s (con u) a 10,82 s (con u_crudo), es decir, +1,5 s;
  - el modelo con retardo da τ = 10,05 s y L = 0,61 s;
  - el segundo orden separa un polo lento (τ1 = 9,87 s, el alambique) y uno rápido (τ2 = 0,71 s).
- **Qué hay entre la mano y la válvula:** u_crudo es la medida de la mano tal como llega de la cámara, y u es la apertura real de la válvula. Entre las dos están el filtro exponencial y el actuador con velocidad limitada.
- **El filtro:** con α = 0,5 y Ts = 50–63 ms, τf = −Ts/ln(1 − α) ≈ 72–91 ms. Es decir, unos 0,08 s, apenas una octava parte del retardo adicional.
- **La detección de la cámara:** muestrea cada Ts ≈ 55 ms, lo que equivale a un retardo de Ts/2 ≈ 0,03 s. Además, la latencia de MediaPipe (unos 40 ms por detección) ya va incluida en el instante en que llega cada muestra de u_crudo, así que casi no aparece en la identificación.
- **El actuador:** la mayor parte de los ≈ 0,6–0,7 s adicionales viene de él. La válvula solo puede cambiar 0,25 por segundo, así que un cambio de la mano de 0,25 tarda 1 s en llegar a la válvula: en promedio, unos 0,5 s de retardo.

**3. ¿El modelo identificado es estable? Justifique con los polos.**

Sí. Todos los polos tienen parte real negativa:
- primer orden con u: s = −1/9,31 = −0,107 s⁻¹;
- primer orden con u_crudo: s = −0,092 s⁻¹;
- segundo orden con u_crudo: s = −0,101 y −1,411 s⁻¹ (ζ = 2,0, sobreamortiguado, sin oscilación);
- con el retardo de Padé de orden 3, los polos de la aproximación también quedan en el semiplano izquierdo.

Como los modelos son de primer y de segundo orden, no hace falta el arreglo de Routh: con coeficientes del denominador todos positivos, el sistema es estable. Coincide con el ciclo B1 del diagrama causal: el alambique se autorregula, porque al subir el nivel sale más líquido.

**4. ¿Qué parámetro tiene mayor sensibilidad y cómo se nota esa sensibilidad en la jugabilidad?**

El coeficiente de descarga c1. Su sensibilidad es de −1,5 a −2,8 en el valor final y en ts, frente a 0 (valor final) y +1 (ts) para el área A.
- **Con c1 un 20 % menor:** el mismo v1 lleva el nivel a 2,42 m en lugar de 1,55 m, cerca de la alarma H (2,4 m), y el tanque tarda 74 s en estabilizarse en lugar de 48 s. El jugador tendría que cerrar mucho más la válvula y esperar más.
- **Con c1 un 20 % mayor:** el nivel cae a 1,08 m y responde más rápido.
- **Con A:** solo cambia la rapidez de respuesta; el nivel de equilibrio no se mueve.

En el juego, un orificio de salida distinto obliga a recalibrar por completo la apertura "correcta" de v1. Un tanque más ancho o más angosto solo lo hace más lento o más rápido.

**5. ¿Los datos de una sola partida son suficientes para identificar el modelo?**

Para este rango de operación, sí: el modelo identificado con ident_1 predice con R² = 0,991 otra partida distinta (valid_1). Pero tiene límites:
- **Excitación:** el ensayo tiene escalones de dos amplitudes (hasta 60 % y 48 %), con subida y bajada, y cada escalón dura más de 4τ. Con eso se ven bien la ganancia y la constante de tiempo. Un ensayo con un solo escalón pequeño, o con la mano casi quieta, no excitaría lo suficiente.
- **Ruido:** como el juego es una simulación, la salida h1 no tiene ruido de medida. El ruido de la mano entra por la entrada y es pequeño (0,03 pico a pico con α = 0,5), así que no afecta el ajuste.
- **No linealidad:** este es el límite principal. K y τ crecen con √h, así que un modelo identificado entre 0,5 y 1,49 m vale cerca de ese rango. Antes del ensayo, la pareja simuló un ensayo que solo llegaba a 1,0 m: la validación hasta 1,5 m daba R² ≈ 0,81 y no pasaba. Para otro punto de operación (por ejemplo, el nivel 3 o niveles cercanos a 2,5 m) haría falta otra partida de identificación en ese rango, o un modelo no lineal.
