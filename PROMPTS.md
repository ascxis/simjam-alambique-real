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
| 36 | 5.7 | Codex | Banda de tolerancia en el alambique y avance del criterio | (pendiente) |

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

- **Prompts:** (copiar aquí, en orden, los textos enviados a Codex desde el historial de la conversación: reloj en tiempo real, detección en un Web Worker y mensajes "terminar: ..." en la consola).
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

- **Resultado:** (pendiente)

---

<!-- Siguientes entradas: 5.7 (prompt específico del simulador), 5.8 (arte), 5.9 y 5.11 (prompts de corrección). -->
