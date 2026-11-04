# Diseño de Audio: Alambique Real: El Arte de la Alquimia

Este documento define la música, los efectos sonoros, los sonidos de los eventos del modelo, la sonificación en tiempo real y la mezcla del simulador (sección 5.4 de la guía del día 2). El diseño base lo propuso Gemini con la skill `disenador-juegos-simulacion`; la pareja lo ajustó a los eventos que existen en el modelo y a los valores de la guía (ver "Ajustes de la pareja" al final).

Los archivos originales se guardan en `arte_fuente/audio_originales/` y `npm run audio` los convierte a OGG y MP3 en `public/assets/audio/`. La guía indica `public/assets/audio/originales/`, pero Vite copia todo `public/` a `dist/`: los originales irían al ZIP y la carpeta de audio pasaría de 8 MB (el mismo motivo por el que los originales de arte están en `arte_fuente/originales/`).

---

## 1. Música

Todas las pistas son instrumentales, discretas (sin picos de volumen ni frecuencias que tapen las alarmas) y se repiten en bucle sin un final marcado.

| Situación | Archivo | Estilo | Tempo (BPM) | Instrumentos | Emoción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Menú | `musica_menu` | Ambiente místico renacentista, folk alquímico | 72 | Laúd suave, arpa, flauta dulce grave y colchón sutil de cuerdas | Contemplativa, misteriosa |
| Operación normal | `musica_operacion` | Ambient steampunk, minimalismo armónico | 88 | Clavecín punteado, violonchelo en pizzicato y pads cálidos | Concentración, equilibrio |
| Perturbación o tensión | `musica_perturbacion` | Tensión industrial moderada, dark ambient | 104 | Cuerdas en staccato, percusión metálica leve y zumbido grave | Alerta contenida, presión |
| Nivel superado | `musica_superado` | Fanfarria corta, clásica ligera | 110 | Flautas traversas, arpa ascendente y campanas tubulares | Triunfo, alivio |
| Nivel fallido | `musica_fallido` | Réquiem breve | 60 | Acordes graves de órgano y eco metálico descendente | Decepción momentánea |

La música cambia con un fundido de 1 s al cambiar de escena y al empezar la perturbación del nivel 2 (consumo de +0,08 m³/s a los 40 s) o la del nivel 3.

---

## 2. Efectos sonoros (actuadores, perturbaciones, interfaz y resultado)

Duración máxima de 1 s.

| Evento | Archivo | Sonido | Duración (s) | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| Clic de interfaz (botones, menú) | `sfx_interfaz_clic` | Clic mecánico corto y seco, de madera o metal | 0,15 | Baja |
| Aceptar en la interfaz | `sfx_interfaz_aceptar` | Blip ascendente corto | 0,20 | Baja |
| Cancelar o volver en la interfaz | `sfx_interfaz_cancelar` | Blip descendente corto | 0,20 | Baja |
| Válvula v₁ o v₂ cambia más de 0,1 | `sfx_actuador_mover` | Giro suave de volante y fricción metálica | 0,40 | Media |
| Válvula llega a su tope (0 % o 100 %) | `sfx_actuador_tope` | Golpe sordo de tope de recorrido | 0,20 | Media |
| Aviso de perturbación (antes de que actúe) | `sfx_perturbacion_aviso` | Campanilla grave de aviso | 0,50 | Alta |
| La perturbación empieza a actuar | `sfx_perturbacion_inicio` | Succión de líquido: el cucharón o el sifón extraen poción | 0,60 | Media |
| La perturbación termina | `sfx_perturbacion_fin` | Gota y burbuja que se calman | 0,40 | Baja |
| Nivel superado | `sfx_resultado_superado` | Melodía corta de éxito con campanas | 0,90 | Alta |
| Nivel fallido | `sfx_resultado_fallido` | Escape de vapor grave y jarra que se quiebra | 0,80 | Alta |

---

## 3. Sonidos de los eventos del modelo

Cada evento del sistema físico tiene un sonido propio, distinguible con los ojos cerrados.

