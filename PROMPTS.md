# PROMPTS — Alambique Real: El Arte de la Alquimia

Registro, en orden, de los prompts usados en Gemini y en la vista Codex de ChatGPT Desktop.
Para cada uno se indica si funcionó, si hubo que corregirlo y qué errores de la IA detectó la pareja.

| N.º | Sección | Herramienta | Prompt | Resultado |
|---|---|---|---|---|
| 1 | 5.2 | Gemini (Skills) | Skill `disenador-juegos-simulacion` | Funcionó |
| 2 | 5.2 | Gemini (Skills) | Skill `director-arte-videojuegos` | Funcionó |
| 3 | 5.2 | Gemini | Prompt de diseño (3 ambientaciones) | Funcionó |
| 4 | 5.2 | Gemini | Desarrollar la idea elegida | Hubo que corregir (8 errores) |
| 5 | 5.2 | Gemini | Primera corrección del diseño | Hubo que corregir (6 errores) |
| 6 | 5.2 | Gemini | Segunda corrección del diseño | Funcionó; 1 ajuste manual |
| 7 | 5.3 e) | Gemini | Revisión crítica del modelo | Funcionó; la IA reportó errores inexistentes |
| 8 | 5.4 | Gemini | Guía de estilo e imagen de prueba | Funcionó |
| 9 | 5.4 | Gemini | Cambio de color de la poción | Funcionó |
| 10 | 5.4 | Gemini | Elemento: alambique | Hubo que corregir |
| 11 | 5.4 | Gemini | Corrección del alambique | Cuerpo aceptado; animación descartada |
| 12 | 5.4 | Gemini | Regenerar animación del alambique | No aceptado (otro diseño) |
| 13 | 5.4 | Gemini | Elemento: válvula | Hubo que corregir |
| 14 | 5.4 | Gemini | Corrección de la válvula | Solo entregó prompts |
| 15 | 5.4 | Gemini | Generar piezas de la válvula | Cuerpo aceptado; volante no generado |
| 16 | 5.4 | Gemini | Generar el volante | Funcionó |
| 17 | 5.4 | Gemini | Elemento: runa de alarma | Funcionó |
| 18 | 5.4 | Gemini | Escenario y baldosas | Fondo y baldosas aceptados; capas descartadas |
| 19 | 5.4 | Gemini | HMI, logotipo y fondo final | Útil; hubo que recortar en 3 archivos |
| 20 | 5.4 | Gemini | Lista final de recursos | Funcionó; 3 ajustes de la pareja |
| 21 | 5.6 | Codex | Prompt base común | Funcionó parcialmente; quedaron pendientes |
| 22 | 5.6 | Codex | Completar pendientes de la base | Funcionó (falta validar con cámara real) |
| 23 | 5.6 | Codex | Corregir menú y favicon | Funcionó |
| 24 | 5.6 | Codex | FPS, panel de depuración y signo de x | Panel y x corregidos; FPS limitados por la cámara |
| 25 | 5.6 | Codex | Escalón y panel de depuración en el menú | Dañó el menú; hubo que corregir |
| 26 | 5.6 | Codex | Restaurar el menú | Menú restaurado; el escalón aún se caía |
| 27 | 5.6 | Codex | Error 'altura' de undefined en el escalón | Funcionó |
| 28 | 5.6 | Codex | Gráficas de la pantalla final y formato del CSV | Funcionó |
| 29 | 5.6 | Codex | Reorganización en cuatro capas | Funcionó |
| 30 | 5.7 | Codex | Prompt específico: Operador de tanques + bloque común | Funcionó con errores |
| 31 | 5.7 | Codex | Correcciones del simulador de tanques | Tendencias corregidas; tecla F sigue fallando con cámara |
| 32 | 5.7 | Codex | Correcciones intermedias: reloj en tiempo real, Web Worker, mensajes en consola | Reloj corregido; el worker rompió MediaPipe y se revirtió; F sigue fallando con cámara |
| 33 | 5.7 | Codex | Fin de partida con cámara y FPS | Hubo que corregir (error al pulsar D) |
| 34 | 5.7 | Codex | Error "hs is not defined" al pulsar D | D funciona; F falla después de los 30 s |
| 35 | 5.7 | Codex | Reinicio del estado de la partida y diagnóstico de F | Funcionó |
| 36 | 5.7 | Codex | Banda de tolerancia en el alambique y avance del criterio | Funcionó |
| 37 | 5.7 | Codex | Prueba del modelo de tanques contra Vensim en los 20 s | Funcionó |
| 38 | 5.8 | Codex | Integración de personajes y escenarios (prompt de la guía) | Revertido con git stash; se repite después de corregir el nivel 3 |
| 39 | 5.7 | Codex | Correcciones del nivel 3: manos ausentes, calibración y dibujo en cascada | Funcionó |
| 40 | 5.7 | Codex | Ajustes de textos y de la banda en la simulación | Funcionó en parte |
| 41 | 5.7 | Codex | Textos de las barras de válvulas | Funcionó |
| 42 | 5.8 | Codex | Integración de personajes y escenarios (prompt de la guía, segundo envío) | Funcionó con errores |
| 43 | 5.8 | Codex | Correcciones de la integración del arte | Funciona, pero se ve mal |
| 44 | 5.8 | Codex | Rediseño visual: distribución, paneles y tipografía | Mejoró mucho; quedan detalles |
| 45 | 5.8 | Codex | Pulido visual: botones, pantalla final, planta y menú | Funcionó; quedan detalles menores |
| 46 | 5.8 | Codex | Últimos detalles visuales | Funcionó |
| 47 | 5.8 | Codex | Planta: cascada apilada (nivel 3) y alambique apoyado (niveles 1 y 2) | Funcionó con errores |
| 48 | 5.4 | Gemini | Nuevos elementos: mesa de laboratorio y Caldero Real | Funcionó |
| 49 | 5.8 | Codex | Planta: líquido del nivel 3, mesa, caldero y tuberías | Funcionó con errores |
| 50 | 5.8 | Codex | Uniones de tuberías, mesa en el piso y nivel 3 sobre la mesa | Funcionó; falta unir la salida del alambique (niveles 1 y 2) |
| 51 | 5.8 | Codex | Unión del tubo de salida con el alambique | Funcionó en parte |
| 52 | 5.8 | Codex | Salida soldada al cuerpo del alambique y flujo visible en el tubo | Funcionó |
| 53 | 5.8 | Codex | Rendimiento de la cámara y respuesta de las barras | Funcionó en parte |
| 54 | 5.8 | Codex | Calibración saturada y costo de los textos | Funcionó en parte (falla el paso de giro) |
| 55 | 5.8 | Codex | Sentido del giro y calibración solo de los canales usados | Funcionó |
| 56 | 5.9 a) | Codex | Escalón de verificación alrededor de 1,5 m y error de Euler en segundo orden | Funcionó |
| 57 | 5.9 b) | Codex | Medición del filtro: selector de α, ruido, τ y retraso | Funcionó en parte |
| 58 | 5.9 b) | Codex | Ajuste de la medición del retraso del filtro | Funcionó |
| 59 | 5.9 b) | Codex | α = 0,5 por defecto | Funcionó |
| 60 | 5.9 d) | Codex | Correcciones del playtest: ayuda del pellizco y marca de equilibrio | Funcionó |
| 61 | 5.10 | Codex | Primera fila del CSV con u_crudo correcto | Funcionó |
| 62 | 5.10 d) | Codex | Panel P para el análisis de sensibilidad (A y c1 ±20 %) | Funcionó |

---

## 1. Skill `disenador-juegos-simulacion` (5.2)

- **Herramienta:** gemini.google.com → Configuración → Skills → Create manually.
- **Contenido:** nombre, descripción e instrucciones copiados literalmente de la sección 5.2 de la guía.
- **Resultado:** funcionó; se invoca con `/disenador-juegos-simulacion`.

## 2. Skill `director-arte-videojuegos` (5.2)

- **Herramienta:** gemini.google.com → Configuración → Skills → Create manually.
- **Contenido:** nombre, descripción e instrucciones copiados literalmente de la sección 5.2 de la guía.
- **Resultado:** funcionó; se usará en la sección 5.4.

---

## 3. Prompt de diseño (5.2)

```
/disenador-juegos-simulacion
Vamos a diseñar nuestro simulador para la SimJam de Modelado y Simulación de
Sistemas Continuos.
- Simulador asignado: Operador de tanques
- Concepto de sistemas continuos: No linealidad, punto de operación y linealización; sistema hidráulico (U3, U4)
- Modelo de referencia: Tanques en cascada (hidráulico no lineal). Ecuación: A·dh₁/dt = q_in − c₁·√h₁; A·dh₂/dt = c₁·√h₁ − c₂·v₂·√h₂ − q_d. Parámetros iniciales: A = 1 m², c₁ = c₂ = 0,2 m^2,5/s, q_in = 0,4·v₁ m³/s, v₁ y v₂ de 0 a 1 (máx. 0,25 1/s), altura máxima 3 m. Linealizado: τ = 2A·√h₀/c y K = 2√h₀/c (τ = 10 s a 1 m).
- Niveles de referencia:
  Nivel 1. Llenado — Objetivo: llevar h₁ de 0,5 a 1,5 m y mantenerlo. Perturbaciones y parámetros: un tanque, sin perturbaciones. Criterio: 30 s seguidos en ±10 % (máx. 120 s).
  Nivel 2. Demanda variable — Objetivo: mantener h₁ en 1,0 m. Perturbaciones y parámetros: un tanque; consumo escalón de +0,08 m³/s entre los 40 y los 80 s. Criterio: 80 % del tiempo en ±5 % y sin alarma HH (120 s).
  Nivel 3. Cascada — Objetivo: mantener h₂ en 1,2 m y bajarlo a 0,8 m a los 75 s. Perturbaciones y parámetros: dos tanques; consumo senoidal de ±0,04 m³/s con período de 40 s. Criterio: 70 % del tiempo en ±5 % y sin desbordar ningún tanque (150 s).
- Control: manos con la cámara; alternativas gamepad y teclado.
Propón 3 ambientaciones. Cuando elijamos una, entrega el documento de diseño
completo, incluida la sección del modelo matemático.
```

- **Resultado:** funcionó. Gemini propuso 3 ambientaciones.
- **Elegida:** "Planta alquímica (fantasía mágica): eres el aprendiz de alquimista que controla los alambiques y calderas de destilación para abastecer el caldero principal del reino".

## 4. Desarrollar la idea elegida (5.2)

```
Desarrolla la idea <número> como documento de diseño completo
```

- **Resultado:** entregó el documento, pero **hubo que corregirlo**.
- **Errores de la IA detectados:**
  1. **Nombre "Potion-Craft"**: coincide con un juego comercial (*Potion Craft: Alchemist Simulator*), lo que prohíben las reglas de la SimJam. Además, la HMI decía "POÇÃO" (portugués).
  2. **v₂ ambigua** ("salida intermedia o final"): en el modelo de referencia v₂ es solo la válvula de salida del tanque 2.
  3. **Faltaban G(s) y el espacio de estados**, que la skill debía entregar.
  4. **Ganancia K = 10 sin aclarar la entrada**: es respecto a q_in. Respecto a la apertura v₁ es K_v1 = 0,4·10 = 4 m.
  5. **Controles distintos a la base del proyecto**: usaba palma/puño como aumentar/disminuir, un gesto de "juntar palmas" no permitido y teclas incorrectas (W/S, ESC).
  6. **Alcance contrario a la guía**: integraba con Euler dentro de Phaser (la guía exige RK4 en `src/modelo/`), ponía obligatorio el nivel 2 y dejaba como extra la pantalla final.
  7. **Alarmas incorrectas**: 2,5 m en lugar de H = 2,4 m y HH = 2,8 m.
  8. **Pantalla final con otras métricas** (MSE, ts, Mp) en lugar de las del prompt del simulador (tiempo en banda, IAE, nivel máximo, alarmas, τ medido frente a teórico); el nivel 3 agregaba "ni quede seco", que el Anexo C no pide.

## 5. Primera corrección del diseño (5.2)

```
/disenador-juegos-simulacion
Corrige el documento de diseño con estos cambios y entrégalo completo de nuevo en Markdown. No cambies la ambientación.

1. NOMBRE: "Potion-Craft" coincide con un juego comercial (Potion Craft: Alchemist Simulator). Propón un nombre original para el juego y úsalo en todo el documento. Corrige también "POÇÃO" por "POCIÓN".

2. MODELO:
- v2 es SOLO la válvula de salida del tanque 2 (alambique 2): c2·v2·√h2. La salida del tanque 1 (c1·√h1) no tiene válvula. Quita "salida intermedia o final".
- Agrega la función de transferencia G(s) del tanque 1 linealizado y su espacio de estados (A, B, C, D) en h0 = 1 m.
- Escribe la ganancia de dos formas: K = 2√h0/c = 10 s/m² respecto a q_in, y K_v1 = 0,4·K = 4 m respecto a la apertura v1 (es la que se identificará con los datos de v1 → h1).

3. CONTROLES (deben coincidir con la base del proyecto):
- v1: altura de la mano derecha (señal continua de 0 a 1). Gamepad: stick derecho vertical. Teclado: flechas arriba/abajo.
- v2: pellizco de la mano izquierda (señal continua de 0 a 1). Gamepad: gatillo izquierdo. Teclado: Q/E.
- Pausa: botón Start / tecla Enter. Quita el gesto de juntar las palmas; la simulación se pausa sola si las manos salen de la zona de control más de 3 s.
- No uses acciones separadas de "aumentar" y "disminuir": cada válvula es una sola acción continua.

4. ALARMAS: alarma H = 2,4 m y alarma HH = 2,8 m en color intenso; a 3 m el alambique desborda y termina la partida. Unifica estos valores en todo el documento.

5. HMI (criterio ISA-101): paneles con fondo neutro y color intenso solo para alarmas. Debe mostrar tendencias de h1, h2 y de la apertura de las válvulas v1 y v2 con la banda de tolerancia, y un panel con el modelo linealizado en el nivel actual: tau = 2·A·√h0/c y K = 2·√h0/c.

6. PANTALLA "LO QUE PASÓ EN EL MODELO": h(t) y v(t) con la banda, tiempo en banda, IAE, nivel máximo, alarmas activadas, y tau medido en el primer llenado frente al teórico; además la ecuación, los parámetros, un texto de 3 a 5 líneas que explique el concepto y el botón para descargar el CSV de la partida.

7. NIVEL 3: deja el criterio como en la referencia: 70 % del tiempo en ±5 % y sin desbordar ningún tanque (150 s). Quita "ni quede seco".

8. ALCANCE: corrígelo así:
- Obligatorio: modelo en una capa independiente de Phaser (src/modelo/), integrado con RK4 de paso fijo h = 1/120 s; nivel 1 completo con su criterio; control con las manos, gamepad y teclado; HMI con tendencias y alarmas; registro de la partida en CSV; pantalla "Lo que pasó en el modelo".
- Extras: niveles 2 y 3, y el nivel opcional "Piloto automático" (controlador P, q_in = Kp·(h_sp − h), donde la mano solo ajusta Kp, para comparar el IAE manual con el automático).
```

- **Resultado:** corrigió los 8 puntos (nombre nuevo: "Alambique Real: El Arte de la Alquimia"; cuentas verificadas: A = −0,1 s⁻¹, B = 0,4 m/s, G(s) = 4/(10s + 1), v₁₀ = 0,5). **Hubo que corregir otra vez.**
- **Errores de la IA detectados:**
  1. **q_d solo en el tanque 2**: en los niveles 1 y 2 (un solo alambique) el consumo debe restarse de h₁ ("último tanque en uso").
  2. **τ y K fijos en 10 s**: son del punto h₀ = 1 m, pero el nivel 1 opera en 1,5 m (τ ≈ 12,2 s, K_v1 ≈ 4,9 m). El panel debe usar el punto de operación de cada nivel.
  3. **Columnas del CSV distintas** a las de `registro.js` y del script de la sección 5.10 (t, u_crudo, u, x, y).
  4. **Texto educativo erróneo**: hablaba de "inercia térmica" (no hay nada térmico) y decía que τ = 10 s es fijo en un sistema no lineal.
  5. **La pantalla final no indicaba si se superó el nivel** ni con qué valor del criterio.
  6. **Se perdió la descripción decorativa de los escenarios**, necesaria para la skill de arte.

## 6. Segunda corrección del diseño (5.2)

```
/disenador-juegos-simulacion
Faltan estas correcciones. Entrega el documento completo de nuevo en Markdown sin cambiar lo demás:

1. PERTURBACIÓN: q_d se resta del último tanque en uso. En los niveles 1 y 2 (un solo alambique) la EDO es A·dh1/dt = 0,4·v1 − c1·√h1 − q_d. En el nivel 3 q_d se resta del alambique 2. Escríbelo así en el modelo.

2. PUNTO DE OPERACIÓN POR NIVEL: τ y K se calculan con el setpoint de cada nivel (h0 = h_sp), no siempre en 1 m. Agrega una tabla con h0, v10, τ, K y K_v1 de cada nivel. Nivel 1: h0 = 1,5 m (τ ≈ 12,2 s, K ≈ 12,2 s/m², K_v1 ≈ 4,9 m). Nivel 2: h0 = 1,0 m (τ = 10 s, K_v1 = 4 m). Nivel 3: calcula el linealizado de h2 en su punto de operación. El panel de la HMI y la comparación "τ medido en el primer llenado frente al teórico" usan los valores del nivel actual. Corrige también el bucle principal, que dice τ = 10 s fijo.

3. CSV: el registro guarda las columnas t, u_crudo (señal del gesto antes del filtro), u (apertura v1), x (h1, h2) y y (nivel controlado), con encabezados y unidades. Puede agregar v2, q_d y h_sp como columnas adicionales.

4. TEXTO EDUCATIVO: reescríbelo (3 a 5 líneas) sin mencionar inercia térmica. Debe explicar que el alambique responde más lento cuanto más lleno está porque τ = 2A√h0/c crece con la raíz de la altura (por ejemplo 10 s en 1 m y unos 12 s en 1,5 m), y que por eso las correcciones en v1 deben anticiparse.

5. PANTALLA FINAL: agrega el resultado del nivel: si el jugador lo superó o no y con qué valor del criterio (por ejemplo, segundos seguidos en banda o porcentaje del tiempo en banda).

6. ESCENARIOS: recupera los elementos decorativos del laboratorio de alquimia (estantes con frascos, pergaminos con ecuaciones, tubos de vidrio curvados, vitrales, candelabros) para el fondo del escenario. Solo los paneles de la HMI se mantienen en tonos neutros con color intenso para las alarmas.
```

