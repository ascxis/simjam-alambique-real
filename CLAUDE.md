# Alambique Real: El Arte de la Alquimia (SimJam, Grupo 1)

Simulador N.º 1 "Operador de tanques" del laboratorio SimJam de Modelado y Simulación de Sistemas Continuos (Universidad de Pamplona, docente Harvey Gamboa). Grupo 1: Juan David Bohórquez Prieto, Daniel Andrés Galvis Marín y Andrés Felipe Flórez Mora. Responder siempre en español.

## Reglas del proyecto
- No modificar `src/modelo/` ni `src/modelo/niveles.json`: el arte y el sonido solo leen el modelo.
- Mantener las posiciones de la planta y la HMI del día 1 (`src/hmi/layout.js`); solo cambia el arte.
- Phaser 3.87 y MediaPipe tasks-vision 0.10.14 se cargan por CDN; nada de `import` de Phaser; rutas relativas y `base: './'`.
- No abrir los CSV con Excel (la configuración regional los daña).
- Un commit por etapa; registrar los prompts en `PROMPTS.md` (la última entrada es la 94).
- Comprobar siempre con `npm test` (65 pruebas) y `npm run build`.

## Modelo
A·dh/dt = 0,4·v − 0,2·√h − q_d, A = 1, RK4 con h = 1/120 s y paso fijo; actuador con 0,25/s; alarmas H 2,4 (sale 2,3), HH 2,8 (sale 2,7), desborde 3,0. Nivel 3 en cascada con q_d = 0,04·sin(2πt/40) sobre h₂. Línea base: `docs/linea_base_escalon.csv` (final 1,5494 m, tr 27,256 s, Mp 0 %).

## Estado (día 2)
Hecho (main en GitHub, commits 5063076 a fb115b0): etapas 1 a 8 de la guía 2 (estados del equipo y Galería con G, representacion.js, perturbaciones, escenario, efectos, audio, rendimiento), `analisis/regresion.py`, `docs/dia2_escalon.csv` y `_lento.csv` (pasan), `docs/pruebas_dia2.md`, capturas en `docs/capturas/despues/`. Fondo en tres capas fijas (`npm run fondos`; la capa cercana va por trozos en huecos de la planta, `CERCANA_NIVEL` en `src/juego/niveles/escenario.js`). Pantalla final con Repetir nivel / Siguiente nivel / Volver al menú (R / N / Esc; gamepad A / Start / B), que arrancan la partida por el mismo camino que el menú (`src/juego/arranqueNivel.js`). Desplegado en Netlify: https://alambique-real-grupo1.netlify.app (sitio `alambique-real-grupo1`, carpeta enlazada en `.netlify/`, que no se sube a git). Mediciones con las manos hechas (5.7 b de `docs/pruebas_dia2.md`): nivel 1 superado, juego entre 50 y 60 FPS (el panel D marcaba ≈ 180 = frecuencia de la pantalla; corregido), detección ≈ 30 FPS, gestos 100 %, sonificación 9/10, Galería, audífonos y otra pareja.

Pendiente:
1. 5.8: por indicación del docente la entrega es el enlace de Netlify (ya no el aula virtual). Para actualizarlo: `npm run build` y `npx netlify-cli deploy --prod --dir=dist --no-build`. Entregables en `entregables/` (fuera de git): `Grupo1_SimJam_Modelado.zip` (juego del día 1, commit c168db4), `Grupo1_SimJam_Modelado_Dia2.zip` (juego actual), `Grupo1_SimJam_Entregables_Dia1.zip` y `_Dia2.zip` (documentos de la 5.13 de la guía 1 y la 5.9 de la guía 2, con `ENLACES.txt`), e `informe_dia1/`. Faltan los videos (día 1: máximo 3 min; día 2: máximo 1 min, guion en `docs/guion_video_dia2.md`): poner sus enlaces en los `ENLACES.txt`.

## Antigravity como ayudante
Si el servidor MCP `antigravity-intern` está conectado, Claude Code es quien decide y revisa; a Antigravity se le delegan tareas acotadas (investigar, generar imágenes, revisar un archivo) y su resultado se verifica antes de usarlo. No se le pide modificar `src/modelo/`.