| Evento del modelo | Condición | Archivo | Sonido | Duración (s) | Prioridad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Entrada en la banda | El nivel controlado entra en ±tolerancia de la referencia | `sfx_modelo_en_banda` | Acorde cristalino breve | 0,30 | Media |
| Salida de la banda | El nivel controlado sale de la banda | `sfx_modelo_fuera_banda` | Nota grave corta, descendente | 0,30 | Media |
| Cambio de referencia (nivel 3) | La referencia de h₂ pasa de 1,2 a 0,8 m a los 75 s | `sfx_modelo_cambio_referencia` | Dos notas descendentes de campana | 0,50 | Media |
| Alarma alta H | h ≥ 2,4 m (sale en 2,3 m) | `sfx_alarma_h` | Zumbido intermitente ámbar, un tono | 0,50 | Alta |
| Alarma muy alta HH | h ≥ 2,8 m (sale en 2,7 m) | `sfx_alarma_hh` | Alarma de dos tonos agudos con pulso rápido | 0,75 | Alta |
| Desborde (evento principal) | h ≥ 3,0 m, fin de la partida | `sfx_modelo_desborde` | Líquido que rebosa y cae sobre piedra | 1,00 | Alta |

---

## 4. Sonificación (sin archivo, Web Audio API)

El burbujeo continuo se sintetiza en el navegador con un generador de ruido, un filtro pasa banda (BiquadFilter) y una envolvente de burbujas. Cada parámetro sigue a la variable del modelo con `setTargetAtTime`, que es un suavizado de primer orden τ·dy/dt + y = u.

| Variable del modelo | Rango | Parámetro del sonido | Rango del sonido | Función | τ de suavizado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Nivel h del alambique controlado (h₁ en los niveles 1 y 2, h₂ en el nivel 3) | 0 a 3 m | Frecuencia central del filtro (tono del burbujeo) | 200 a 800 Hz | Lineal saturada | 0,03 s |
| q_in = 0,4·v₁ | 0 a 0,4 m³/s | Tasa de burbujas | 2 a 12 por segundo | Lineal saturada | 0,03 s |
| q_in = 0,4·v₁ | 0 a 0,4 m³/s | Volumen del burbujeo | 0,2 a 1 (relativo al canal) | Lineal saturada | 0,05 s |

Así, al subir el nivel el tono sube, y al abrir la válvula el burbujeo se vuelve más rápido y fuerte. Un sistema de primer orden se oye como un tono que sube rápido y se va frenando; como el alambique no tiene sobreimpulso, el tono nunca pasa del valor final y vuelve. Con τ = 0,03 s el sonido sigue a la variable sin chasquidos y sin un retardo perceptible frente a τ ≈ 10–12 s del alambique.

---

## 5. Mezcla

Cuatro canales con volumen independiente (guardado en localStorage) y silencio general con la tecla M o el botón Select.

| Canal | Volumen relativo | Contenido |
| :--- | :--- | :--- |
| Música | 0,25 (−12 dB) | Pistas en bucle |
| Efectos | 0,70 (−3 dB) | Actuadores, perturbaciones, eventos del modelo y alarmas |
| Interfaz | 0,60 (−4,4 dB) | Clics, aceptar y cancelar |
| Sonificación | 0,50 (−6 dB) | Burbujeo continuo |

- **Ducking:** las alarmas H y HH y el desborde (prioridad alta) bajan la música un 40 % con `gain.setTargetAtTime` (τ = 0,05 s) y la recuperan a los 300 ms.
- **Variación:** cada efecto se reproduce con un detune aleatorio de ±100 cents y como máximo 3 instancias simultáneas del mismo efecto.
- **Accesibilidad:** la opción "Indicadores visuales de sonido" muestra un ícono para los sonidos importantes (alarmas, desborde, aviso de perturbación, nivel superado y fallido).

---

## 6. Archivos, origen y licencia (sección 5.4 c)