- **Resultado:** funcionó. Se verificó la tabla de puntos de operación (v₁₀, τ, K y K_v1 de los cuatro casos son correctos).
- **Error de la IA detectado y corregido a mano:** puso las unidades dentro del nombre de las columnas del CSV (`t [s]`, `y_nivel [m]`...). El script `identificar.py` lee las columnas por nombre exacto (`d["t"]`, `d["u"]`, `d["y"]`, `d["u_crudo"]`) y fallaría. Se reemplazó a mano por: `t`, `u_crudo`, `u`, `x1`, `x2`, `y`, `v2`, `q_d`, `h_sp`, con las unidades en una nota aparte.
- **Observación para el modelo:** en el nivel 3 la tabla solo daba τ₂, pero v₁ → h₂ pasa por los dos alambiques y es de segundo orden: G(s) = 4,38/(10,95s + 1)². Se incluyó en `docs/modelo.md`.
- Documento final guardado como `docs/diseno.md`.

---

## 7. Revisión crítica del modelo (5.3 e)

Enviado en el mismo chat del diseño, con el contenido de `docs/modelo.md` pegado debajo:

```
/disenador-juegos-simulacion
Revisa el modelo de nuestro juego (pego docs/modelo.md abajo). Verifica:
unidades de cada término, signos, que la función de transferencia
corresponda a la EDO, que las matrices A, B, C, D sean correctas, los polos
y la estabilidad, y los valores de K, τ, ζ, ωn, Mp y ts. Señala cada error y
muestra el cálculo; no cambies el diseño del juego.
```

- **Resultado:** el modelo quedó validado **sin cambios**.
- **Error de la IA detectado:** Gemini anunció "6 errores específicos", pero al desarrollar cada punto concluyó que el valor del documento era correcto (unidades de K y B, K_v2 = −2,4 m, a₂₂, ts = 64 s, resultados de Vensim). Su resumen final dice que el modelo es "matemática y físicamente correcto".
- **Comprobación a mano:**
  - h₁(2 s) = (√0,5 − 0,2)² = 0,5071² = 0,2571 m (Vensim: 0,2572 m) ✔
  - ts del nivel 3: e^(−5,83)·(1 + 5,83) = 0,00294 × 6,83 ≈ 0,02 → ts = 5,83·τ ≈ 64 s ✔
  - Gemini estimó h₁(10 s) ≈ 1,81 m; Vensim da 1,796 m. Se conserva el valor de Vensim (1,80 m).
- **Decisión:** no se aceptó ninguna corrección porque ninguna era un error real.

---

## 8. Guía de estilo visual (5.4, paso 1)

Chat nuevo de Gemini, con `diseno.md` adjunto:

```
/director-arte-videojuegos
Adjunto el documento de diseño de nuestro juego (diseno.md).
Propón la guía de estilo visual (estilo, paleta en hexadecimal, contornos e
iluminación) acorde con el sistema físico que modela el juego, y genera una
imagen de prueba con el equipo principal de la planta sobre un fragmento del
escenario.
```

- **Resultado:** funcionó. Estilo 2D *painterly*, paleta de 8 colores más el contorno, e imagen de prueba aprobada por la pareja. Guardado en `docs/recursos.md`.
- **Observaciones de la pareja:**
  - Gemini cambió el color de la poción de verde (diseño) a ámbar `#FFB300`, muy cercano al amarillo de la alarma H `#FFD700`.
  - La HMI de la imagen de prueba tiene valores y ejes de relleno (sin relación con el modelo) y la palabra "Trends" en inglés; se toma solo como maqueta, ya que la HMI real se dibuja con Phaser.

## 9. Cambio de color de la poción (5.4, paso 1)

```
/director-arte-videojuegos
Cambia el color de la poción a verde esmeralda (por ejemplo #2ECC71) para que no se confunda con el amarillo de la alarma H (#FFD700). Mantén el resto de la guía de estilo y regenera la imagen de prueba.
```

- **Resultado:** funcionó. Poción en `#2ECC71`, resto de la paleta igual e imagen de prueba regenerada y aprobada. Se actualizó `docs/recursos.md`.
- **Observación:** al final, Gemini listó 4 "archivos de sprites" (`alambique_cuerpo.png`, `valvula_rotacion.png`, `fluido_animado.png`, `alarma_indicador.png`) que todavía no había generado; se tomaron solo como propuesta y cada elemento se pidió por separado en el paso 2.

## 10. Elemento: alambique de cobre (5.4, paso 2.1)

```
/director-arte-videojuegos
Crea el elemento Alambique de cobre (equipo principal), que en el simulador representa
"un tanque de nivel con visor de vidrio graduado, por donde entra líquido arriba y sale por un orificio en el fondo".
Descripción: Recipiente cilíndrico de cobre estilizado en 2D con un visor de vidrio graduado vertical para ver el nivel del líquido; laboratorio de alquimia; la poción es verde esmeralda #2ECC71.
Genera, respetando la guía de estilo y las reglas para Phaser:
1. Hoja de referencia con vista de frente y de lado.
2. Hoja de sprites del estado funcionando (burbujas suaves dentro del recipiente) con 4 cuadros en una sola fila, vista lateral, sobre fondo
   magenta #FF00FF.
3. Si el elemento cambia con una variable (nivel, apertura, temperatura),
   entrega la pieza en reposo y, por separado, la parte que el juego
   estirará o llenará.
Bordes nítidos, sin resplandor ni brillo que se mezcle con el fondo magenta.
```

- **Resultado:** parcialmente útil; **hubo que corregir**. Se conservó `alambique_columna_liquido.png` (columna de líquido separada, correcta).
- **Errores de la IA detectados:**
  1. Dibujó **dos alambiques apilados como un solo objeto** (referencia, animación y cuerpo vacío). El juego necesita un solo tanque: uno en los niveles 1 y 2 y dos copias en el nivel 3.
  2. **Cuadros inconsistentes** en la animación: en el cuadro 1 el tanque inferior está vacío y en los cuadros 2 a 4 tiene líquido pintado; el cuadro 1 además tiene un tubo extra. Un nivel de líquido fijo en la animación contradice el modelo, porque el nivel debe dibujarse con Graphics a partir de h(t) (guía 5.8, punto 5).
  3. La hoja de referencia trae texto en inglés ("FRONT VIEW / SIDE VIEW"); no afecta porque no se usa en el juego.

## 11. Corrección del alambique (5.4, paso 2.1)

```
/director-arte-videojuegos
Corrige el alambique con estos cambios, respetando la guía de estilo y las reglas para Phaser:
1. Dibuja UN SOLO alambique (un tanque), no dos apilados. En el juego se usa uno en los niveles 1 y 2, y dos copias en el nivel 3.
2. alambique_cuerpo_vacio.png: el tanque vacío con su visor de vidrio, entrada de tubería arriba y orificio de salida abajo; la ventana del visor recortada en magenta #FF00FF para que se vea el líquido que el juego dibuja detrás. Sobre fondo magenta #FF00FF.
3. alambique_anim_funcionando.png: hoja de sprites de 4 cuadros del mismo tamaño en una sola fila, con EXACTAMENTE el mismo tanque vacío, en la misma posición y escala en los 4 cuadros; lo único que cambia es un poco de vapor saliendo por la parte superior. Sin nivel de líquido pintado.
4. Conserva alambique_columna_liquido.png como está.
Sin texto, sin sombra en el piso. Bordes nítidos, sin resplandor ni brillo que se mezcle con el fondo magenta.
```

- **Resultado:** `alambique_cuerpo_vacio.png` **aceptado** (un solo tanque, visor recortado en magenta). La animación **no se aceptó**.
- **Errores de la IA detectados:**
  1. El cuerpo vacío no trae la tubería de entrada ni el orificio de salida; se aceptó igual porque esas conexiones las aportan la válvula o Graphics de Phaser.
  2. La animación usa **otro diseño de alambique** (sin pedestal, otra tapa, grifo lateral).
  3. El vapor es blanco **semitransparente sobre magenta**: al quitar el fondo en la 5.8 dejaría un halo rosado.

## 12. Regenerar la animación del alambique (5.4, paso 2.1)

```
/director-arte-videojuegos
Regenera alambique_anim_funcionando.png usando EXACTAMENTE el mismo diseño de alambique_cuerpo_vacio.png (misma tapa, mismo pedestal, mismo visor), 4 cuadros del mismo tamaño en una sola fila. En lugar de vapor, que lo único que cambie sea una pequeña luz verde esmeralda (#00E676) opaca en la tapa que se enciende y apaga. Sin transparencias, bordes nítidos, sobre fondo magenta #FF00FF.
```

- **Resultado:** **no se aceptó**. La luz verde opaca sí cambia entre cuadros y los 4 cuadros son consistentes entre sí, pero Gemini **volvió a ignorar la instrucción de usar el mismo diseño** del cuerpo vacío (sigue sin pedestal y con grifo lateral).
- **Decisión:** no se usa animación del alambique. Su diseño no la exige y el nivel de líquido lo dibuja el juego. Si se quiere un efecto, se hará con partículas de Phaser.

## 13. Elemento: válvula de latón (5.4, paso 2.2)

```
/director-arte-videojuegos
Crea el elemento Válvula de latón (actuador), que en el simulador representa
"la válvula de entrada v1 y la válvula de salida v2, con apertura de 0 a 1".
Descripción: Válvula de latón dorado con volante y engranajes expuestos, unida a un tramo corto de tubería de cobre horizontal; debe encajar con alambique_cuerpo_vacio.png.
Genera, respetando la guía de estilo y las reglas para Phaser:
1. Hoja de referencia con vista de frente y de lado.
2. Hoja de sprites del estado funcionando (el volante girando) con 4 cuadros del mismo tamaño en una sola fila, vista lateral, con EXACTAMENTE la misma válvula en la misma posición y escala; solo cambia el ángulo del volante. Sobre fondo magenta #FF00FF.
3. Si el elemento cambia con una variable (nivel, apertura, temperatura),
   entrega la pieza en reposo y, por separado, la parte que el juego
   estirará o llenará.
Sin texto, sin sombra en el piso. Bordes nítidos, sin transparencias ni resplandor que se mezcle con el fondo magenta.
```

- **Resultado:** **hubo que corregir**. La hoja de referencia y las piezas separadas (cuerpo sin volante y volante aislado) vinieron sobre magenta sólido, pero no sirven tal como están.
- **Errores de la IA detectados:**
  1. **Animación inconsistente:** el cuadro 1 es una válvula distinta (vista de frente con horquilla) y los cuadros 2 a 4 son otra (caja de engranajes lateral), aunque se pidió "exactamente la misma válvula".
  2. **Volante en perspectiva:** tanto en la animación como en `valvula_volante_aislado.png`, el volante está dibujado inclinado (como una elipse). Para que el juego lo gire con `angle` según la apertura v₁ debe verse de frente, como un círculo; si no, al rotarlo se deforma.
  3. El cuerpo estático tiene el vástago hacia arriba (volante horizontal), que no combina con un volante visto de frente.

## 14. Corrección de la válvula (5.4, paso 2.2)

```
/director-arte-videojuegos
Corrige la válvula para que el juego pueda girar el volante según la apertura v1 (de 0 a 1):
1. valvula_cuerpo_estatico.png: usa el diseño de la VISTA DE LADO de tu hoja de referencia (la caja de engranajes con el eje del volante apuntando hacia el espectador), unido al tramo de tubería de cobre horizontal, SIN el volante. Marca el centro del eje con un pequeño buje redondo.
2. valvula_volante_aislado.png: el mismo volante visto completamente DE FRENTE, como un círculo perfecto (no en perspectiva ni inclinado), centrado en la imagen, con los radios simétricos para que se vea bien al rotarlo.
No hagas hoja de animación: el juego rotará el volante por código.
Sobre fondo magenta sólido #FF00FF, sin texto, sin sombra en el piso, bordes nítidos, sin transparencias ni resplandor.
```

- **Resultado:** **hubo que repetir**. Gemini no generó imágenes; solo entregó dos prompts en inglés para generarlas (la skill lo permite cuando no puede generar).
- **Observación:** sugirió en el código `rotation = v1 * Math.PI * 2`; no se toma, porque la rotación del volante la programa Codex en la sección 5.7.

## 15. Generar las piezas de la válvula (5.4, paso 2.2)

```
/director-arte-videojuegos
Genera ahora las dos imágenes con los prompts que acabas de escribir: primero valvula_cuerpo_estatico.png y después valvula_volante_aislado.png, cada una sobre fondo magenta sólido #FF00FF.
```

- **Resultado:** `valvula_cuerpo_estatico.png` **aceptado**: una sola válvula, sin volante, tubería de cobre y fondo magenta sólido. El volante no se generó.
- **Errores de la IA detectados:**
  1. El cuerpo no usa la vista lateral pedida; es otra vez la vista de frente con el vástago hacia arriba. Se aceptó porque, en 2D, un volante de frente encima del vástago se entiende bien como válvula.
  2. No pudo generar la segunda imagen ("no fue posible generar directamente la segunda imagen") y solo entregó el prompt.

## 16. Generar el volante (5.4, paso 2.2)

```
/director-arte-videojuegos
Genera la imagen valvula_volante_aislado.png: flat 2D game asset sprite of a brass handwheel valve handle, direct front view, perfect 2D circular ring, 4 symmetrical spokes in a 90 degree cross, hexagonal nut in the center, centered on solid magenta background #FF00FF, crisp clean edges, no shadows, no text. Mismo estilo y colores de latón que valvula_cuerpo_estatico.png.
```

- **Resultado:** funcionó. Volante de latón visto de frente, círculo perfecto con 4 radios simétricos y tuerca hexagonal centrada, sobre magenta sólido. **Aceptado** como `valvula_volante_aislado.png`; el juego lo rotará por código según la apertura de la válvula.

## 17. Elemento: runa de alarma (5.4, paso 2.3)

```
/director-arte-videojuegos
Crea el elemento Runa de alarma (indicador), que en el simulador representa
"las alarmas de nivel alto H (2,4 m) y muy alto HH (2,8 m) del alambique".
Descripción: Placa pequeña de piedra o hierro con una runa grabada que se ilumina cuando hay alarma.
Genera, respetando la guía de estilo y las reglas para Phaser, dos imágenes por separado:
1. alarma_placa.png: la placa vista de frente, con el hueco de la runa vacío. Sobre fondo magenta sólido #FF00FF.
2. alarma_runa.png: solo el símbolo de la runa, en BLANCO puro opaco (#FFFFFF), del mismo tamaño y forma que el hueco de la placa, centrado, sobre fondo magenta sólido #FF00FF. El juego la colorea por código: gris apagada, amarillo #FFD700 en alarma H y rojo #FF1744 en alarma HH.
No hagas hoja de animación: el parpadeo lo hace el juego.
Sin texto, sin sombra en el piso, bordes nítidos, sin transparencias ni resplandor.
```

- **Decisión de la pareja:** en lugar de una hoja de animación con 3 estados (Gemini no mantenía el mismo dibujo entre cuadros), se pidió la runa en blanco por separado para colorearla por código (`setTint`). Así los estados apagada, H y HH salen de la misma imagen.
- **Resultado:** funcionó al primer intento. **Aceptados** `alarma_placa.png` (placa de piedra con el hueco de la runa en magenta) y `alarma_runa.png` (runa blanca opaca sobre magenta).
- **Observación:** el trazo de la runa blanca es un poco más irregular que el hueco de la placa; como el juego la superpone encima de la placa, no afecta.

## 18. Escenario: laboratorio del alquimista (5.4, paso 3)

```
/director-arte-videojuegos
Crea el escenario "Laboratorio del alquimista", que representa "una planta de tanques (alambiques) en cascada".
Ambiente: Laboratorio de alquimia subterráneo decorado con estantes llenos de frascos con elixires coloridos, pergaminos antiguos colgando con ecuaciones diferenciales anotadas a pluma, tubos de vidrio curvados con chispas mágicas circulando, vitrales góticos e iluminación tenue proveniente de candelabros de piedra.
Genera, respetando la guía de estilo:
1. Fondo lejano 16:9, sin elementos con los que se interactúe.
2. Capa media para parallax.
3. Capa cercana sobre fondo magenta #FF00FF.
4. Hoja de baldosas (tiles) de 64x64 píxeles para el piso y las
   plataformas, en una cuadrícula de 4 x 4.
No dibujes alambiques, válvulas ni tuberías principales: esos los pone el juego encima. Deja libre la zona central e izquierda para la planta y la zona derecha para los paneles de la HMI. Sin texto.
```

- **Resultado:** generó las 4 imágenes. Se **aceptaron** el fondo lejano (`fondo_laboratorio.png`: 16:9, sin alambiques, sin válvulas y sin texto) y la hoja de baldosas (`baldosas_laboratorio.png`). Las capas media y cercana **no se usan**.
- **Errores de la IA detectados:**
  1. **Capa media:** es casi la misma escena que el fondo lejano, más oscura y con zonas negras; no es una capa independiente para parallax.
  2. **Capa cercana:** es otra vez la escena completa con huecos magenta en la parte superior, en lugar de solo los elementos del primer plano sobre magenta.
  3. **Zona libre:** no se respetó del todo (hay estantes y una mesa en el centro y a la derecha). Se acepta porque la planta y los paneles de la HMI se dibujan encima, y el fondo se puede oscurecer en Phaser.
  4. **Baldosas:** las 16 piezas vienen separadas por líneas magenta (no se pidieron) y son de tipos distintos (piso de piedra, paneles, ladrillo, empedrado, tuberías, rejilla). Se acepta; para el piso se usa la primera fila (piedra).
- **Decisión de la pareja:** el juego es de **pantalla fija** (la cámara no se desplaza), así que el parallax no aporta; se usa un **fondo único**.

## 19. Interfaz (HMI), logotipo y fondo final (5.4, paso 4)

```
/director-arte-videojuegos
Crea los elementos de la interfaz del juego con la guía de estilo, en una sola
imagen en cuadrícula sobre fondo magenta #FF00FF: indicador de nivel del alambique, ícono de válvula (apertura), ícono de alarma H, ícono de alarma HH, ícono de setpoint (nivel objetivo), ícono de mano detectada por la cámara, ícono de reloj (tiempo del nivel), ícono de pausa. Los íconos simples y legibles en tamaño pequeño, en tonos neutros (#3A3D40 y gris claro), con color intenso solo en los íconos de alarma (#FFD700 alarma H, #FF1744 alarma HH). Sin texto dentro de los íconos.
Aparte, crea el logotipo del título "Alambique Real: El Arte de la Alquimia" y un fondo neutro para
la pantalla "Lo que pasó en el modelo", con espacio libre para dos gráficas.
```

