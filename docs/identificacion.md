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