| Evento del juego | Archivo | Fuente y licencia | Duración (s) |
| :--- | :--- | :--- | :--- |
| Música del menú | `musica_menu` | Gemini, herramienta Música (Lyria 3), instrumental; marca SynthID; uso académico | 60 (bucle) |
| Música de operación normal | `musica_operacion` | Gemini, herramienta Música (Lyria 3), instrumental; marca SynthID; uso académico | 60 (bucle) |
| Música de perturbación | `musica_perturbacion` | Gemini, herramienta Música (Lyria 3), instrumental; marca SynthID; uso académico | 60 (bucle) |
| Música de nivel superado | `musica_superado` | Gemini, herramienta Música (Lyria 3), instrumental; marca SynthID; uso académico | 36 (bucle) |
| Música de nivel fallido | `musica_fallido` | Gemini, herramienta Música (Lyria 3), instrumental; marca SynthID; uso académico | 42 (bucle) |
| Clic de interfaz | `sfx_interfaz_clic` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,12 |
| Aceptar | `sfx_interfaz_aceptar` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,2 |
| Cancelar | `sfx_interfaz_cancelar` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,2 |
| Mover válvula | `sfx_actuador_mover` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,4 |
| Tope de válvula | `sfx_actuador_tope` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,2 |
| Aviso de perturbación | `sfx_perturbacion_aviso` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,5 |
| Inicio de perturbación | `sfx_perturbacion_inicio` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,6 |
| Fin de perturbación | `sfx_perturbacion_fin` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,4 |
| Nivel superado | `sfx_resultado_superado` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,9 |
| Nivel fallido | `sfx_resultado_fallido` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,8 |
| Entrada en la banda | `sfx_modelo_en_banda` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,3 |
| Salida de la banda | `sfx_modelo_fuera_banda` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,3 |
| Cambio de referencia (nivel 3) | `sfx_modelo_cambio_referencia` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,5 |
| Alarma H | `sfx_alarma_h` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,5 |
| Alarma HH | `sfx_alarma_hh` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 0,75 |
| Desborde | `sfx_modelo_desborde` | Sintetizado por la pareja con `scripts/sintetizar_sfx.py` (síntesis estilo sfxr: onda cuadrada, sierra, seno y ruido); uso libre, sin atribución | 1,0 |

---

**Efectos sonoros:** la guía propone jsfxr (sfxr.me). Los 16 efectos se generaron con un script propio que usa los mismos bloques de jsfxr (ondas cuadrada, sierra, seno y ruido, envolvente, deslizamiento de tono, cambio de nota, repetición y filtro pasa bajos), para que se puedan regenerar y ajustar desde el repositorio. Cada evento del modelo usa un patrón distinto: H un tono medio con dos pulsos, HH dos tonos agudos alternados con pulso rápido, el desborde un rumor de líquido con burbujas, la entrada en banda dos notas que suben y la salida un tono que baja. Ninguno supera 1 s.

**Edición de la música:** Gemini entregó pistas de 46 s a 3 min con un final marcado y unos 2 s de silencio al final. De cada pista se tomó un tramo estable (menú y operación desde los 30 s, perturbación desde los 17 s, superado desde los 2 s y fallido desde los 20 s) y se unió el final con el inicio mediante un fundido cruzado de 2 s (ganancia de igual potencia), para que el bucle no tenga cortes. Se normalizó el pico a −1 dBFS. Duración total: 258 s, unos 3,1 MB por formato a 96 kbps.

## Ajustes de la pareja sobre la propuesta de Gemini

- Se quitaron "choque o anomalía de cascada" y "piezas dañadas": el modelo de tanques no tiene choques ni desgaste, y la guía pide sonidos de los eventos que existen en el sistema. En su lugar se agregaron la salida de la banda, el cambio de referencia del nivel 3 y el fin de la perturbación.
- "Entrada en banda" aparecía dos veces (`sfx_banda_ok` y `sfx_modelo_en_banda`); se dejó solo `sfx_modelo_en_banda`.
- El ducking pasó de −12 dB en 0,1 s a los valores de la guía (−40 % con τ = 0,05 s y recuperación a los 300 ms) y se aplica a todas las alarmas de prioridad alta, no solo a HH.
- Las alarmas pasaron de un quinto canal propio al canal de efectos, porque la guía pide cuatro canales (música, efectos, interfaz y sonificación); su prioridad alta las mantiene sobre la música.
- Se agregaron los efectos de interfaz aceptar y cancelar, y el volumen del burbujeo según q_in.
- Los nombres de archivo van sin extensión porque `npm run audio` genera cada sonido en OGG y MP3.