- **Resultado:** útil, pero hubo que separar piezas. Se **aceptaron** el logotipo y el panel de la pantalla final, recortados de la imagen.
  - **Logotipo:** "Alambique Real" y "El Arte de la Alquimia" bien escritos, sin errores de ortografía.
  - **Pantalla final:** panel de piedra gris oscura con dos cuadrículas vacías para las gráficas h(t) y v(t) y un espacio para el botón del CSV.
  - **Íconos:** los 8 pedidos, en cuadrícula de 4 × 2 (nivel, válvula, alarma H, alarma HH, setpoint, mano, reloj de arena y pausa).
- **Errores de la IA detectados:**
  1. Puso **las tres piezas en una sola imagen** (íconos, logotipo y panel), aunque en su tabla las lista como tres archivos separados. Se recortaron en tres archivos separados.
  2. Los íconos de **alarma H y HH traen la palabra "NO"**, aunque se pidió "sin texto dentro de los íconos".
  3. Indica la carpeta `src/assets/`, pero el proyecto usa `public/assets/` (guía, secciones 5.6 y 5.8).

---

## 20. Lista final de recursos (5.4, paso 6)

```
/director-arte-videojuegos
Entrega la lista final de recursos en Markdown con nombre de archivo, tamaño de cada cuadro y número de cuadros.
Incluye SOLO estos 11 archivos, que son los que aceptamos (no incluyas animaciones ni capas descartadas):
alambique_cuerpo_vacio.png, alambique_columna_liquido.png, valvula_cuerpo_estatico.png, valvula_volante_aislado.png, alarma_placa.png, alarma_runa.png, fondo_laboratorio.png, baldosas_laboratorio.png, interfaz_iconos.png, logotipo_titulo.png, pantalla_post_partida.png.
El juego corre a 1280x720 en Phaser 3 y la escala es 1 m = 100 px (el alambique mide 3 m de alto, unos 300 px). Indica para cada archivo el tamaño final recomendado en el juego y en qué grupo va: equipo principal, actuadores, perturbaciones, indicadores y alarmas, escenario, baldosas o interfaz.
```

- **Decisión de la pareja:** se amplió el prompt de la guía con la lista de los 11 archivos aceptados y la escala del juego, para que Gemini no incluyera animaciones ni capas descartadas.
- **Resultado:** funcionó; entregó la lista agrupada solo con los 11 archivos. Guardada en `docs/recursos.md`.
- **Errores de la IA detectados y corregidos:**
  1. La columna "tamaño original" no coincide con los archivos reales (por ejemplo, los recortes de la HMI miden 493 × 251, 416 × 266 y 483 × 559 px).
  2. Propuso el panel final a 1280 × 720, pero el panel es vertical (proporción ≈ 0,86): estirarlo lo deformaría. Se fijó en 588 × 680.
  3. Se fijó el alambique en 300 px de alto para respetar la escala 1 m = 100 px.

---

## 21. Prompt base común (5.6)

- **Herramienta:** vista Codex de ChatGPT Desktop, con la carpeta `juego-simulacion` abierta.
- **Prompt:** el de la sección 5.6 de la guía, literal, con estos datos:
  - Nombre del juego: Alambique Real: El Arte de la Alquimia
  - Simulador: Operador de tanques
  - Concepto de sistemas continuos: No linealidad, punto de operación y linealización; sistema hidráulico (U3, U4)
- **Resultado:** funcionó parcialmente.
  - Creó la arquitectura de cuatro capas (cámara y gestos, gamepad, teclado y escalón; integradores Euler y RK4, actuador, registro CSV, métricas y niveles; HMI; escenas de arranque, menú, calibración, simulación y resultados).
  - Respetó `index.html` y `vite.config.js`.
  - `npm test` pasó las 3 pruebas: error máximo de RK4 de 3,53 × 10⁻¹⁰ (primer orden) y 1,33 × 10⁻⁸ (segundo orden), menores que 1e-4. `npm run build` también pasó.
- **Pendientes reconocidos por Codex:**
  1. No implementó la elección de cámara cuando hay varias (`enumerateDevices`).
  2. No implementó la opción para intercambiar las etiquetas derecha/izquierda.
  3. La calibración guiada, la detección y la vista de depuración quedaron como "implementación inicial", sin validar con cámara real.
- **Observación:** Codex no pidió permisos antes de crear archivos ni de ejecutar comandos, así que los cambios se revisaron con `git status` antes del commit.

---

## 22. Completar los pendientes de la base común (5.6)

```
Completa lo que quedó pendiente de la base común, sin cambiar lo que ya funciona:
1. Selección de cámara: si enumerateDevices encuentra más de una cámara, permite elegirla desde el menú y recuerda la elección en localStorage (dentro de try/catch).
2. Opción para intercambiar las etiquetas derecha/izquierda si salen invertidas por el espejo, accesible desde el menú y desde la vista de depuración, guardada en localStorage.
3. Revisa que la calibración cumpla la guía: por cada mano, cuenta de 3 segundos en cada paso (mano abajo, mano arriba, pellizco cerrado, pellizco abierto, giro a la izquierda y a la derecha); guarda el rango de cada señal en localStorage y se puede repetir desde el menú.
4. Revisa que la vista de depuración (tecla D o botón Select) muestre: video en espejo en una esquina, los 21 puntos de cada mano con su etiqueta, FPS de detección, el valor de cada señal antes y después del filtro, tau = -Ts/ln(1-alfa) y el estado x(t) del modelo.
5. Revisa que funcionen: la pausa "Muestra las manos" si las dos manos salen de la zona más de 3 s (sin integrar el modelo), el aviso si la detección baja de 15 FPS, y el mensaje con ofrecimiento de gamepad o teclado si no hay cámara o se niega el permiso.
No instales phaser ni @mediapipe/tasks-vision por npm. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build y explica qué cambiaste.
```

- **Resultado:** funcionó. Agregó la elección de cámara y el intercambio de etiquetas (ambos guardados en `localStorage`), la calibración de 6 pasos por mano con cuenta de 3 s (repite el paso si no detecta la mano), la vista de depuración completa (incluye Ts, α y τ del filtro), la pausa "Muestra las manos", el aviso de menos de 15 FPS y el cambio a gamepad o teclado si falla la cámara.
- `npm test` (3 pruebas) y `npm run build` pasaron. No modificó `docs/`, `vensim/`, `index.html`, `vite.config.js` ni `PROMPTS.md`.
- **Pendiente:** Codex no pudo probar la cámara física; se valida con la lista de verificación de la sección 5.6.

---

## 23. Corrección del menú y del favicon (5.6)

```
En el menú hay dos problemas:
1. Los <select> HTML (fuente de control y cámara) usan position: absolute con coordenadas de la página, por eso quedan fuera del área del juego y tapan el texto "Nivel de práctica" cuando cambia el tamaño de la ventana. Corrígelo para que siempre queden alineados con el canvas y se escalen con él (escalado FIT): usa los DOM Elements de Phaser 3.87 (this.add.dom, con dom: { createContainer: true } en la configuración del juego) o reemplázalos por selectores dibujados con Phaser. El selector de fuente de control debe quedar justo debajo del texto "Fuente de control", y el de cámara junto a "Intercambiar derecha / izquierda", sin tapar ningún texto.
2. La consola muestra "favicon.ico 404 (Not Found)". Crea public/favicon.ico (puede ser una copia o conversión de public/favicon.svg) para que no haya errores 404. No modifiques index.html.
No cambies la lógica de control, cámara ni modelo. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build.
```

- **Errores de la IA detectados (en el prompt anterior):**
  1. Los selectores del menú estaban posicionados con coordenadas fijas de la página: quedaban fuera del área del juego y tapaban el texto "Nivel de práctica".
  2. El navegador pedía `favicon.ico` y respondía 404, que la sección 5.11 pide evitar.
- **Resultado:** funcionó. Los selectores quedan alineados con el canvas con la ventana grande y con las herramientas F12 abiertas (ventana reducida), y la consola ya no muestra el error 404.

---

## 24. FPS, panel de depuración y signo de x (5.6)

```
Tres correcciones de la base:
1. La detección corre a unos 14 FPS (la guía exige 20 o más). Reduce la resolución del video de la cámara a 480x360, como indica la guía, y asegúrate de que detectForVideo se ejecute como máximo una vez por cuadro nuevo de video (sin detecciones repetidas sobre el mismo cuadro).
2. El panel de texto de la vista de depuración (tecla D) usa posición fija de la página: queda parcialmente fuera del área del juego y tapa el título. Ubícalo dentro del canvas (por ejemplo en la esquina superior izquierda del área del juego, con fondo semitransparente) y que se escale con él, igual que se corrigieron los selectores del menú.
3. La señal x está invertida: con la imagen en espejo, la mano derecha que se ve a la derecha del video marca x negativo (por ejemplo -0.84). Según la guía, x va de -1 (izquierda) a 1 (derecha) con la imagen en espejo. Corrige solo el signo de x en src/entrada/gestos.js; las etiquetas derecha/izquierda ya son correctas y no deben cambiar.
No cambies la lógica de los demás gestos, el modelo ni las escenas. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build.
```

- **Errores de la IA detectados (en los prompts anteriores):** la detección iba a 14,4 FPS (la guía pide 20 o más), el panel de depuración se salía del área del juego y la señal x tenía el signo invertido (mano derecha con x negativo).
- **Resultado:**
  - El panel de depuración quedó dentro del canvas y la x quedó corregida (mano derecha x = +0,79; izquierda x = −0,71).
  - Los FPS no cambiaron: Ts = 0,0694 s antes y después (≈ 14,4 FPS). Como la detección ya corre una vez por cuadro de video, el límite era la cámara, que con contraluz entrega menos cuadros por segundo.
- **Solución aplicada por la pareja:** mejorar la iluminación (luz de frente, sin contraluz) y no grabar la pantalla durante la prueba. Con eso la detección llegó a unos 20 FPS, aunque no de forma constante.
- **Etiquetas:** se verificó que la mano derecha mueve el actuador y la izquierda no, así que no hace falta intercambiar las etiquetas.

---

## 25. Escalón y panel de depuración en el menú (5.6)

```
Dos errores en el menú:
1. Al abrir la URL con ?control=escalon, el selector de "Fuente de control" desaparece (queda vacío) y al pulsar "Iniciar simulación" no pasa a la escena de simulación. Corrígelo: con ?control=escalon (y con ?control=teclado, ?control=gamepad o ?control=camara) el selector debe mostrar la fuente correspondiente ya seleccionada, incluida la opción "Escalón de prueba", y "Iniciar simulación" debe arrancar la simulación con esa fuente. En modo escalón, der.altura pasa de 0 a 1 a los 2 s sin usar la cámara.
2. El panel de la vista de depuración (con la casilla "Intercambiar etiquetas der./izq.") aparece en el menú encima del título aunque no se haya pulsado D. Debe mostrarse solo durante la simulación y solo cuando la vista de depuración está activa.
No cambies la lógica de gestos ni el modelo. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build, y comprueba que con ?control=escalon la simulación inicia y la pantalla final permite descargar el CSV.
```

- **Errores detectados por la pareja antes del prompt:** con `?control=escalon` el selector de fuente desaparecía y la simulación no arrancaba; el panel de depuración aparecía en el menú sobre el título.
- **Resultado:** **hubo que corregir.** Codex reemplazó el selector por un control dibujado con Phaser.
- **Errores de la IA detectados:**
  1. El nuevo selector **no se desplegaba**, así que no se podía cambiar la fuente de control.
  2. **Eliminó** del menú el selector de cámara y la casilla "Intercambiar derecha / izquierda".
  3. El panel de depuración **siguió apareciendo** en el menú.
  4. Intentó usar "Computer Use" para controlar el navegador del equipo y se detuvo sin verificar.

## 26. Restaurar el menú (5.6)

```
La corrección anterior dañó el menú. Tres problemas:
1. El nuevo selector de "Fuente de control" dibujado con Phaser no se despliega al hacer clic, así que no se puede cambiar la fuente. Vuelve a usar un <select> HTML creado con this.add.dom (que sí funcionaba y se escalaba bien), con las opciones Cámara, Gamepad, Teclado y Escalón de prueba, y conserva la preselección desde ?control=.
2. Desaparecieron del menú el selector de cámara y la casilla "Intercambiar derecha / izquierda". Deben volver a estar a la derecha, junto al botón "Probar / actualizar cámaras", como antes.
3. El panel de depuración (con la casilla "Intercambiar etiquetas der./izq.") sigue apareciendo en el menú encima del título. Debe crearse solo en la escena de simulación, ocultarse mientras no se pulse D y destruirse al salir de esa escena.
Además confirma que con ?control=escalon, "Iniciar simulación" arranca la simulación sin pedir la cámara.
No intentes controlar el computador ni el navegador: nosotros hacemos las pruebas. No cambies la lógica de gestos ni el modelo. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build.
```

- **Resultado según Codex:** restauró el `<select>` HTML con las 4 fuentes y la preselección desde `?control=`; devolvió el selector de cámara y la casilla de intercambio; el panel de depuración solo existe en la simulación y se oculta hasta pulsar D. Verificó en código que `der.altura` vale 0 antes de los 2 s y 1 después. `npm test` y `npm run build` pasaron.
- **Resultado en el navegador:** el menú quedó bien (selector con "Escalón de prueba", selector de cámara y casilla de intercambio), pero al pulsar "Iniciar simulación" el juego se caía (entrada 27).

---

## 27. Error al iniciar el escalón (5.6)

```
Al pulsar "Iniciar simulación" con ?control=escalon el juego se cae con este error en la consola del navegador:

Uncaught TypeError: Cannot read properties of undefined (reading 'altura')
    at main.js:134:178
    at Array.map (<anonymous>)
    at formatMano (main.js:134:143)
    at Simulacion.update (main.js:135:221)

Corrígelo así:
1. Todas las fuentes de entrada (cámara, gamepad, teclado y escalón) deben entregar exactamente la misma estructura de "controles", incluidas las señales crudas de cada mano (der e izq), aunque sea con el último valor o con 0. El registro CSV también necesita u_crudo en todas las fuentes.
2. formatMano y el texto de depuración no deben fallar si falta algún dato, y solo deben calcularse cuando la vista de depuración está activa (no en cada cuadro con el panel oculto).
3. Revisa si hay otros accesos a controles.der / controles.izq / datos crudos en Simulacion.update u otras escenas que puedan fallar con gamepad, teclado o escalón, y protégelos igual.
4. Agrega a test/modelo.test.js (o a un test nuevo con node:test) una prueba que cree la fuente escalón y verifique que entrega la estructura completa de controles con der.altura = 0 antes de 2 s y 1 después.
No intentes controlar el computador ni el navegador: nosotros probamos. No cambies el modelo. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build.
```

- **Error de la IA detectado:** la fuente escalón no entregaba las señales crudas de cada mano y la escena de simulación las leía en cada cuadro (aunque el panel de depuración estuviera oculto), lo que tumbaba el juego al iniciar.
- **Resultado:** funcionó. Las cuatro fuentes entregan la misma estructura, la depuración solo se calcula cuando está activa y se agregó una prueba automática de la fuente escalón.
- **Verificación de la pareja (escalón con K = 1, τ = 5 s):** el escalón entra en t = 2,0 s; en t = 7,0 s el CSV da y = 0,6327 (teórico 1 − e⁻¹ = 0,6321); valor final 0,99086 en t = 25,5 s (teórico 0,99084); error máximo frente a la solución analítica en toda la curva: 7 × 10⁻⁶. La pantalla final muestra ts = 21,56 s (= 2 + 5·ln 50) y Mp = 0 %.

## 28. Gráficas de la pantalla final y formato del CSV (5.6)

```
La prueba con ?control=escalon funciona y el modelo es correcto, pero hay dos problemas en la pantalla final y el registro:
1. Las gráficas de "Lo que pasó en el modelo" no muestran la partida: se ve solo una línea en el borde superior. Deben dibujar TODA la partida, con el eje del tiempo desde 0 hasta la duración total: u(t) debe verse como un escalón de 0 a 1 a los 2 s y y(t) como la curva que sube de 0 a 0.99. Escala el eje vertical de cada gráfica según sus datos (de 0 a 1 en este caso) e incluye etiquetas del eje de tiempo en segundos.
2. El CSV usa punto y coma y pone las unidades dentro del nombre de las columnas ("t (s);u_crudo (0-1);..."). El script de Python de la guía (sección 5.10) lee las columnas por nombre exacto con pandas.read_csv y separador coma. Cambia el CSV a: separador coma, punto decimal, y encabezados exactos sin unidades: t,u_crudo,u,x1,y (si hay más estados, x2, x3...). Las unidades no van en el encabezado; muéstralas en la pantalla final debajo del botón de descarga (t en s, u_crudo y u de 0 a 1, x y y en las unidades del modelo).
No cambies el modelo ni la entrada. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. Al terminar ejecuta npm test y npm run build.
```

- **Errores de la IA detectados:** las gráficas finales no mostraban la partida (solo una línea en el borde superior) y el CSV usaba punto y coma con unidades dentro del nombre de las columnas, incompatible con `analisis/identificar.py`.
- **Resultado:** funcionó. La pantalla final muestra u(t) como escalón de 0 a 1 a los 2 s y y(t) subiendo hasta 0,99, con eje de tiempo de 0 a 25 s; el CSV quedó con encabezado `t,u_crudo,u,x1,y`, separador coma y punto decimal, y las unidades aparecen debajo del botón de descarga.
- **Con esto se completó la lista "Verificación antes de continuar" de la sección 5.6** (gamepad no probado por falta de dispositivo).

---

## 29. Reorganización en cuatro capas (5.6)

```
Reorganiza el código para cumplir la arquitectura en cuatro capas de la guía, SIN cambiar ningún comportamiento:
1. Mueve cada escena de Phaser que hoy está en src/main.js a su propio archivo en src/juego/: Arranque.js, Menu.js, Calibracion.js, Simulacion.js y Fin.js (usa los nombres de clase que ya existen). src/main.js debe quedar solo como punto de entrada: configuración del juego (parent 'game-container', 1280x720, escalado FIT, Arcade, dom.createContainer) y la lista de escenas importadas.
2. Si hay funciones auxiliares de dibujo o de interfaz dentro de main.js (paneles, botones, selectores, texto de depuración), muévelas a src/hmi/ o src/juego/ según corresponda. Las escenas siguen sin calcular física por su cuenta ni acceder a MediaPipe o a la Gamepad API.
3. Crea src/juego/mapaControl.js con el mapeo actual del simulador base (der.altura -> actuador u) y haz que la escena de simulación lo use en lugar de tener el mapeo escrito dentro de la escena.
4. Elimina los archivos de la plantilla de Vite que no se usan: src/counter.js, src/style.css y src/assets/ (hero.png, javascript.svg, vite.svg), solo si ningún archivo los importa.
No cambies la lógica de entrada, cámara, modelo, HMI ni el formato del CSV. Usa solo el objeto global Phaser (sin import Phaser). No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build y muestra el árbol final de src/.
```

