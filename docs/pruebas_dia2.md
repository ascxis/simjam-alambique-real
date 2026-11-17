# Pruebas del día 2 — Alambique Real: El Arte de la Alquimia

Tablas de las secciones 5.1, 5.5 y 5.7 de la guía del día 2. Las celdas marcadas **pendiente** son mediciones que solo se pueden hacer jugando con las manos frente a la cámara (nivel 1 con gestos, FPS de detección, prueba de gestos, sonificación a ciegas y prueba con otra pareja).

## 5.1 Revisión del estado del simulador y línea base del modelo

| Verificación | Resultado |
|---|---|
| npm test sin fallas | Sí: 13/13 al iniciar el día 2 (PROMPTS 63); 60/60 al cerrar la etapa 8 |
| npm run build sin errores | Sí al iniciar el día 2 (PROMPTS 63 y 64) |
| Requisitos de la sección 5.5.1 (día 1) | Cumple: Phaser 3.87 y MediaPipe 0.10.14 (Hand Landmarker) por CDN, `base: './'` en vite.config.js, sin `import` de Phaser y rutas relativas |
| src/modelo/ independiente de Phaser | Sí: no importa Phaser ni usa el DOM (la descarga del CSV pasó a `src/hmi/descargarCSV.js`, PROMPTS 64); las escenas no calculan física y los actuadores usan la clase Actuador |
| Niveles cargados desde docs/niveles.md | Sí: `niveles.js` carga los 3 niveles de `niveles.json` (El Primer Destilado, La Demanda del Caldero Real, El Elixir Doble en Cascada) |
| Elementos que se dibujan con figuras | Líquido de los visores, escalas, marcas de equilibrio, tuberías y bridas, chorros y canal de salida, tubería de intercambio del nivel 3 y toda la HMI (tendencias, barras y panel) con Graphics |
| Recursos que faltan en public/assets | Ninguno de los 13 de docs/recursos.md; faltaba todo el audio (PROMPTS 63) |
| Archivo de línea base del modelo | `docs/linea_base_escalon.csv`: valor final 1,5494 m, tiempo de subida 27,256 s, Mp 0,00 % |
| Resultado del nivel 1 / FPS del simulador / FPS de detección | Nivel 1 superado (30 s seguidos en la banda) / 42,9 FPS / 18 a 20,6 FPS (PROMPTS 53 a 56); aciertos de gestos del día 1: 100 % (docs/pruebas_5_9.md) |

## 5.5 Integración por etapas

| Etapa | Descripción | Archivos modificados | ¿Pasa la regresión? | Commit |
|---|---|---|---|---|
| 1 | Carga de recursos | `src/juego/Arranque.js`, `src/juego/contexto.js`, `test/regresion.test.js` | Sí | `8b29c35` Procesa y centraliza la carga de recursos del día 2 |
| 2 | Equipo principal y estados | `scripts/hojas_equipo.py`, `public/assets/sprites/equipo/`, `src/juego/animaciones.js`, `src/juego/entidades/Equipo.js`, `src/juego/Galeria.js`, `src/juego/Menu.js`, `src/juego/Simulacion.js`, `src/main.js`, atlas `piezas` | Sí | `edd0c9e` Etapas 2 y 3 (el primer intento, `f821c6d`, se revirtió en `8ae076c`) |
| 3 | Actuadores y piezas del modelo | `src/hmi/representacion.js`, `src/hmi/tanques.js`, `src/juego/Simulacion.js` | Sí | `edd0c9e` (el primer intento, `1e299e4`, se revirtió en `8ae076c`) |
| 4 | Perturbaciones y avisos | `src/juego/perturbaciones.js`, `src/juego/Simulacion.js`, `src/hmi/tendencia.js`, `public/assets/sprites/llave_consumo_*` | Sí | `18a806e` |
| 5 | Escenario | `src/juego/niveles/escenario.js`, `public/assets/tiles/laboratorio_tiles.png`, `src/juego/Arranque.js`, `src/juego/Simulacion.js` | Sí | `04272d9` Etapa 5: escenario con Tilemap, decoraciones animadas y ambiente |
| 6 | Efectos y retroalimentación | `src/juego/efectos/resorteVisual.js`, `src/juego/Simulacion.js`, `src/juego/Menu.js` | Sí | `18a806e` |
| 7 | Música, efectos sonoros y sonificación | `scripts/procesar-audio.mjs`, `src/juego/audio.js`, `src/juego/EscenaBase.js`, `src/juego/Menu.js`, `src/juego/Simulacion.js`, `public/assets/audio/` | Sí | `18a806e` Música, efectos sonoros y sonificación (etapa 7) |
| 8 | Rendimiento, robustez y tamaño | `src/main.js`, `src/juego/rendimiento.js`, `src/hmi/panelDepuracion.js`, `src/juego/Simulacion.js`, `scripts/crear-atlas.mjs`, `test/paso-fijo.test.js`, `test/escenario-rendimiento.test.js` | Sí | `55b1008` Etapa 8: rendimiento, robustez del paso fijo y tamaño |

Antes de las etapas 2, 5 y 8 se incorporaron los cambios del despliegue (gamepad, cámara y "Configurar controles") en `88fc776`.

## 5.7 a) Regresión del modelo

Salida de `python analisis/regresion.py docs/dia2_escalon.csv docs/dia2_escalon_lento.csv` (guardada en `docs/dia2_regresion_salida.txt`):

```
línea base: valor final = 1.5494 tr = 27.256 s                 Mp = 0.00 %
docs/dia2_escalon.csv: valor final 0.00 %, tr 0.00 %, Mp 0.00 puntos -> pasa
docs/dia2_escalon_lento.csv: valor final 0.00 %, tr 0.00 %, Mp 0.00 puntos -> pasa
```