- **Error de la IA detectado (en el prompt base):** Codex había puesto las cinco escenas dentro de `src/main.js` (22 KB) y no había creado `src/juego/` ni `src/juego/mapaControl.js`, que la guía exige. También dejó archivos sin usar de la plantilla de Vite.
- **Resultado:** funcionó.
  - `main.js` quedó solo como punto de entrada.
  - Las escenas pasaron a `src/juego/` (Arranque, Menu, Calibracion, Simulacion, Fin, más EscenaBase, contexto y preferencias), junto con `mapaControl.js`.
  - Los paneles y la vista de cámara pasaron a `src/hmi/` (panelDepuracion, vistaCamara).
  - Se eliminaron `counter.js`, `style.css` y `src/assets/`.
  - `npm test` pasó 5 pruebas y `npm run build` terminó bien.
- **Prueba de la pareja en el navegador:** pasaron todas (menú, escalón con pantalla final y CSV, cámara con depuración y pausa, consola sin errores).

---

## 30. Prompt específico del Simulador 1 (5.7)

- **Prompt:** el del "Simulador 1. Operador de tanques" de la sección 5.7, literal, con el bloque común de reglas al final (archivo `prompt_5_7_tanques.txt`).
- **Resultado según Codex:** implementó los tres niveles (perturbaciones, referencias, tolerancias), actuadores con límite de velocidad, alarmas H/HH y fin por desborde, el dibujo de los tanques, las tendencias, las barras de válvulas, el panel de linealización y la pantalla final; mapeó altura de la mano derecha → v1 y pellizco izquierdo → v2, y agregó una prueba que compara el modelo con `docs/vensim_escalon.csv`. `npm test` pasó 6 pruebas y `npm run build` terminó bien.
- **Verificación de la pareja:**
  - Funciona: menú con los 3 niveles; nivel 1 arranca en 0,5 m; la válvula abre en rampa (4 s); alarma H a los 14,5 s (2,40 m), HH a los 19,7 s (2,80 m) y fin por desborde a 3,0 m; nivel 3 con dos tanques, referencia 1,20 ± 0,06 m, q_d senoidal y v2 controlada por el pellizco izquierdo; pantalla final con ecuación, parámetros, alarmas, IAE, texto educativo y CSV `t,u_crudo,u,x1,x2,y,v2,q_d,h_sp`.
- **Errores de la IA detectados:**
  1. La tecla F no terminaba la partida.
  2. La partida no terminaba al cumplir la duración del nivel (120 s).
  3. Al cumplir 30 s seguidos en banda el nivel no se declaraba superado.
  4. El "τ medido en el primer llenado" (4,75 s frente a 12,25 s teórico) se medía durante un desborde con la válvula al 100 %, así que no era comparable.
  5. Quedaba un rectángulo blanco tras la pausa "Muestra las manos".
  6. Las tendencias en vivo no se dibujaban (vacías en el nivel 3, solo un tramo corto en el nivel 1).

## 31. Correcciones del simulador de tanques (5.7)

```
Correcciones del simulador de tanques:
1. La tecla F (terminar) no funciona en la simulación de tanques, ni con cámara ni con ?control=escalon. Debe terminar la partida en cualquier momento (también en pausa) y mostrar la pantalla "Lo que pasó en el modelo".
2. La partida no termina al llegar a la duración del nivel (120 s en el nivel 1, 120 s en el nivel 2, 150 s en el nivel 3, según docs/niveles.md). Al cumplir la duración debe pasar a la pantalla final con el resultado.
3. Cuando el jugador cumple el criterio del nivel (nivel 1: 30 s seguidos con h1 en 1.5 m ±10 %), el nivel debe marcarse como SUPERADO y la partida terminar en ese momento, mostrando en la pantalla final "Nivel superado" y el valor alcanzado frente al requerido. Los niveles 2 y 3 se evalúan al cumplir su duración (porcentaje del tiempo en banda y sin alarma HH / sin desbordar).
4. El "tau medido en el primer llenado" no es comparable con el teórico: se midió con la válvula al 100 % durante un desborde. Mídelo así: toma el primer tramo en que v1 queda estable (cambia menos de 0.02 durante al menos 2 s) después de un cambio; calcula el equilibrio de ese v1, h_eq = (0.4*v1/c1)^2; tau medido = tiempo desde que v1 se estabiliza hasta que h1 recorre el 63.2 % del camino hacia h_eq. Compáralo con el tau teórico en ese mismo punto, tau = 2*A*sqrt(h_eq)/c1. Si no hubo un tramo válido, muestra "no disponible".
5. Al terminar la pausa "Muestra las manos" queda un rectángulo blanco en el centro de la pantalla. Elimina por completo el aviso cuando se reanuda.
6. Las gráficas de tendencia en vivo ("Niveles y banda de tolerancia" y "Válvulas v1 / v2") no se dibujan bien: en el nivel 3 quedan vacías y en el nivel 1 con escalón solo aparece un tramo corto al final. Deben mostrar siempre los últimos 30 s completos de h1 (y h2 en el nivel 3) con la banda de tolerancia y la referencia, y de v1 (y v2 en el nivel 3), desde el inicio de la partida, en los tres niveles y con cualquier fuente de control.
No cambies el modelo, la entrada ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** las tendencias ya se dibujan con eje de tiempo en los niveles 1 y 3 (h1, h2, referencia, banda, v1 y v2) y desapareció el rectángulo blanco. Con `?control=escalon` la partida se pudo terminar y el CSV llega hasta t = 20,4 s.
- **Error que persiste:** con la cámara como fuente de control, la tecla F sigue sin terminar la partida (niveles 1 y 3).
- **Verificación del modelo con el CSV del escalón (nivel 1):** al integrar con RK4 la misma apertura u(t) registrada en el CSV, el nivel calculado coincide con el del juego con un error máximo de 0,0045 m (0,72 %); h1(20 s) = 2,566 m en el juego frente a 2,564 m de la referencia. El juego arranca con v1 ≈ 0,35 (equilibrio en 0,5 m), la válvula cierra en rampa hasta los 2 s y luego abre en rampa hasta 1 a los 6 s; por eso no se compara directamente con el STEP instantáneo de Vensim (se ajusta en la sección 5.9).

---

## 32. Correcciones intermedias del simulador de tanques (5.7)

- **Prompts (resumen de lo pedido a Codex, en orden):**
  1. **Reloj en tiempo real:** con la cámara activa, el tiempo de la partida avanzaba más lento que el reloj real, porque el juego bajaba de FPS y cada cuadro sumaba un dt fijo. Se pidió medir el tiempo transcurrido con `performance.now()` y alimentar con él el acumulador del integrador RK4 de paso fijo, sin cambiar `src/modelo/`.
  2. **Detección en un Web Worker:** para que MediaPipe no frenara el ciclo del juego, se pidió mover la detección de manos a un Web Worker y recibir los resultados por mensajes, manteniendo la misma interfaz de `src/vision/`.
  3. **Mensajes "terminar" en la consola:** como la partida con cámara no pasaba a la pantalla final, se pidió registrar en la consola cada paso del cierre ("terminar: inicio", "terminar: cambio de escena") al pulsar F, al pulsar Terminar y al llegar a los 120 s, para ver dónde se detenía.
- **Resultado:** el reloj del juego avanza en tiempo real (dt medido con performance.now()). Los mensajes "terminar: inicio" y "terminar: cambio de escena" aparecen en la consola al pulsar F, al pulsar Terminar y a los 120 s.
- **Errores de la IA:** movió la detección de manos a un Web Worker de tipo módulo, donde MediaPipe falla porque usa importScripts; se volvió a la detección en el hilo principal. La partida con cámara sigue sin pasar a la pantalla final y el juego se congela.

---

## 33. Fin de partida con cámara y FPS (5.7)

```
Corrección: con la cámara como fuente de control la partida no pasa a la pantalla final.
Con la cámara, al pulsar F, al pulsar el botón Terminar o al cumplirse los 120 s, la consola muestra "terminar: inicio" y "terminar: cambio de escena", pero la escena Fin nunca aparece y el juego queda congelado. Con ?control=escalon sí funciona. La única diferencia entre ambos casos es que con la cámara existen el stream y el detector de MediaPipe, y al terminar se llama a detenerCamaraDespues() → detenerSesionCamara() → CamaraManos.detener(), que pausa el video, detiene los tracks y llama a detector.close().

1. Al terminar la partida no cierres ni detengas la cámara. Elimina detenerCamaraDespues() de Simulacion.js (en terminar() y en el evento shutdown). Agrega a CamaraManos un método pausarDeteccion() que solo ponga activo = false y cancele requestVideoFrameCallback / requestAnimationFrame, sin pausar el video, sin detener los tracks y sin llamar a detector.close(). Llámalo desde Fin.create() con this.time.delayedCall(500, ...), cuando la pantalla final ya se haya dibujado.
2. Reutiliza el detector de MediaPipe: en CamaraManos.iniciar(), si this.detector ya existe, no lo cierres ni crees otro; solo cambia el stream si cambia la cámara elegida, y reanuda el bucle de detección. detector.close() no debe llamarse durante el juego.
3. En el evento shutdown de Simulacion, envuelve cada limpieza (quitar listeners, panelDepuracion.destruir(), mostrarVistaCamaraDepuracion(false), destruir tendencias y barras) en su propio try/catch con console.error('[ERROR JUEGO] limpieza Simulacion', error).
4. Envuelve el contenido de Fin.create() en try/catch: si falla, escribe console.error('[ERROR JUEGO] Fin.create', error) y muestra igual el resultado del nivel, el botón "Descargar CSV" y el botón "Volver al menú".
5. En main.js agrega window.addEventListener('error') y window.addEventListener('unhandledrejection') que escriban en la consola '[ERROR JUEGO]' con el mensaje y el stack.
6. El juego corre a unos 20 FPS. Para llegar a 30 FPS o más: no destruyas y vuelvas a crear las tendencias, las barras ni los textos en cada cuadro; crea los objetos una vez y redibuja las tendencias y las barras como máximo 10 veces por segundo (Graphics.clear() y setText()). Actualiza el panel de depuración como máximo 5 veces por segundo. Para el criterio consecutivo lleva un contador incremental del tiempo seguido en banda en lugar de llamar a evaluarNivel() sobre todas las muestras en cada cuadro (el resultado debe ser el mismo). La integración del modelo, el registro de muestras y el CSV siguen igual, en cada cuadro.
Prueba con la cámara en los niveles 1 y 3: F a los 10 s, el botón Terminar, el fin a los 120 s / 150 s y "Nivel superado" tras 30 s seguidos en banda en el nivel 1; después usa "Volver al menú" y juega otra partida con la cámara.
No cambies el modelo, la entrada ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Causa probable (revisión del código):** con ?control=escalon la partida termina bien; con la cámara, terminar() se ejecuta completa, pero justo después se detiene la cámara (pausa del video, parada de los tracks y detector.close() de MediaPipe). Es la única parte del cierre que solo ocurre con la cámara. Además, las tendencias, las barras y unos 30 textos se destruyen y se vuelven a crear en cada cuadro, lo que deja el juego en unos 20 FPS.
- **Resultado:** el registro de errores con "[ERROR JUEGO]" funciona y permitió ver la causa del siguiente fallo.
- **Errores de la IA:** al mover el redibujado a 10 veces por segundo dejó la variable `hs` fuera de su alcance: al pulsar D aparece "ReferenceError: hs is not defined" (Simulacion.js:127) y el juego se congela. El panel de depuración aparece pegado al borde superior, encima del título, y vacío.

---

## 34. Error "hs is not defined" al pulsar D (5.7)

```
Error al pulsar D (panel de depuración) en la simulación con la cámara. El juego se congela y la consola muestra:
[ERROR JUEGO] Uncaught ReferenceError: hs is not defined
    at Simulacion.update (src/juego/Simulacion.js:127:169)
Después del último cambio, la variable hs ya no existe en la parte de update() que actualiza el panel de depuración (x: hs). Corrígelo usando el estado actual del sistema (this.sistema.x) y revisa que ninguna otra variable usada en update() haya quedado fuera de su alcance tras mover el redibujado a 10 veces por segundo.
Además, el panel de depuración aparece pegado al borde superior de la pantalla, encima del título, y queda vacío. Debe aparecer debajo del título, en la posición (18, 105), y mostrar los FPS, α, Ts, τf, las señales de las dos manos y x(t).
Un error en update() detiene todo el juego. Envuelve el contenido de update() en try/catch: si ocurre un error, escríbelo con console.error('[ERROR JUEGO] update', error) y sigue en el siguiente cuadro, sin congelar la partida.
Prueba con la cámara en el nivel 1: pulsa D varias veces, pulsa F a los 10 s y deja otra partida hasta los 120 s.
No cambies el modelo, la entrada ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el panel de depuración ya se abre con D, debajo del título y con datos (juego a 37 FPS, detección a 10 FPS). F y el botón Terminar funcionan antes de los 30 s.
- **Error que persiste:** pasados los 30 s, al pulsar F la consola muestra "terminar: inicio", "terminar: cambio de escena" y "cámara detenida" (este último lo escribe la escena Fin), pero la pantalla se queda congelada en la simulación (tiempo y panel quietos) y no aparece "Lo que pasó en el modelo".

- **Pruebas de la pareja:** (1) con ?control=teclado, F a los 40 s sí muestra la pantalla final; (2) con la cámara y sin D, la pantalla no se congela, pero F no hace nada; (3) con Phaser.CANVAS en lugar de WebGL sigue sin terminar. Se descarta un problema de WebGL.

---

## 35. Reinicio del estado de la partida y diagnóstico de F (5.7)

```
La partida con la cámara sigue sin terminar con F ni con el botón Terminar. Con ?control=teclado sí termina, también después de los 30 s.
Encontré esto en src/juego/Simulacion.js: Phaser reutiliza la misma instancia de la escena en cada partida y create() no reinicia this.terminado. Después de la primera partida terminado queda en true, y en las siguientes terminar() sale en la primera línea: F, el botón Terminar y el fin por duración dejan de funcionar. Tampoco se reinician this.ultimoVista, this.tiempoAnteriorRegistro, this.noManosDesde, this.paramPanel ni this.graf / this.grafValvulas / this.barras, por lo que en la segunda partida las tendencias y el CSV arrancan mal.

1. Al inicio de create() de Simulacion reinicia todo el estado de la partida: terminado = false, ultimoVista = 0, tiempoAnteriorRegistro = 0, noManosDesde = null, paramPanel = null, graf = null, grafValvulas = null, barras = [], tiempoEnBandaSeguido = 0, ultimoTiempoMuestra = null, ultimoHmi y ultimoDebug = -Infinity. Revisa también Fin, Menu y Calibracion para que ninguna escena dependa de valores de una partida anterior.
2. Agrega mensajes de diagnóstico en la consola, todos con el prefijo [DIAG]:
   - En el listener de teclado de Simulacion, al pulsar F: "[DIAG] tecla F", con this.terminado, this.sys.isActive() y this.tiempoJuego.
   - Al pulsar el botón Terminar: "[DIAG] botón Terminar", con los mismos datos.
   - En terminar(), si sale porque ya estaba terminado: "[DIAG] terminar ignorado: ya terminado".
   - En el evento shutdown de Simulacion: "[DIAG] Simulacion shutdown".
   - Al inicio y al final de Fin.create(): "[DIAG] Fin.create inicio" y "[DIAG] Fin.create fin", con el tiempo que tardó en ms.
   - En el primer render de Fin (this.events.once('render')): "[DIAG] Fin primer render".
   - 1 s después de llamar a this.scene.start('Fin'): "[DIAG] escenas activas", con this.game.scene.getScenes(true).map((s) => s.scene.key).
3. Prueba con la cámara en el nivel 1, sin recargar la página entre partidas: partida 1 con F a los 10 s; Volver al menú; partida 2 con F a los 40 s; Volver al menú; partida 3 hasta el fin a los 120 s. Las tres deben mostrar la pantalla "Lo que pasó en el modelo", y el CSV y las tendencias de cada partida deben empezar en t = 0.
No cambies el modelo, la entrada ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Causa encontrada en el código:** `this.terminado` solo se pone en true y nunca vuelve a false. Phaser reutiliza la instancia de la escena, así que desde la segunda partida sin recargar la página, terminar() se ignora. Tampoco se reinician `ultimoVista` ni `tiempoAnteriorRegistro`, lo que afecta las tendencias y el CSV de las partidas siguientes.
- **Resultado:** las tres partidas seguidas con la cámara, sin recargar la página (F a los 10 s, F a los 40 s y fin a los 120 s), llegan a la pantalla "Lo que pasó en el modelo".
- **Error detectado al jugar:** el nivel 1 nunca se supera. Las dos líneas grises del alambique están fijas en unos 1,82 m y 2,45 m y parecen la banda de tolerancia, pero la banda real es de 1,35 a 1,65 m. El alambique no muestra ni la referencia ni la banda.

---

## 36. Banda de tolerancia en el alambique y avance del criterio (5.7)