- Los dos CSV se descargaron del juego (botón "Descargar CSV" de la pantalla final) con `?control=escalon` en el nivel 1, en Chromium. El lento se tomó con la CPU 4x más lenta (`Emulation.setCPUThrottlingRate`, lo mismo que Chrome DevTools → Performance → CPU: 4x slowdown).
- Durante la captura el juego corrió a unos 7 FPS (normal) y 5 FPS (CPU 4x), porque ese navegador dibuja WebGL por software. Aun así la respuesta es la misma: el paso fijo h = 1/120 s del integrador no depende de los FPS. Con menos FPS el CSV tiene menos filas (702 y 449), porque se registra como máximo una fila por cuadro.
- `test/paso-fijo.test.js` repite el bucle del juego a 60, 30 y 15 FPS, con cuadros irregulares de 8 a 120 ms y con un tirón de 0,5 s: todas las métricas pasan.
- `src/modelo/niveles.json` no cambió (prueba "los niveles coinciden con la copia de referencia").

## 5.7 b) Mediciones

| Medición | Antes (día 1) | Después (día 2) | Meta |
|---|---|---|---|
| Regresión del modelo: valor final / tiempo de subida / Mp | 0 | 0,00 % / 0,00 % / 0,00 puntos | < 0,5 % / < 2 % / < 1 punto |
| Regresión con CPU 4x: valor final / tiempo de subida / Mp | — | 0,00 % / 0,00 % / 0,00 puntos | < 0,5 % / < 2 % / < 1 punto |
| Valor del criterio del nivel 1 | Superado: 30 s seguidos en la banda | **pendiente** (jugar el nivel 1 con las manos) | Igual o mejor |
| FPS del simulador | 42,9 | **pendiente** (panel D durante una partida; objetivo 60, baja a 30 solo si la detección < 20) | 60 |
| FPS de detección | 18 a 20,6 | **pendiente** (panel D) | 20 o más |
| % de aciertos de gestos (promedio) | 100 % | **pendiente** (20 intentos por gesto) | 90 % o más |
| Aciertos en la sonificación a ciegas (de 10) | — | **pendiente** | 8 o más |
| Tamaño de public/assets sin audio (MB) | 2,15 | 3,88 | Menos de 10 |
| Tamaño de public/assets/audio (MB) | — (sin audio) | 3,71 | Menos de 8 |

## Lista de verificación

| Criterio | Cumple (sí/no) | Commit |
|---|---|---|
| La prueba de regresión del modelo pasa, también con la CPU ralentizada, y niveles.json no cambió. | Sí | `55b1008` (pruebas) y el commit de este documento (CSV) |
| El equipo principal se reconoce a primera vista y se distingue de las perturbaciones. | Sí: alambique de cobre; las perturbaciones son una llave de bronce y una tubería con pulsos | `edd0c9e`, `18a806e` |
| Todas las animaciones se ven en la escena Galería sin saltos ni cambios de tamaño. | Sí: 18 animaciones; cada hoja del equipo tiene el mismo cuadro que el sprite del día 1 | `edd0c9e` |
| Los estados del equipo (funcionando, falla, alarma) cambian con el modelo y la alarma no parpadea. | Sí: máquina de estados con histéresis (entra en 2,8 m, sale en 2,7 m) | `edd0c9e` |
| Cada actuador muestra el mando de la mano y su posición real. | Sí: barra con ▲ del mando y relleno de la apertura real; volante girado con la salida del Actuador | `18a806e`, `edd0c9e` |
| Las piezas del modelo se deforman con el estado, sin retardo y de forma fiel a la física. | Sí: líquido, chorros y flujo se dibujan cada cuadro desde x(t), sin tweens | `edd0c9e` |
| Cada perturbación tiene un aviso de al menos 400 ms y no menor al doble del retardo medido. | Sí: 2000 ms (mínimo: máx(400 ms; 2 × (161 + 111) ms) ≈ 544 ms) | `18a806e` |
| La vibración de cámara y el oleaje se calculan con un sistema de segundo orden. | Sí: `resorteVisual.js` (ζ = 0,3, 12 Hz y ζ = 0,2, 2 Hz) | `18a806e` |
| El escenario tiene baldosas sin cortes y decoraciones animadas, y no compite con la HMI. | Sí: Tilemap de 32 × 32, vela, frasco y engranajes; capa de ambiente oscurece el fondo | `04272d9` |
| El evento principal del modelo tiene un efecto visual y sonoro propio. | Sí: desborde (h ≥ 3 m) con estado "falla", efecto de desborde, vibración y `sfx_modelo_desborde` | `18a806e`, `edd0c9e` |
| La sonificación sigue a la variable del modelo sin chasquidos. | Sí: setTargetAtTime con τ = 0,03 s (filtro) y 0,05 s (burbujeo) | `18a806e` |
| La música se repite sin cortes y las alarmas se oyen sobre ella. | Sí: bucles con fundido cruzado y ducking del 40 % | `18a806e` |
| El sonido se activa tras la primera interacción y hay volumen por canal y silencio. | Sí | `18a806e` |
| El simulador mantiene 60 FPS y la detección 20 FPS o más. | **Pendiente** de medir con la cámara (panel D) | `55b1008` |
| La carpeta public/assets pesa menos de 10 MB y el ZIP menos de 25 MB. | Sí: 7,59 MB en total (3,88 sin audio); el ZIP se mide en la 5.8 | `55b1008` |