```
En el dibujo del alambique (src/hmi/tanques.js) las dos líneas grises horizontales están fijas al 20 % y al 40 % de la altura del rectángulo, que equivalen a unos 2,45 m y 1,82 m. No corresponden a la referencia ni a la banda de tolerancia, y el jugador cree que el espacio entre ellas es la banda: mantiene h1 ahí 30 s y el nivel 1 no se supera, porque la banda real es 1,35 a 1,65 m.
1. Quita esas dos líneas fijas. Dibuja en cada alambique, con la escala 1 m = (alto útil)/3 que ya usa el líquido: la banda de tolerancia actual como franja sombreada (referencia ± tolerancia, obtenida con obtenerReferencia y obtenerTolerancia según el tiempo, así cambia a los 75 s en el nivel 3), la referencia como línea continua, y marcas cortas de alarma H (2,4 m, amarilla) y HH (2,8 m, roja). Agrega a la izquierda del alambique una escala con 0, 1, 2 y 3 m. La banda y la referencia van en el alambique controlado (alambique 1 en los niveles 1 y 2, alambique 2 en el nivel 3).
2. Pinta el líquido con un color distinto cuando el nivel controlado está dentro de la banda.
3. Muestra en la pantalla de la simulación el avance del criterio del nivel, que se actualiza junto con la HMI: en el nivel 1 "En banda: 12,4 / 30 s seguidos" (vuelve a 0 al salir de la banda); en los niveles 2 y 3 "En banda: 63 % del tiempo (meta 80 %)" o "(meta 70 %)".
4. Comprueba que la pantalla final usa el mismo cálculo: si el jugador mantiene 30 s seguidos h1 entre 1,35 y 1,65 m en el nivel 1, la partida termina en ese momento y muestra NIVEL SUPERADO con "30,0 s / 30 s".
Prueba el nivel 1 con ?control=teclado: sube la válvula al 100 % hasta que h1 llegue a 1,25 m, déjala en 61 % y espera; la partida debe terminar como superada hacia los 36 s.
No cambies el modelo, la entrada ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el alambique muestra la banda de tolerancia, la referencia y las marcas H y HH, junto con el contador "En banda". El nivel 1 se supera con el teclado y con la cámara. Si h1 sale de la banda, el contador vuelve a 0, como pide el criterio de docs/niveles.md (30 s seguidos en ±10 %).

---

## 37. Prueba del modelo de tanques contra Vensim en los 20 s (5.7)

```
En test/modelo.test.js, la prueba "el modelo de tanque coincide con el escalón Vensim en t=2 s" busca la fila con punto y coma ('2;'), pero docs/vensim_escalon.csv usa comas (encabezado t,h1). Además solo compara t = 2 s, cuando la válvula está cerrada.
Reemplázala por una prueba que:
1. Lea docs/vensim_escalon.csv aceptando coma o punto y coma como separador.
2. Simule con crearSistemaTanques({ tanques: 1, estadoInicial: [0.5] }) y avanzar(u, 1/120) durante 20 s, con u = [0, 1, 0] para t < 2 s y u = [1, 1, 0] desde t = 2 s (igual que v1 = STEP(1, 2) en Vensim, sin pasar por el Actuador).
3. Compare h1 con Vensim en todos los instantes comunes (múltiplos de 0.05 s) y exija un error máximo menor que 1e-3 m. Muestre en la consola el error máximo y h1(20 s) del modelo y de Vensim.
No cambies el modelo ni otros archivos. No modifiques docs/, vensim/ ni PROMPTS.md. No controles el computador ni el navegador. Ejecuta npm test y confirma que todas las pruebas pasan.
```

- **Motivo:** la prueba que agregó Codex (bloque común de la 5.7) pasaba, pero solo comparaba h1 en t = 2 s, cuando el tanque se vacía con la válvula cerrada. La pareja comprobó aparte que el modelo del juego (RK4, h = 1/120 s) reproduce todo el escalón de Vensim con un error máximo de 0,000005 m y h1(20 s) = 2,7514 m en ambos.
- **Nota:** el prompt dice que el CSV usa comas, pero el archivo del proyecto usa punto y coma (la prueba original pasaba). No afecta el resultado, porque el prompt pide aceptar los dos separadores.
- **Resultado:** `npm test` aprueba las 6 pruebas. Tanque a 20 s: error máximo = 0,0000051 m (5,08·10⁻⁶ m); h1(20 s) = 2,751405 m en el modelo y 2,7514 m en Vensim. Pruebas del integrador: error de RK4 de 3,5·10⁻¹⁰ en primer orden (Euler: 4,5·10⁻³) y de 1,3·10⁻⁸ en segundo orden.

---

## 38. Integración de personajes y escenarios (5.8)

- **Preparación:** se copiaron las 11 imágenes de `arte/` a `public/assets/originales/` y se instaló sharp (`npm install -D sharp`).
- **Prompt (copiado literalmente de la guía):**

```
Copié las imágenes generadas con Gemini en public/assets/originales/ y la
lista de recursos en docs/recursos.md (nombre, tamaño del cuadro y número de
cuadros de cada imagen).
1. Crea scripts/procesar-assets.mjs con la librería sharp que, para cada
   imagen: quite el fondo magenta (#FF00FF, con tolerancia) y lo deje
   transparente; recorte los bordes vacíos; divida las hojas de sprites en
   cuadros iguales; alinee el personaje en todos los cuadros por su base;
   reescale al tamaño indicado en docs/recursos.md y vuelva a armar cada hoja
   en public/assets/sprites/. Los fondos lejanos van a public/assets/fondos/
   sin quitar color.
2. Agrega el comando "npm run assets" en package.json y ejecútalo.
3. Carga los recursos en la escena de Arranque, con barra de progreso, y crea
   las animaciones con this.anims.create.
4. Reemplaza las figuras geométricas por los sprites sin cambiar la lógica ni
   el modelo: la posición de cada sprite sigue saliendo de SistemaContinuo.
   Ajusta las cajas de colisión al tamaño visible de cada personaje.
5. Usa tileSprite para los fondos con parallax y la hoja de baldosas para las
   plataformas o el piso. Los elementos del modelo que se deforman (resortes,
   niveles de tanque, termómetros) se dibujan con Graphics a partir del
   estado x(t), no con animaciones fijas.
6. Si falta una imagen, conserva la figura geométrica como respaldo.
7. Optimiza las imágenes finales (PNG comprimido o WebP) para que la
   carpeta public/assets no supere 10 MB y el ZIP de entrega quede por debajo
   de 25 MB. Carga los recursos con rutas relativas (assets/..., sin /
   inicial).
8. Ejecuta npm test y confirma que las pruebas del modelo siguen pasando.
```

- **Resultado:** Codex aplicó los cambios (src/hmi/tanques.js, Arranque.js, EscenaBase.js, Fin.js, Menu.js, Simulacion.js, package.json y scripts/). La pareja decidió volver al último commit para corregir antes el nivel 3. Los cambios se guardaron con `git stash push -u -m "intento 5.8 Codex"` y se borraron las imágenes procesadas; las originales y docs/recursos.md se conservaron. El prompt se enviará de nuevo.

---

## 39. Correcciones del nivel 3: manos ausentes, calibración y dibujo en cascada (5.7)

```
Correcciones del nivel 3 (El Elixir Doble en Cascada):
1. Al empezar el nivel 3, si la mano izquierda todavía no se ha detectado dentro de la zona, el pellizco vale 0 por defecto y la válvula v2 se cierra sola: h2 sube hasta desbordar aunque el jugador no haga nada. Lo mismo pasa con la mano derecha y v1. Cambia la lectura de las manos en Simulacion.js (o en leerSenal de mapaControl.js) para que, mientras una mano no esté presente en la zona, su válvula conserve el valor actual del actuador (v2 arranca en 1 y v1 en el equilibrio), y solo siga al gesto cuando la mano esté presente. Aplícalo a la cámara en los tres niveles; el teclado, el gamepad y el escalón siguen igual.
2. Si la calibración guardada del pellizco o de la altura tiene min >= max, o una diferencia menor que 0.05, ignórala para ese canal y usa el valor sin calibrar, y escribe un aviso en la consola.
3. Dibuja los dos alambiques en cascada, como en el diseño: el alambique 1 más arriba y a la izquierda, el alambique 2 más abajo a la derecha, con un tubo que sale del fondo del alambique 1 y cae en la parte superior del alambique 2 (caudal q12 = c1*sqrt(h1)), y la válvula v2 a la salida del fondo del alambique 2. Mantén la escala 1 m = (alto útil)/3, la banda, la referencia, las marcas H y HH y las escalas de 0 a 3 m. Que no tapen las tendencias, los textos ni el panel de depuración.
4. En el nivel 3 muestra debajo de los alambiques una ayuda corta: "Mano derecha: válvula de entrada v1 · Pellizco izquierdo abierto = v2 abierta (sale líquido del alambique 2)".
Prueba el nivel 3 con la cámara: al empezar sin mostrar la mano izquierda, v2 debe quedarse en 100 % y h2 en 1,2 m; al abrir y cerrar el pellizco izquierdo, la barra de v2 y la línea "izq ... pellizco" del panel D deben cambiar entre 0 y 1.
No cambies el modelo, los niveles ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Error detectado al jugar:** en el nivel 3, h2 sube hasta la alarma H y no baja hagas lo que hagas. El panel D muestra "izq fuera | pellizco 0.00→0.01": la mano izquierda estaba fuera de la zona, el pellizco quedó en 0 por defecto y v2 se cerró (barra en 1 %). Además, los dos alambiques se dibujaban lado a lado y no se veía la cascada.
- **Resultado:** v2 arranca en 100 % y se mantiene mientras la mano izquierda no está en la zona, y el pellizco la mueve. Los alambiques se dibujan en cascada: el 1 arriba a la izquierda, un tubo q12 = c1·√h1 hacia el 2 y la válvula v2 abajo. El nivel 3 se puede jugar.
- **Detalles pendientes:** la ayuda del nivel 3 queda cortada por la barra de v1, los textos de las dos barras se superponen y la banda casi no se ve sobre el líquido verde.

---

## 40. Ajustes de textos y de la banda en la simulación (5.7)

```
Ajustes de textos en la pantalla de la simulación (sin cambiar la lógica):
1. La ayuda del nivel 3 ("Mano derecha: válvula de entrada v1 · Pellizco izquierdo abierto = v2 abierta (sale líquido del alambique 2)") queda cortada y tapada por la barra de v1. Muévela o divídela en dos líneas para que se lea completa y no se cruce con las barras ni con las tendencias.
2. En el nivel 3, los textos de las barras "Válvula entrada v1: 55% | 1.20 m" y "Válvula salida v2: 100% | 1.19 m" se juntan y se superponen. Sepáralos para que cada texto quede encima de su barra sin tocar el otro, y nombra la altura de cada uno: "h1 1.20 m" y "h2 1.19 m".
3. En el alambique 2 la banda de tolerancia casi no se ve sobre el líquido verde. Dibuja la franja de la banda con un borde visible (líneas finas arriba y abajo) por encima del líquido, en los tres niveles.
Revisa el nivel 1, el nivel 2 y el nivel 3 para que ningún texto quede cortado ni superpuesto.
No cambies el modelo, la entrada, los niveles ni el formato del CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** la ayuda del nivel 3 se lee completa en dos líneas y la banda del alambique 2 tiene bordes visibles.
- **Error que persiste:** los textos de las barras siguen pegados ("h1 1.20 mVálvula salida v2…") y el segundo se sale del borde derecho.

---

## 41. Textos de las barras de válvulas (5.7)

```
En el nivel 3 los textos de las barras de válvulas siguen pegados: se lee "Válvula entrada v1: 55% | h1 1.20 mVálvula salida v2: 100% | h2 1.19 m", y el segundo texto se sale del borde derecho de la pantalla. Acorta los textos a "v1 entrada 55 % · h1 1.20 m" y "v2 salida 100 % · h2 1.19 m", y alinea cada texto con el inicio de su barra, con al menos 20 px de separación entre ambos y dentro de los 1280 px de ancho. Usa el mismo formato en los niveles 1 y 2.
No cambies nada más. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** los textos de las barras quedan separados y dentro de la pantalla ("v1 entrada 55 % · h1 1.20 m" y "v2 salida 100 % · h2 1.18 m"). El aviso "Muestra las manos" con pausa aparece correctamente cuando no hay manos en la zona.

---

## 42. Integración de personajes y escenarios, segundo envío (5.8)

- **Prompt:** el mismo de la entrada 38, enviado sobre el código con el nivel 3 corregido.
- **Respuesta de Codex:** creó scripts/procesar-assets.mjs con sharp (quita el magenta, recorta y escala, procesa las hojas de baldosas e íconos y guarda los fondos aparte) y el comando `npm run assets`. public/assets ocupa 6,9 MB, incluidos los originales. Arranque.js carga los recursos con barra de progreso. El líquido, la banda, las alarmas y la referencia se siguen dibujando con Graphics desde el estado del modelo, con respaldo geométrico. `npm run assets`, `npm test` (8 pruebas) y `npm run build` terminaron bien.
- **Resultado:** el menú muestra el logotipo y el fondo del laboratorio, los alambiques de cobre reemplazan a los rectángulos y el piso usa las baldosas.
- **Errores de la IA:**
  - La escala de 0 a 3 m no coincide con el visor y el líquido se ve muy pequeño (no respeta 1 m = 100 px).
  - El líquido es gris en lugar del verde de la guía de estilo.
  - El alambique 1 y el ícono del reloj tapan el subtítulo.
  - La válvula v1 flota al costado del alambique y el tubo q12 no conecta bien los dos alambiques.
  - No se usan la placa y la runa de alarma.
  - La pantalla final no usa pantalla_post_partida.png y no se ven los guiones bajos de los encabezados del CSV.
  - El velo blanco sobre el fondo del menú es muy fuerte.

---

## 43. Correcciones de la integración del arte (5.8)

```
Correcciones de la integración del arte (5.8), sin cambiar el modelo, los niveles, la entrada ni el CSV:
1. Escala del visor: la escala de 0 a 3 m está al lado del alambique, pero no coincide con el visor de vidrio donde se ve el líquido (por ejemplo, con h1 = 1,2 m el líquido casi no se ve y la marca "1" no está a esa altura). Haz que el fondo del visor sea 0 m y su parte superior 3 m, y dibuja la escala, el líquido, la banda de tolerancia, la referencia y las marcas H (2,4 m) y HH (2,8 m) con esa misma conversión. Comprueba que con h = 1,5 m el líquido llegue a la mitad del visor. Agranda el sprite del alambique (sin deformarlo) si hace falta para que el visor mida al menos 200 px de alto.
2. Color del líquido: usa el verde de la poción (#2ECC71) en los dos alambiques y en los tres niveles, y un verde más brillante (#00E676) cuando el nivel controlado está dentro de la banda. No uses gris para el líquido.
3. Superposiciones: el alambique 1 tapa el subtítulo "Tanques en cascada · A·dh/dt = caudales · válvulas con slew 0.25 s⁻¹" y el ícono del reloj tapa ese mismo texto. Baja los alambiques para que no toquen el subtítulo, y pon el ícono del reloj al lado del texto "Tiempo … / … s" de la parte inferior.
4. Válvulas y tuberías: pon la válvula v1 (valvula_cuerpo_estatico + valvula_volante_aislado) sobre una tubería de entrada que llegue a la parte superior del alambique 1, y la válvula v2 a la salida del fondo del alambique 2. El volante de cada válvula gira según su apertura (0 % = 0°, 100 % = 270°). En el nivel 3, el tubo q12 = c1·√h1 debe salir del fondo del alambique 1 y llegar a la parte superior del alambique 2, conectado a los dos sprites.
5. Alarmas: junto a cada alambique muestra alarma_placa con alarma_runa encima: runa gris cuando no hay alarma, #FFD700 con alarma H y #FF1744 con alarma HH.
6. Pantalla final: no se usa pantalla_post_partida.png. Úsala como marco detrás de las dos gráficas y los textos, escalada sin deformarla (proporción 588 × 680), con un fondo gris neutro semitransparente debajo del texto para que todo se lea. Si no cabe sin tapar las gráficas, colócala como marco de la gráfica h(t).
7. En el texto "CSV: t,u_crudo,u,x1,x2,y,v2,q_d,h_sp" de la pantalla final no se ven los guiones bajos. Dale suficiente altura de línea o padding para que se vean.
8. El velo blanco sobre el fondo del laboratorio es muy fuerte en el menú; bájalo un poco sin perder la lectura de los textos. Las zonas de tendencias y la HMI siguen con fondo gris neutro (ISA-101).
Revisa el menú, los niveles 1, 2 y 3 y la pantalla final para que nada se superponga ni se salga de los 1280 × 720 px.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** funcionan la escala del visor, el líquido verde, las runas de alarma y los volantes.
- **Errores (estética, según la pareja):**
  - Un velo gris apaga todo el arte.
  - Los alambiques son enormes: el 2 se corta contra el piso y tapa la barra inferior.
  - La válvula v1 queda cortada en el borde izquierdo.
  - Las placas de alarma quedan pegadas sobre la cúpula.
  - La ayuda del nivel 3 se mezcla con la HMI.
  - En el menú sobra el encabezado y el panel gris se ve plano.
  - Toda la letra es de máquina de escribir.

---

## 44. Rediseño visual: distribución, paneles y tipografía (5.8)

```
Rediseño visual del juego (5.8). La lógica funciona, pero la composición se ve mal: un velo gris apaga el arte, los alambiques son enormes y se salen por abajo, la válvula v1 queda cortada en el borde izquierdo, las placas de alarma quedan pegadas sobre la cúpula, los textos se cruzan con el arte y todo usa letra de máquina de escribir. No cambies el modelo, los niveles, la entrada, las pruebas ni el CSV; cambia solo la presentación.

1. Crea src/hmi/layout.js con todas las posiciones y tamaños (en px, sobre el lienzo de 1280 × 720) y úsalo en Menu, Simulacion y Fin, para no tener números sueltos.
2. Estilo general (docs/recursos.md):
   - Fondo: fondo_laboratorio.png a pantalla completa y sin velo blanco ni gris; encima, solo una viñeta oscura suave en los bordes.
   - Paneles: rectángulos redondeados (radio 10) color #1C2026 con 85 % de opacidad y borde de 1 px #B85A24. Todo texto va sobre un panel, nunca directo sobre el arte.
   - Tipografía: títulos en "Georgia, serif", negrita, color #F2E6C9, con sombra oscura; textos de la HMI en "Segoe UI, Arial, sans-serif", color #E6E8EA. No uses fuentes monoespaciadas, salvo en el panel de depuración.
   - Botones: fondo #B85A24, texto #F2E6C9, borde #1A1B1D, esquinas redondeadas y un tono más claro al pasar el mouse.
   - Color intenso solo para las alarmas (#FFD700 y #FF1744).
3. Simulación, distribución fija:
   - Barra superior (y 0–80): panel a todo el ancho con el nombre del nivel como título a la izquierda y "CÁMARA ACTIVA" a la derecha. Quita la línea "ALAMBIQUE REAL / EL ARTE DE LA ALQUIMIA" y el subtítulo "Tanques en cascada…"; la ecuación ya está en el panel P.
   - Zona de la planta (x 20–640, y 90–650): sin panel, sobre el fondo. Las baldosas del piso van en una franja de y 650 a 720 bajo esta zona.
     · Niveles 1 y 2: un alambique de 300 px de alto (sin deformar), centrado en x = 330, con la base apoyada en el piso (y = 650).
     · Nivel 3: alambique 1 de 260 px de alto, con centro en x = 190 y la base en y = 430, sobre un soporte de hierro (#4A5056) dibujado con Graphics que llega al piso; alambique 2 de 260 px de alto, con centro en x = 470 y la base en el piso. El tubo q12 sale del fondo del alambique 1, baja y entra por la cúpula del alambique 2.
     · Válvula v1 (cuerpo + volante) sobre una tubería que llega desde arriba a la cúpula del alambique 1, completa y dentro de la zona; válvula v2 en la salida del fondo del alambique 2, completa y sobre el piso. Los volantes giran con la apertura.
     · El líquido, la escala (0, 1, 2 y 3 m con marcas pequeñas pegadas al borde derecho del visor), la banda, la referencia y las marcas H y HH se dibujan dentro del visor y con su misma conversión.
     · Debajo de cada alambique, una etiqueta pequeña sobre panel: "Alambique 1 · h1 1.20 m", con la placa y la runa de alarma (40 × 40) a su izquierda. Las placas nunca van sobre el sprite del alambique.
   - Zona de la HMI (x 660–1260, y 90–650): un panel con, en orden, la línea de estado (h, referencia y qd), la tendencia de niveles, la tendencia de válvulas, las barras de v1 y v2 y el avance del criterio como barra de progreso con su texto. Tendencias con fondo #3A3D40, rejilla gris tenue y líneas claras: h1 #E6E8EA, h2 #2ECC71, referencia #C9A227 y banda gris translúcida.
   - Barra inferior (y 660–712): panel con la ayuda de controles a la izquierda (en el nivel 3, las dos líneas de la ayuda de manos), el ícono del reloj con "Tiempo 3.0 / 120 s" en el centro y el botón Terminar a la derecha.
4. Menú: el logotipo centrado arriba (400 px de ancho) y, debajo, un panel centrado de 760 px de ancho con dos columnas: a la izquierda, fuente de control y nivel; a la derecha, la cámara y "Intercambiar derecha / izquierda". Debajo, los botones Iniciar simulación, Calibrar cámara y Probar cámaras en una fila, y al final la línea de controles. Sin el encabezado "ALAMBIQUE REAL / …" ni "Menú de operación", porque ya está el logotipo. Los select de HTML con el mismo estilo de los paneles: fondo oscuro, texto claro y borde cobre.
5. Pantalla final: a la izquierda (x 20–608, y 20–700), pantalla_post_partida.png sin deformar, con la gráfica h(t) en su área superior, v(t) en la inferior y el botón "Descargar CSV" en el espacio de abajo. A la derecha (x 630–1260), un panel con el título "Lo que pasó en el modelo", el resultado (NIVEL SUPERADO en #2ECC71 o NO SUPERADO en #FF1744), las métricas, el modelo y los parámetros, la explicación de 3 a 5 líneas y el botón "Volver al menú".
6. Calibración y Arranque con el mismo estilo de paneles y botones.
Revisa con ?control=teclado el menú, los niveles 1, 2 y 3 (con alarma H y HH) y la pantalla final: nada se superpone, nada se corta en los bordes y todo queda dentro de los 1280 × 720 px.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el fondo del laboratorio se ve sin velo, hay paneles oscuros con borde cobre, títulos con serifa, menú con logotipo centrado, HMI en panel propio y la pantalla final usa el panel de Gemini. A la pareja le empieza a gustar.
- **Errores que quedan:**
  - Los botones solo responden si el puntero está sobre el texto.
  - En la pantalla final, las gráficas no quedan dentro de las rejillas del panel de Gemini.
  - En el nivel 3, el soporte del alambique 1 es un rectángulo gris liso, el tubo q12 entra por el visor del alambique 2 y las etiquetas, las placas y la válvula v2 se cruzan con el piso y la barra inferior.
  - La ayuda de manos ocupa tres líneas y se corta.
  - El menú tiene un hueco vacío y la línea de controles casi no se lee.

---

## 45. Pulido visual: botones, pantalla final, planta y menú (5.8)

```
Pulido visual (5.8). El rediseño quedó bien encaminado; corrige estos detalles sin cambiar el modelo, los niveles, la entrada, las pruebas ni el CSV, y ajusta los valores en src/hmi/layout.js.

1. Botones: solo responden si el puntero está sobre el texto. Haz que toda el área del botón (el rectángulo redondeado completo) sea clicable, con cursor de mano y el cambio de tono al pasar por encima, en todas las escenas (Menu, Calibracion, Simulacion y Fin). Usa un hit area del tamaño exacto del botón: un Container con setSize(ancho, alto) y setInteractive, o una Zone del mismo tamaño encima. Comprueba que un clic en cualquier esquina interior del botón funciona.

2. Pantalla final: usa pantalla_post_partida.png como fue diseñada. En la imagen original de 483 × 559 px (si el script recortó bordes, aplica el mismo recorte) tiene:
   - un listón de título en x 100–385, y 72–108;
   - un área lisa para texto en x 30–453, y 118–310;
   - dos rejillas para gráficas: la izquierda en x 38–233 y la derecha en x 250–445, ambas en y 322–482;
   - una ranura para un botón en x 200–282, y 498–524.
   Escala el panel sin deformarlo a 700 px de alto y colócalo a la izquierda (x = 20, y = 10). Calcula las áreas con el mismo factor de escala y pon:
   - "Lo que pasó en el modelo" centrado en el listón;
   - en el área lisa, el resultado (NIVEL SUPERADO / NO SUPERADO / DESBORDE) y las métricas (nivel final, máximo, tiempo en banda, IAE e ISE);
   - h(t) con la banda y la referencia dentro de la rejilla izquierda, y v(t) dentro de la rejilla derecha, con fondo transparente para que se vea la rejilla del panel y sin salirse de ella;
   - el botón "Descargar CSV" sobre la ranura.
   A la derecha (x 650–1260), un panel con el modelo, los parámetros, las alarmas, τ medido frente al teórico, la explicación de 3 a 5 líneas y, abajo, el botón "Volver al menú" y la línea "CSV: t,u_crudo,u,x1,x2,y,v2,q_d,h_sp". Reparte el espacio para que no queden huecos grandes.

3. Simulación: deja un piso común en y = 600, con las baldosas de y 600 a 650 en la zona de la planta, y la barra inferior en y 660–712. Ningún sprite ni etiqueta debe entrar en la barra inferior.
   - Niveles 1 y 2: alambique de 300 px de alto, centrado en x = 320, con la base en y = 600.
   - Nivel 3: los dos alambiques de 240 px de alto. El alambique 1, con centro en x = 175 y la base en y = 360, sobre un pedestal de piedra que va de y 360 a y 600: usa la textura de baldosas_laboratorio con borde oscuro #1A1B1D (no un rectángulo gris liso). El alambique 2, con centro en x = 450 y la base en y = 600.
   - Tubo q12: sale del lado derecho de la base del alambique 1, baja, va en horizontal y entra por el centro de la cúpula del alambique 2, por arriba. Que no cruce el visor ni la etiqueta de ningún alambique. Pon el texto "q12 = c1·√h1" junto al tramo horizontal.
   - Válvula v1: en una tubería que entra desde el borde izquierdo de la zona de la planta y baja con un codo hasta el centro de la cúpula del alambique 1. La válvula, de 70 px, va en el tramo horizontal, completa y visible.
   - Válvula v2: en la salida del fondo del alambique 2, con un tramo corto de tubería hacia la derecha. Válvula de 70 px, completa y por encima del piso.
   - Etiquetas: cada alambique tiene una sola etiqueta "Alambique N · hN 1.20 m" con su placa y runa de 36 × 36 a la izquierda, dentro del mismo panel y alineadas en una fila. La del alambique 1 del nivel 3 va sobre la cara del pedestal, y las demás, sobre el piso (y 608–644), centradas bajo su alambique.
   - Barra inferior: la ayuda de manos en una sola línea de 13 px, por ejemplo "Mano derecha → v1 entrada · Pellizco izquierdo abierto → v2 abierta". Si no cabe, usa dos líneas que entren completas en la barra. El reloj con el tiempo en el centro y Terminar a la derecha.
   - Tendencias: en el eje vertical de válvulas, muestra solo números (0, 0.25, 0.5, 0.75 y 1), y la palabra "apertura" una sola vez como título del eje. Leyenda de cada tendencia con una muestra de color y su nombre (h1, h2, referencia, v1, v2). Aprovecha el espacio libre al final del panel de la HMI agrandando un poco las tendencias.

4. Menú:
   - Ajusta la altura del panel a su contenido, sin el hueco vacío de abajo, y pon los tres botones dentro del panel, en la última fila.
   - La línea de controles va en #E6E8EA, 14 px, centrada y completa en una o dos líneas dentro del panel. Ahora casi no se lee.
   - Que el logotipo no toque el panel.

Revisa con ?control=teclado el menú, la calibración, los niveles 1, 2 y 3 (con alarma H y HH) y la pantalla final después de jugar unos 20 s: nada se superpone, nada se corta, todo cabe en 1280 × 720 px y todos los botones responden en toda su área.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Nota:** las áreas del panel de la pantalla final (listón, área de texto, dos rejillas y ranura del botón) se midieron sobre la imagen original de 483 × 559 px.
- **Resultado:**
  - La pantalla final usa el panel de Gemini como fue diseñado: título en el listón, métricas en el área lisa, h(t) y v(t) dentro de las dos rejillas y el botón CSV en la ranura.
  - El nivel 3 tiene pedestal de piedra, tubo q12, válvulas completas y etiquetas con runa.
  - Los niveles 1 y 2 tienen el alambique apoyado en el piso.
  - El menú tiene los botones dentro del panel.
- **Detalles que quedan:**
  - El valor actual se monta sobre la leyenda de las tendencias.
  - La ayuda de la barra inferior toca el reloj en los niveles 1 y 2.
  - La línea de controles del menú casi no se lee.
  - El tubo q12 parece salir de la etiqueta de texto.
  - Quedan huecos en el panel de la HMI y en el panel derecho de la pantalla final.

---

## 46. Últimos detalles visuales (5.8)

```
Últimos detalles visuales (5.8), sin cambiar el modelo, los niveles, la entrada, las pruebas ni el CSV:
1. Leyendas de las tendencias: el valor actual se monta sobre la leyenda ("referenc1.49 m", "v0.88"). Pon el valor actual en su propia posición, a la izquierda del título o en una segunda línea, con al menos 12 px de separación de la leyenda. Aplícalo a las tendencias de la simulación y de la pantalla final.
2. Barra inferior de los niveles 1 y 2: el texto "camara · P linealización · D depuración · F terminar" toca el ícono del reloj. Alinea la ayuda a la izquierda (x = 290 en pantalla de 1280, o el inicio de la barra) y deja al menos 40 px libres antes del reloj, igual que en el nivel 3.
3. Menú: la línea de controles sigue casi invisible (gris oscuro sobre fondo oscuro). Usa color #E6E8EA, 14 px y opacidad completa, y reduce el recuadro que la contiene a su contenido.
4. Nivel 3, tubo q12: que se vea claramente que sale de la base del alambique 1 (lado derecho de su base, sobre el pedestal), y no del recuadro del texto "q12 = c1·√h1". Pon ese texto junto al tubo sin tapar el recorrido.
5. Panel de la HMI: hay un hueco vacío al final. Reparte el espacio agrandando un poco las dos tendencias o subiendo el panel inferior, sin dejar más de 20 px libres abajo.
6. Pantalla final: en el panel derecho, reduce el hueco entre "τ medido / teórico" y la explicación, para que el texto quede agrupado arriba y el botón "Volver al menú" abajo.
Revisa con ?control=teclado el menú, los niveles 1, 2 y 3 y la pantalla final, y confirma que todos los botones responden al hacer clic en cualquier punto de su área.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** las leyendas, la barra inferior, el menú y los paneles quedaron ordenados.
- **Observación de la pareja:** el alambique parece flotar, y en el nivel 3 las piezas están mal alineadas (pedestal, tubo q12 y válvulas). La pareja propuso usar el dibujo de Gemini con los dos alambiques apilados, que venía dentro de alambique_columna_liquido.jpg y no se había usado.

---

## 47. Planta: cascada apilada (nivel 3) y alambique apoyado (niveles 1 y 2) (5.8)

- **Cambio previo en docs/recursos.md:** se registró que alambique_columna_liquido.jpg contiene la cascada apilada y la columna de líquido. Se anotaron las fracciones de recorte y de los visores, medidas sobre la imagen, y que la llave del tubo de unión se considera siempre abierta. También se anotó que las baldosas no se usan en la simulación, porque no combinan con el fondo.

```
Ajustes de la planta (5.8), sin cambiar el modelo, los niveles, la entrada, las pruebas ni el CSV. Lee de nuevo docs/recursos.md: lo actualicé con la imagen de la cascada.

1. Nueva imagen para el nivel 3: public/assets/originales/alambique_columna_liquido.jpg contiene dos piezas sobre magenta. Recórtalas por separado en scripts/procesar-assets.mjs usando las fracciones de docs/recursos.md (relativas al ancho y al alto de la imagen):
   - cascada: x 0,063–0,433, y 0,115–0,972 → public/assets/sprites/alambique_cascada.png;
   - columna de líquido: x 0,693–0,773, y 0,087–0,913 → columna_liquido.png.
   Quita el magenta con tolerancia, porque es JPG. Guarda también, en un JSON junto al sprite, la posición de los dos visores dentro del recorte: superior x 0,213–0,227, y 0,253–0,447; inferior x 0,213–0,227, y 0,661–0,853 (fracciones de la imagen original, conviértelas al recorte). Ejecuta npm run assets.

2. Nivel 3 con los alambiques apilados: reemplaza los dos alambiques separados, el pedestal y el tubo q12 por alambique_cascada.png, de 510 px de alto y sin deformar, centrado en x = 330 y con la base en el piso (y = 600).
   - Dibuja con Graphics el líquido de h1 en el visor superior y el de h2 en el inferior: el fondo de cada visor es 0 m y su parte superior 3 m. Dibuja también la banda, la referencia y las marcas H y HH en el visor inferior, y solo H y HH en el superior.
   - Pon las escalas 0–3 m pegadas al lado derecho de cada visor.
   - Las válvulas ya vienen en el dibujo: v1 es la de arriba a la derecha y v2 la de abajo a la derecha. Junto a cada una pon una etiqueta pequeña sobre panel, "v1 55 %" y "v2 100 %", que se actualiza con la apertura. No dibujes válvulas extra en este nivel.
   - Junto a la llave del tubo de la izquierda, una etiqueta pequeña: "q12 = c1·√h1 (llave abierta)".
   - Las etiquetas "Alambique 1 · h1" y "Alambique 2 · h2", con su placa y runa, van a la izquierda de cada alambique, a la altura de su visor, sin tapar el dibujo.
   - Apoya la cascada en el piso del fondo con la misma sombra y la misma base de hierro del punto 3.

3. Piso y bases: los bloques de baldosas debajo de los alambiques (el pedestal y la franja del piso) no combinan con el fondo. Quita las baldosas de la simulación en los tres niveles. El fondo del laboratorio ya tiene piso: apoya los alambiques en él con una sombra elíptica oscura y suave bajo la base, y, si hace falta, una base baja de hierro forjado (#4A5056, con remaches, 20 px de alto) dibujada con Graphics.
   Niveles 1 y 2, para que el alambique no parezca flotar:
   - La tubería de entrada con la válvula v1 debe llegar de verdad a la tapa de la cúpula, sin huecos entre el tubo y el sprite. El volante sigue girando con la apertura.
   - Agrega un tramo corto de tubería de salida en la parte baja del alambique (el orificio por donde sale c1·√h1). En el nivel 2, ponle la etiqueta "consumo qd → caldero".

4. Revisa las posiciones en src/hmi/layout.js para que todas las piezas queden alineadas: tubos conectados a los sprites, etiquetas sin tapar el dibujo, nada flotando ni cortado, sin bloques de baldosas y nada dentro de la barra inferior.

Revisa con ?control=teclado los niveles 1, 2 y 3 (con alarma H y HH en el nivel 3) y confirma que el líquido de cada visor sigue a h1 y h2.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el nivel 3 usa los alambiques apilados, quitó las baldosas y agregó las etiquetas de v1, v2 y q12.
- **Errores:**
  - En el nivel 3 no se ve el líquido: el visor del dibujo es vidrio opaco y el líquido quedó detrás.
  - La "base de hierro" es una barra que flota debajo de los alambiques.
  - Los alambiques siguen sin apoyarse en nada.
  - Las tuberías dibujadas son delgadas, grises y no encajan con las válvulas ni llegan a la cúpula.
  - Las etiquetas de v1 y v2 quedan lejos de sus válvulas.
  - En el nivel 3, los tubos de salida terminan en el aire.
- **Decisión de la pareja:** volver a la 5.4 para pedir a Gemini una mesa de trabajo y el Caldero Real (que recibe la salida del alambique y representa el consumo qd del nivel 2).

---

## 48. Nuevos elementos: mesa de laboratorio y Caldero Real (5.4, regreso desde la 5.8)

- **Motivo:** la guía permite regenerar el arte en Gemini cuando no se entiende (sección 5.9, paso 13, y sección 5.4). Los alambiques flotaban y los tubos de salida no terminaban en nada.

```
/director-arte-videojuegos
Crea dos elementos nuevos para la planta, cada uno en su propia imagen sobre fondo magenta sólido #FF00FF, respetando la guía de estilo y con el mismo trazo, iluminación y colores que alambique_cuerpo_vacio.png:
1. mesa_laboratorio.png: mesa de trabajo de alquimista, de madera oscura y robusta, con refuerzos y esquinas de hierro forjado. Vista totalmente de frente (sin perspectiva), con el tablero recto y horizontal, vacía por encima (el juego pondrá el alambique sobre ella) y las cuatro patas apoyadas sobre una misma línea recta. Proporción aproximada 3:1 (ancho:alto).
2. caldero_real.png: el Caldero Real, un caldero de hierro negro con detalles de cobre, sobre tres patas cortas, visto de frente, lleno de poción verde #2ECC71 con una superficie simple, y con la boca abierta arriba para recibir el chorro de una tubería. Proporción aproximada 1:1.
No dibujes tuberías, válvulas ni alambiques. Sin texto, sin sombra en el piso, bordes nítidos, sin transparencias ni resplandor que se mezcle con el fondo magenta.
```

- **Resultado:** funcionó al primer intento. Se **aceptaron** las dos imágenes, sobre magenta sólido y sin texto:
  - **Mesa:** madera oscura con esquinas y refuerzos de hierro remachado.
  - **Caldero:** hierro negro con aros de cobre, tres patas, asas de anillo y poción verde.
- **Diferencias con lo pedido:**
  - La mesa no está totalmente de frente: se ve un poco desde arriba (el tablero y las patas traseras se ven) y su proporción es de unos 2,2:1. Se acepta; el alambique se apoya sobre la superficie del tablero, no en el borde del sprite.
  - El caldero también se ve un poco desde arriba, lo que ayuda a ver la boca.

---

## 49. Planta: líquido del nivel 3, mesa, caldero y tuberías (5.8)

- **Cambio previo en docs/recursos.md:** se agregaron caldero_real.png y mesa_laboratorio.png a la lista de recursos.

```
Ajustes de la planta (5.8), sin cambiar el modelo, los niveles, la entrada, las pruebas ni el CSV. Lee docs/recursos.md: agregué mesa_laboratorio y caldero_real (PNG o JPG; si son JPG, quita el magenta con tolerancia) en public/assets/originales/. Procésalos con npm run assets.

1. Nivel 3, líquido invisible: el visor de alambique_cascada.png es vidrio gris opaco, así que el líquido dibujado detrás del sprite no se ve. Dibuja el líquido, la banda, la referencia, las marcas H/HH y la escala por encima del sprite (setDepth mayor), recortados al rectángulo de cada visor. Si las fracciones del JSON no coinciden con la imagen real, detecta el rectángulo del vidrio buscando los píxeles grises claros del visor dentro de esa zona aproximada. Comprueba que con h1 = 1,5 m el líquido llega a la mitad del visor superior, y con h2 = 1,2 m al 40 % del inferior.

2. Quita la barra de hierro que quedó flotando debajo de los alambiques, en los tres niveles.

3. Niveles 1 y 2, alambique sobre la mesa: mesa_laboratorio de 390 px de ancho (sin deformar), centrada en x = 330, con la parte de abajo de las patas delanteras en y = 600. La mesa se ve un poco desde arriba: el tablero va del borde trasero (cerca del 17 % de la altura de la imagen) al borde delantero (cerca del 35 %). Apoya la base del alambique de 300 px de alto sobre la superficie del tablero, a la altura del 28 % de la imagen de la mesa, no en el borde superior del sprite, para que se vea parado encima. Sombra elíptica suave bajo las patas y bajo el alambique.

4. Caldero Real: caldero_real.png de 110 px de ancho, apoyado en el piso (y = 600).
   - En los niveles 1 y 2, a la derecha de la mesa. Un tubo de salida sale de la parte baja del alambique, pasa por el borde de la mesa y baja hasta quedar justo encima de la boca del caldero.
   - En el nivel 3, bajo el extremo del tubo de salida de la derecha de alambique_cascada.png, de modo que el tubo termine dentro de la boca del caldero.
   - Dibuja un chorro verde (#2ECC71, semitransparente) desde el extremo del tubo hasta la poción del caldero, con un grosor proporcional al caudal de salida: c1·√h1 en los niveles 1 y 2, y c2·v2·√h2 en el nivel 3. Sin caudal, no hay chorro.
   - En el nivel 2, la etiqueta "consumo qd → caldero" va sobre el caldero.

5. Tuberías: todas las tuberías dibujadas con Graphics deben verse como las del arte: cobre #B85A24 con un borde #1A1B1D de 2 px, un brillo claro en el centro y el mismo grosor y la misma altura que los extremos de tubo de valvula_cuerpo_estatico.png, para que encajen sin escalones ni huecos. En los niveles 1 y 2, la tubería de entrada viene desde el borde izquierdo, pasa por la válvula v1 (alineada con el centro de su tubo) y baja con un codo redondeado hasta tocar la tapa de la cúpula del alambique.

6. Nivel 3, sin piezas sueltas:
   - Apoya alambique_cascada.png en el piso (y = 600) con una sombra suave.
   - Las etiquetas "v1 …%" y "v2 …%" van junto a su válvula del dibujo, a menos de 20 px y con una línea fina que las una, igual que las etiquetas "Alambique 1 · h1" y "Alambique 2 · h2" con su visor.
   - El tubo de vidrio de la izquierda (unión q12) se ilumina en verde, más intenso cuanto mayor es q12 = c1·√h1.

Revisa con ?control=teclado los niveles 1, 2 y 3 (con alarma H y HH) y confirma que todo está conectado, que nada flota y que el líquido y el chorro siguen al modelo.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** en el nivel 3 ya se ve el líquido en los dos visores. En los niveles 1 y 2, el alambique está sobre la mesa, las tuberías son de cobre, la tubería de entrada llega bien a la cúpula y aparece el Caldero Real.
- **Errores (según la pareja):**
  - La mesa flota: no toca el piso del fondo.
  - La tubería de entrada nace en el aire.
  - La salida hacia el caldero tiene un tramo diagonal y no se entiende que el líquido va al caldero.
  - En el nivel 3 no hay mesa: la cascada flota y su tubo de salida no llega bien al caldero.
  - El brillo verde del tubo q12 quedó fuera del vidrio.

---

## 50. Uniones de tuberías, mesa en el piso y nivel 3 sobre la mesa (5.8)

- **Cambio previo en docs/recursos.md:** se agregaron las fracciones, medidas sobre la imagen, del cuerpo de la cascada, del extremo del tubo de salida y del tubo de vidrio q12.

```
Uniones de tuberías y mesa (5.8), sin cambiar el modelo, los niveles, la entrada, las pruebas ni el CSV. Primero calcula los puntos de anclaje (dónde empieza y termina cada tubo, el tablero de la mesa y la boca del caldero) a partir de los sprites ya escalados, guárdalos en src/hmi/layout.js y dibuja todo a partir de esos puntos, no con números a ojo.

1. Mesa apoyada en el piso, en los tres niveles: la parte de abajo de las patas delanteras va en y = 650 (el piso del fondo), con una sombra elíptica oscura de contacto bajo cada pata y bajo el caldero. Mueve la etiqueta "Alambique · h" para que no quede debajo de la mesa (por ejemplo, sobre la pared, arriba a la izquierda de la planta).

2. Niveles 1 y 2, tubería de entrada: no debe nacer en el aire. Debe salir de una brida de hierro con remaches (placa de 24 × 40 px, #4A5056) fija en el borde izquierdo de la zona de la planta, con dos soportes colgantes (varillas finas de hierro desde la barra superior) a lo largo del tramo horizontal. La válvula v1 va centrada sobre el tubo, con el tubo entrando por los dos extremos de su cuerpo, y el codo baja hasta la tapa de la cúpula, como ya está.

3. Niveles 1 y 2, tubería de salida hacia el caldero: debe salir del costado de la base del alambique, justo por encima del tablero, ir en horizontal hasta pasar el borde derecho de la mesa, bajar en vertical con codos redondeados de 90° (sin tramos diagonales) y terminar en un pico vertical hacia abajo, centrado sobre la boca del caldero y 15 px por encima de su borde. El chorro verde cae en vertical desde el pico hasta la poción, con un grosor proporcional a c1·√h1 y un mínimo visible de 2 px mientras haya caudal. El caldero va en el piso (y = 650), a la derecha de la mesa.

4. Nivel 3 sobre la mesa: pon mesa_laboratorio también en el nivel 3, con las patas en y = 650. Escala alambique_cascada.png (sin deformar) para que quepa entre y = 95 y el tablero, apoyado sobre la superficie del tablero (a la altura del 28 % de la imagen de la mesa), y mueve el conjunto a la izquierda para que el tubo de salida de la derecha quede fuera del borde derecho de la mesa. En la imagen original alambique_columna_liquido.jpg (2576 × 1438 px, fracciones del ancho y del alto completos):
   - cuerpo de los alambiques: x 0,139–0,308; base del alambique 2 en y 0,911;
   - extremo del tubo de salida de la derecha (pico hacia abajo): x 0,413–0,433, y 0,972;
   - tubo de vidrio de la unión q12: x 0,089–0,109, y 0,510–0,650.
   Coloca el caldero en el piso, con la boca centrada bajo el extremo del tubo de salida, y dibuja el chorro con un grosor proporcional a c2·v2·√h2. Convierte estas fracciones al recorte y a la escala reales; si no coinciden, detecta los píxeles del sprite.

5. Nivel 3, tubo de vidrio q12: el brillo verde quedó por fuera, más arriba y a la izquierda del vidrio. Dibújalo exactamente dentro del rectángulo del vidrio del punto 4 (con 2 px de margen), por encima del sprite, con una opacidad proporcional a q12 = c1·√h1.

6. Nivel 3, etiquetas: mantenlas fuera del dibujo y unidas a su pieza con una línea fina, como ahora, recalculadas para la nueva escala.

Revisa con ?control=teclado los niveles 1, 2 y 3 y confirma: la mesa y el caldero tocan el piso, los tubos salen de una pieza fija y llegan a otra sin huecos ni diagonales, el chorro cae dentro de la boca del caldero y el brillo q12 queda dentro del vidrio.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:**
  - El nivel 3 quedó bien según la pareja: la cascada está sobre la mesa, el brillo q12 queda dentro del vidrio y el tubo de salida cae al caldero.
  - En los niveles 1 y 2, la mesa y el caldero están en el piso, la entrada sale de una brida con soportes colgantes y el chorro cae en el caldero.
- **Detalle pendiente:** en los niveles 1 y 2, el tubo de salida empieza en el aire, separado del alambique.

---

## 51. Unión del tubo de salida con el alambique (5.8)

```
Niveles 1 y 2, unión del tubo de salida con el alambique (5.8). Solo cambia esto; el resto de la planta quedó bien.
El tubo de salida empieza en el aire, unos 20 px a la derecha del alambique, a la altura del borde del tablero. Debe verse que sale del alambique:
1. Detecta en el sprite escalado de alambique_cuerpo_vacio el borde derecho de su cuerpo a la altura de la parte baja (justo por encima del aro inferior de la base) y guarda ese punto en src/hmi/layout.js como salidaAlambique.
2. El tubo empieza 8 px dentro del sprite en ese punto: dibuja ese tramo por debajo del alambique (setDepth menor) para que quede tapado por él, y en la unión pon una brida de cobre (un anillo un poco más grueso que el tubo, #B85A24 con borde #1A1B1D y dos remaches) por encima del sprite, como las uniones del arte.
3. Desde ahí el tubo sigue en horizontal a la misma altura hasta pasar el borde derecho de la mesa y continúa como ahora: codos de 90°, bajada y pico vertical sobre la boca del caldero, con el chorro proporcional a c1·√h1. Si al subir la altura del tramo horizontal hace falta mover los codos, recalcúlalos desde los puntos de anclaje.
No cambies el nivel 3. Revisa con ?control=teclado los niveles 1 y 2.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el tubo ya nace en el alambique y tiene brida.
- **Observación de la pareja:** la brida quedó sobre el pie ensanchado de la base y parece que el tubo cuelga del borde. Se pide que salga del cuerpo del tanque y que se vea el líquido salir.

---

## 52. Salida soldada al cuerpo del alambique y flujo visible en el tubo (5.8)

```
Niveles 1 y 2, salida del alambique (5.8). Ya está casi bien, pero la brida quedó sobre el pie ensanchado de la base y parece que el tubo cuelga del borde, no que sale del tanque. Cámbialo así:
1. Mueve el punto salidaAlambique a la pared vertical del cuerpo cilíndrico, en su parte más baja: justo por encima del aro donde termina el cilindro y empieza el pie ensanchado. Detecta ese punto en el sprite escalado (el borde derecho del cuerpo a esa altura) y guárdalo en src/hmi/layout.js.
2. En ese punto dibuja una boquilla corta de cobre que sale del cuerpo (12 px, un poco más ancha que el tubo), con una brida redonda de cobre más grande que la actual y cuatro remaches, encima del sprite, para que se lea como una salida soldada al tanque. El tubo empieza en la boquilla y sigue en horizontal a esa misma altura hasta pasar el borde derecho de la mesa. Después los codos de 90°, la bajada y el pico sobre la boca del caldero siguen como ahora, recalculados desde el nuevo punto.
3. Para que se vea que el líquido sale del tanque, dibuja dentro de todo el tubo, desde la boquilla hasta el pico, un canal verde (#2ECC71) de la mitad del grosor del tubo con trazos que avanzan en el sentido del flujo. La velocidad de los trazos es proporcional a c1·√h1, y sin caudal el canal no se ve. El chorro sobre el caldero sigue igual.
No cambies el nivel 3. Revisa con ?control=teclado los niveles 1 y 2.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** en los niveles 1 y 2, el tubo sale de una brida soldada a la pared del cuerpo cilíndrico, y un canal verde muestra la poción saliendo del alambique hasta el Caldero Real. El nivel 3 sigue igual (cascada sobre la mesa, brillo q12 dentro del vidrio y salida al caldero).

---

## 53. Rendimiento de la cámara y respuesta de las barras (5.8)

- **Problema detectado en la revisión de la pareja:** la detección de manos baja a menos de 10 FPS y nunca llega a 20 (la lista de comprobación de la 5.6 pide 20 o más), y la barra de v1 se mueve a saltos y con retraso. Una parte del retraso es del modelo: la válvula tiene una velocidad máxima de 0,25 1/s, así que tarda 4 s de 0 a 100 %. Otra parte es de rendimiento: el arte nuevo se redibuja en cada cuadro, en el mismo hilo que MediaPipe, y las barras solo se actualizan 10 veces por segundo.

```
Rendimiento de la cámara y respuesta de las barras, sin cambiar el modelo (la válvula sigue con velocidad máxima de 0,25 1/s), los niveles ni el CSV.
Problema: desde que se integró el arte, la detección de manos baja a menos de 10 FPS y nunca llega a 20 (la guía pide 20 o más), y la barra de v1 se mueve a saltos y con retraso.

1. Diagnóstico: en el panel de depuración (D) agrega el tiempo medio de detectForVideo en ms, el tiempo medio de cada cuadro de Phaser en ms, el delegado de MediaPipe en uso (GPU o CPU) y la resolución real del video. Escribe también en la consola, una vez al iniciar la cámara, el delegado y la resolución.
2. Menos carga en el hilo principal:
   - Limita Phaser a 30 FPS (fps: { target: 30, limit: 30 } en main.js).
   - Dibuja una sola vez las partes fijas de la planta (mesa, tuberías, bridas, soportes, sombras, escalas y etiquetas fijas) en un Graphics o RenderTexture estático. En cada cuadro actualiza solo lo que cambia: el líquido, el canal y el chorro, la runa, los volantes, las barras y los textos con valores.
   - Las tendencias se siguen redibujando 10 veces por segundo, y el panel de depuración 5 veces por segundo.
   - dibujarPuntosDepuracion solo debe ejecutarse cuando el panel D está visible.
3. MediaPipe más liviano:
   - numHands = 1 en los niveles 1 y 2 (solo se usa la mano derecha) y 2 en el nivel 3 y en la calibración. Cámbialo con detector.setOptions al iniciar cada nivel, sin crear otro detector.
   - Conserva el delegado GPU, con respaldo en CPU.
   - Si después de 5 s la detección promedia menos de 18 FPS, baja el video a 320 × 240 y avísalo en el panel D.
4. Barras de las válvulas:
   - Actualiza las barras de v1 y v2 y sus textos en cada cuadro, no 10 veces por segundo.
   - Sobre cada barra, dibuja una marca blanca (un triángulo pequeño) en la posición que pide la mano (el mando, antes del actuador), para que el jugador vea al instante que su gesto se detecta. El relleno naranja sigue siendo la apertura real de la válvula, que alcanza al mando a 0,25 1/s.
   - Debajo de las barras, una línea corta de ayuda: "▲ mano · ■ válvula (tarda 4 s de 0 a 100 %)".
Prueba con la cámara en los niveles 1 y 3 y anota en tu respuesta los FPS de detección, de cámara y del juego, y los tiempos del panel D.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:**
  - La detección sube a 20,6 FPS (46 ms por detección, delegado GPU), después de bajar el video a 320 × 240 de forma automática.
  - Las barras muestran la marca ▲ de la mano y la ayuda "tarda 4 s de 0 a 100 %".
- **Problemas que quedan:**
  - El juego corre a 17,5 FPS (64 ms por cuadro).
  - Con la mano a media altura, el panel D muestra "altura 1.00→0.99": la calibración guardada tiene un rango tan corto que v1 se queda en 100 % aunque la mano no esté arriba.

---

## 54. Calibración saturada y costo de los textos (5.8)

- **Antes de enviarlo:** la pareja volvió a calibrar y la altura siguió saturada. Revisando src/juego/Calibracion.js se encontró la causa: cada paso usa solo 3 muestras promediadas, y la primera se toma con la mano todavía en movimiento. Se agregó al prompt la forma correcta de medir (percentiles 10 y 90 durante 2 s, después de 1,5 s de preparación).

```
Calibración de la altura de la mano y rendimiento del juego, sin cambiar el modelo, los niveles ni el CSV.

1. Calibración saturada: con la mano derecha a media altura de la zona, el panel D muestra "der en zona | altura 1.00→0.99" y v1 se queda en 100 %. La calibración guardada en localStorage tiene un rango demasiado corto: el valor medido llega al "máximo" calibrado con la mano todavía baja, y el resto del recorrido queda recortado en 1.
   - En el panel D muestra por cada canal tres valores: la medida sin calibrar (medidaCruda), el valor calibrado y el rango guardado [min, max].
   - Al guardar la calibración, rechaza un canal si max − min < 0.30 (en unidades sin calibrar), muestra "Rango muy corto, repite el paso moviendo la mano hasta el borde de la zona" y repite ese paso.
   - Al cargar una calibración guardada con un rango menor que 0.30 en algún canal, ignora ese canal (usa el valor sin calibrar) y avísalo en la consola.
   - Causa en src/juego/Calibracion.js: cada paso toma solo 3 muestras, una por segundo, y la primera llega 1 s después de empezar el paso (250 ms después del paso anterior), cuando la mano todavía se está moviendo. Además, el promedio de las tres acerca el máximo y el mínimo al centro. Cámbialo así: cada paso muestra "Prepárate…" durante 1,5 s sin medir; después mide en cada cuadro durante 2 s, mientras la mano esté en la zona. Para "abajo", "cerrado" e "izquierda" guarda el percentil 10 de las muestras, y para "arriba", "abierto" y "derecha" el percentil 90. Si hay menos de 15 muestras válidas, repite el paso.
   - Agrega en el menú el botón "Restablecer calibración", que borra alambique.calibracion de localStorage.
   - En la calibración, para "Mano abajo" y "Mano arriba", dibuja sobre la vista de la cámara una franja en el borde inferior y otra en el superior de la zona, y muestra en vivo el valor medido para que el jugador vea que llega al extremo.
2. Rendimiento del juego (el panel D marca 17.5 FPS y 64 ms por cuadro):
   - Cada setText de Phaser vuelve a dibujar la textura del texto. Llama a setText solo cuando el texto que se muestra cambia de verdad (guarda el último texto de cada objeto), en las barras, las etiquetas, el tiempo, las tendencias, el avance del criterio y el panel D.
   - Las barras y la marca ▲ de la mano se siguen moviendo en cada cuadro (son Graphics), pero sus textos de porcentaje solo se actualizan cuando cambia el número entero.
   - Agrega al panel D el desglose del tiempo por cuadro: modelo, HMI y planta, tendencias y render.
Prueba con la cámara en los niveles 1 y 3, después de pulsar "Restablecer calibración" y de calibrar de nuevo, y anota en tu respuesta los FPS del juego y de la detección.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** la calibración ya toma muestras continuas y comprueba el rango, pero el paso del giro de la mano derecha falla siempre con "Rango giro menor que 0,30", aunque se gire 45° a cada lado.

---

## 55. Sentido del giro y calibración solo de los canales usados (5.8)

- **Causa encontrada en el código:** el giro se calcula sobre la imagen sin espejar y la vista del jugador está espejada, así que "izquierda" da un valor positivo y "derecha" uno negativo. Con eso, max − min siempre sale negativo y la comprobación del rango nunca se cumple. Además, el juego no usa el giro: solo usa la altura de la mano derecha y el pellizco de la izquierda.

```
Calibración del giro: el paso "Giro a la izquierda / derecha" falla siempre con "Rango giro menor que 0,30", aunque el jugador gire la mano 45° como se pide.
Causa: giro = atan2(p9.x − p0.x, p0.y − p9.y) se calcula sobre la imagen de la cámara sin espejar, y la vista que ve el jugador sí está espejada. Por eso, al girar hacia SU izquierda el giro sale positivo, y al girar hacia su derecha sale negativo: max − min es negativo y la comprobación del rango nunca se cumple.
1. Corrige el signo del giro para que coincida con la vista espejada: girar los dedos hacia la derecha del jugador da un giro positivo. Comprueba también que "x" (izquierda / derecha) tenga el mismo sentido que la vista.
2. En la comprobación del rango usa |max − min| ≥ 0.30, y en la conversión con la calibración acepta rangos invertidos (min > max) sin recortar todo a 0 o a 1.
3. Calibra solo los canales que usa este juego, según src/juego/mapaControl.js: la altura de la mano derecha (v1) y el pellizco de la mano izquierda (v2). Quita los pasos de giro y de la altura y el pellizco de la otra mano.
4. Guarda la calibración después de cada canal aceptado (no solo al final), para que "Omitir calibración" conserve lo que ya se calibró.
No cambies el modelo, los niveles ni el CSV. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** la calibración pide solo la altura de la mano derecha y el pellizco de la izquierda. Ya no falla, y la barra de v1 sigue a la mano en todo el recorrido.

---

## 56. Escalón de verificación (5.9 a)

- **Cierre de la 5.8:**
  - `npm test` pasa las 9 pruebas y `npm run build` funciona; commit "Integración de personajes y escenarios".
  - Medidas con la cámara en el nivel 1: juego a 42,9 FPS (47,5 ms por cuadro), detección a 18–20,6 FPS (41 ms por detección, delegado GPU, video de 320 × 240) y cámara a 30 FPS.
  - La detección queda en el límite de los 20 FPS de la guía. Se aplicó la medida que indica la guía (bajar la resolución) y el límite lo pone el tiempo de detección del equipo.
- **Motivo del cambio:** el escalón anterior (v1 de 0 a 1) desborda el alambique a los 26,6 s, así que no se estabiliza como pide el paso 2 de la 5.9. Se cambia por un escalón pequeño alrededor del punto de operación del nivel 1 (h0 = 1,5 m), para comparar con la linealización de la 5.3. Según el cálculo de la pareja, con Δv1 = +0,01 el cambio final es 0,0494 m (el lineal es 0,0490, una diferencia del 0,8 %) y τ ≈ 12,41 s (el lineal es 12,25 s, una diferencia del 1,3 %). Con Δv1 = +0,02 la diferencia en τ ya sería del 2,5 %, por encima del 2 %.
- **Vensim:** se creó `vensim/alambique_escalon_verificacion.mdl`: el mismo diagrama de Forrester, con el volumen inicial en 1,5 m³, v1 = IF THEN ELSE(Time<2, 0.612372, MIN(0.622372, 0.612372+0.25*(Time-2))) y FINAL TIME = 80. El modelo de la 5.3 no se modifica.

```
Verificación del modelo (5.9 a). Cambia la prueba de escalón para que el nivel se estabilice y se pueda comparar con la linealización de docs/modelo.md (h0 = 1,5 m, τ = 12,25 s, K_v1 = 4,90 m). No cambies el modelo, los niveles normales ni el formato del CSV.
1. Con ?control=escalon (o "Escalón de prueba" en el menú), en el nivel 1:
   - estado inicial h1 = 1,5 m; el actuador v1 arranca en el equilibrio 0.612372 (= c1·√1.5 / 0.4);
   - mando de v1: 0.612372 hasta t = 2 s y 0.622372 desde t = 2 s (un escalón de +0,01); el actuador sigue con su velocidad máxima de 0,25 1/s;
   - duración de 80 s; no termines la partida por el criterio del nivel ni por el tiempo en banda, solo a los 80 s (o con F);
   - la pantalla final y el CSV funcionan igual que siempre.
   Ahora el escalón cambia der.altura de 0 a 1: cámbialo para que entregue directamente esos valores de mando, y actualiza la prueba "la fuente escalón…" de test/modelo.test.js.
2. En test/modelo.test.js imprime también el error máximo de Euler en la prueba de segundo orden (ζ = 0.3, ωn = 4, h = 1/120), igual que en la de primer orden, sin exigirle un límite.
3. Agrega a test/modelo.test.js una prueba "escalón de verificación": simula con crearSistemaTanques y Actuador el mismo escalón del punto 1 durante 80 s y comprueba que el valor final queda a menos del 1 % de (0.4·0.622372/0.2)² = 1.5494 m. Imprime h1(80 s) y el tiempo en que h1 alcanza el 63,2 % del cambio, medido desde t = 2 s.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** `npm test` aprueba las 10 pruebas. Euler en segundo orden da un error de 2,19·10⁻²; en el escalón de verificación, h1(80 s) = 1,54929 m y t63,2 = 12,40 s desde t = 2 s. La partida con `?control=escalon` dura 80 s y se guardó como `docs/juego_escalon.csv`.
- **Comparación (ver modelo.md, sección 5.9 a):** el juego y Vensim difieren como máximo en 1,1·10⁻⁴ m. Frente al cálculo de la 5.3, el valor final difiere un 0,6 % y τ un 0,9 % (12,36 s frente a 12,25 s). El modelo verifica, con diferencias por debajo del 2 %.
- **Problema con el CSV de Vensim:** el archivo exportado llegó con los decimales dañados (por ejemplo, 1,50002 aparecía como "150.002"), seguramente por abrirlo y guardarlo con la configuración regional en español. Se reconstruyó cada valor a partir de sus dígitos (todos los niveles están entre 1 y 10 m), se revisó que la curva fuera continua y creciente, y se guardó como `t,h1` con punto decimal.

---

## 57. Medición del filtro de los gestos (5.9 b)

- **Cambio de sesión:** a partir de esta entrada se usa Codex con otra cuenta de ChatGPT (plan gratuito), en un chat nuevo del mismo proyecto, porque se acabó el límite de uso de la primera cuenta.
- **Motivo:** el paso 7 de la 5.9 pide comparar α = 0,2, 0,5 y 0,8 (ruido en reposo y retraso), pero el juego tenía α fijo en 0,35 y no medía el retraso.

```
Prueba del filtro de los gestos (5.9 b). Solo agrega herramientas de medición al panel de depuración (D); no cambies el modelo, los niveles, el CSV ni el comportamiento normal del juego.
1. En el panel D agrega cuatro botones para elegir el α del filtro exponencial de los gestos: 0,2 · 0,35 (el actual) · 0,5 · 0,8. El cambio se aplica al instante y se guarda en localStorage (alambique.alfa); por defecto queda 0,35.
2. En el panel D muestra para la altura de la mano derecha y el pellizco de la izquierda:
   - el ruido en reposo: la oscilación pico a pico del valor filtrado en los últimos 2 s;
   - el τ equivalente del filtro en ms (τ = −Ts / ln(1 − α), con el Ts medido).
3. Medición del retraso: cuando el valor sin filtrar de un canal cambia más de 0,4 en menos de 150 ms (un movimiento brusco), mide el tiempo, en ms, hasta que el valor filtrado recorre el 90 % de ese salto. Muestra en el panel D el último retraso medido y el promedio de los últimos 5, por canal.
4. Botón "Copiar medición" en el panel D que copie al portapapeles una línea de texto con: α, Ts, τ, ruido y retraso de cada canal.
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el panel D tiene los botones de α, el ruido, τ y "Copiar medición". Con α = 0,2 y la mano quieta: ruido de 0,0035 y τ = 280 ms (Ts = 62 ms). El retraso casi nunca se mide ("—"): a unos 16 FPS, un movimiento brusco tarda más de 150 ms en la señal sin filtrar y no cumple la condición.

---

## 58. Ajuste de la medición del retraso del filtro (5.9 b)

```
Ajuste de la medición del retraso (5.9 b, punto 7). Con la detección a unos 16 FPS (Ts ≈ 62 ms), un movimiento brusco de la mano de abajo hacia arriba tarda 200–400 ms en la señal sin filtrar, así que la condición actual (cambio mayor que 0,4 en menos de 150 ms) casi nunca se cumple y el retraso queda en "—".
Cambia la detección del movimiento brusco en el panel D:
1. Un movimiento empieza cuando el valor sin filtrar se aleja más de 0,05 de su valor en reposo (el promedio de los 0,5 s anteriores, con la mano quieta).
2. Termina cuando el valor sin filtrar se queda quieto (cambia menos de 0,03 durante 0,3 s). Solo cuenta si el salto total es mayor que 0,4.
3. El retraso es el tiempo entre el momento en que el valor sin filtrar alcanza el 90 % del salto y el momento en que el valor filtrado alcanza ese mismo 90 %. Así se mide solo el retraso que agrega el filtro.
4. Muestra también el contador de movimientos medidos (n) y conserva "último" y "media 5".
No cambies nada más. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el panel D ya mide el retraso con el contador n. Mediciones de la pareja (ver docs/pruebas_5_9.md): α = 0,2 → ruido 0,0035 y retraso ≈ 770 ms; α = 0,5 → 0,033 y ≈ 161 ms; α = 0,8 → 0,08 y ≈ 39 ms. El último movimiento de cada serie sale atípico porque es la mano yendo a pulsar "Copiar medición"; se descarta.

---

## 59. α = 0,5 por defecto (5.9 b)

```
Filtro de los gestos (5.9 b, punto 7): en las pruebas con la cámara se midió α = 0,2 → ruido 0,0035 y retraso ≈ 770 ms; α = 0,5 → ruido 0,033 y retraso ≈ 161 ms; α = 0,8 → ruido 0,08 y retraso ≈ 39 ms. La pareja eligió α = 0,5.
1. Deja α = 0,5 como valor por defecto del filtro exponencial de los gestos (hoy es 0,35), en el código y en el valor inicial de localStorage (alambique.alfa). Si alguien ya tiene guardado otro α, se respeta el guardado; el botón 0,35 del panel D cámbialo por 0,5 para que los botones queden 0,2 · 0,5 · 0,8.
2. Actualiza las pruebas de test/modelo.test.js que dependan del α por defecto.
No cambies nada más. No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el panel D muestra α = 0,500 y los botones 0,2 · 0,5 · 0,8. La 5.9 se cierra con el commit "Correcciones del playtest".

---

## 60. Correcciones del playtest (5.9 d)

- **Origen:** observaciones y respuestas de la otra pareja (ver docs/pruebas_5_9.md, sección 5.9 d).

```
Correcciones del playtest (5.9 d). Otra pareja jugó sin explicaciones. Identificó el concepto (un tanque con caudal de entrada y de salida), pero: (a) en el nivel 3 creyó que v2 se controlaba subiendo y bajando la mano izquierda, como v1, cuando es con el pellizco; y (b) al preguntarle qué parámetro cambia el comportamiento, solo mencionó que la mano abre y cierra la válvula, sin notar que cada apertura lleva el nivel a un equilibrio distinto y que llega con retraso. Cambia solo la HMI; no cambies el modelo, los niveles ni el CSV.
1. Ayuda del pellizco en el nivel 3: durante los primeros 8 s del nivel, y cada vez que la mano izquierda entre a la zona después de haber salido, muestra junto a la barra de v2 una animación pequeña (dibujada con Graphics) de un pulgar y un índice que se abren y se cierran, con el texto "Pellizco izquierdo: abrir = v2 abierta". Que no tape las tendencias ni el visor.
2. Marca de equilibrio en el visor: dibuja una línea punteada blanca, delgada, en el nivel al que llegaría el alambique si la apertura actual se mantuviera:
   - alambique 1: h1_eq = ((0.4·v1 − qd1) / c1)², donde qd1 es el consumo que se resta al alambique 1 (niveles 1 y 2), recortado entre 0 y 3 m;
   - alambique 2 (nivel 3): h2_eq = ((c1·√h1 − qd) / (c2·v2))², recortado entre 0 y 3 m (si v2 = 0, la marca va en 3 m).
   Al lado, una etiqueta corta: "equilibrio". La marca se mueve en cuanto cambia la válvula, mientras el líquido llega despacio, y así se ve el retraso del tanque.
3. En la pantalla "Lo que pasó en el modelo", agrega a la explicación una línea: "Cada apertura de la válvula lleva el nivel a un equilibrio distinto, h_eq = (0,4·v1/c)², y el tanque tarda unas 4τ en llegar a él".
No modifiques docs/, vensim/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** en los tres niveles, el visor muestra la marca "equilibrio" en el nivel al que llegará el líquido con la apertura actual. Por ejemplo, en el nivel 1, con v1 = 58 %, la marca queda cerca de 1,35 m mientras h1 todavía va en 0,68 m. En el nivel 3 aparece la ayuda "Pellizco izquierdo: abrir = v2 abierta" junto a la barra de v2.

---

## 61. Primera fila del CSV con u_crudo correcto (5.10)

- **Problema detectado en la identificación:** con u_crudo, el script de la guía daba R² negativos (−0,86 en identificación y −4,15 en validación). La causa es la primera fila del CSV: u_crudo = 0,5 por defecto. Al quitar esa fila, R² sube a 0,995 y 0,994. Ver docs/identificacion.md.

```
Registro de la partida (5.10): en el CSV, la primera fila (t = 0) trae u_crudo = 0.5, el valor por defecto antes de leer la mano o el teclado, aunque u = 0.3536; desde la segunda fila u_crudo ya vale el mando real. Como analisis/identificar.py toma el primer valor de cada señal como punto de operación, esa fila mete un corrimiento falso en todo el ensayo.
Corrige el registro para que en la primera fila u_crudo sea igual al mando con que arranca el actuador (el valor inicial de v1) cuando todavía no hay lectura de la mano, en las cuatro fuentes de control. Agrega una prueba en test/modelo.test.js que compruebe que la primera fila del CSV tiene u_crudo igual a u.
No cambies nada más. No modifiques docs/, vensim/, analisis/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** los CSV nuevos ya traen en la primera fila u_crudo = u (por ejemplo, 0,612372 en los escalones de sensibilidad).

---

## 62. Panel de parámetros para el análisis de sensibilidad (5.10 d)

- **Motivo:** la parte d) de la 5.10 pide variar un parámetro en ±20 % desde el panel P y medir el valor final, Mp y ts, pero el panel P del juego solo mostraba la linealización.

```
Análisis de sensibilidad (5.10 d). La guía pide variar un parámetro clave del modelo en −20 %, 0 % y +20 % con el panel de parámetros (tecla P) y la entrada ?control=escalon, y registrar la respuesta. Hoy el panel P solo muestra la linealización. Cambia solo el panel P, el escalón y la pantalla final; no cambies las ecuaciones del modelo ni el formato del CSV.
1. En el panel P agrega selectores para el área A y el coeficiente de descarga c1 (y c2 en el nivel 3), con tres opciones cada uno: −20 %, nominal y +20 % (A: 0,8 · 1 · 1,2 m²; c1: 0,16 · 0,2 · 0,24 m^2,5/s). Agrega un botón "Aplicar y reiniciar" que reinicie la partida actual con esos parámetros en el SistemaContinuo. Guarda la elección en localStorage para que siga al reiniciar, y agrega un botón "Valores nominales". Muestra en la HMI una etiqueta visible "Parámetros modificados: …" cuando alguno no sea el nominal.
2. Escalón de verificación con parámetros modificados: el alambique debe arrancar en el equilibrio que corresponde a esos parámetros con v1 = 0.612372, es decir, h1(0) = (0.4·0.612372 / c1)²; a los 2 s el mando sube a 0.622372, como ahora. Sube la duración del escalón de 80 s a 120 s, para que con c1 −20 % (τ ≈ 19 s) el nivel alcance a estabilizarse.
3. En la pantalla final muestra los parámetros usados (A, c1, c2) y, para el escalón, el valor final de h1, el sobreimpulso Mp (%) y el tiempo de establecimiento ts (2 %) medido desde t = 2 s.
4. Agrega a test/modelo.test.js una prueba que simule el escalón con c1 = 0.16 y 0.24 y compruebe que el valor final se acerca a (0.4·0.622372/c1)² con menos del 1 % de error.
No modifiques docs/, vensim/, analisis/, PROMPTS.md, index.html ni vite.config.js. No controles el computador ni el navegador. Al terminar ejecuta npm test y npm run build.
```

- **Resultado:** el panel P permite elegir A y c1 en −20 %, nominal y +20 %, con "Aplicar y reiniciar" y "Valores nominales". El escalón arranca en el equilibrio de cada juego de parámetros y dura 120 s. Las 5 corridas y la tabla de sensibilidad están en docs/identificacion.md.
