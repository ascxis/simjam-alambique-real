# Guion del video del día 2 (máximo 60 s)

Primer borrador generado por Antigravity a partir de `README.md`, `docs/pruebas_dia2.md` y `PROMPTS.md` y revisado contra el código. **Correcciones:** los estados de alarma y desborde se muestran con los deslizadores de la Galería, porque el nivel no sube de 2,8 a 3,0 m en pocos segundos; la perturbación del nivel 2 entra a los 40 s de juego, así que se graba aparte y se corta; se quitaron los BPM de la narración porque no están en el código.

El video se arma con **clips grabados por separado y editados**. La duración final cuenta los tramos ya cortados.

| Tiempo | Qué se ve en pantalla | Qué se hace | Texto en pantalla o narración |
|---|---|---|---|
| 0–6 s | Menú y comienzo del nivel 1: escenario con Tilemap (losas y zócalo de 32 × 32), vela, frasco y engranajes animados, polvo lento | En el menú se elige la fuente "Cámara" y se pulsa Jugar | *Alambique Real — día 2: escenario y decoraciones animadas* |
| 6–16 s | Recuadro de la cámara; la marca ▲ de v₁ sigue la mano y el relleno y el volante la alcanzan a 0,25/s; el líquido sube con oleaje; se oye el burbujeo y el tono sigue a h₁ | Subir la mano derecha para abrir v₁ | «La marca sigue la mano; la válvula real la alcanza con la dinámica del actuador. El sonido sigue al nivel.» |
| 16–28 s | Escena Galería: el alambique pasa por funcionando, alarma HH (entra en 2,8 m y sale en 2,7 m, sin parpadeo) y falla/desborde en 3,0 m | Tecla **G**; mover el deslizador de h₁ hasta 2,85, bajarlo a 2,75 (la alarma sigue), a 2,65 (se apaga) y después a 3,0 | *Galería (G): estados del equipo con histéresis* |
| 28–40 s | Nivel 2: halo ámbar de 2 s sobre la llave de consumo; luego la llave vierte (q_d = 0,08) y cambia la música; el jugador compensa | Corte al segundo 38 de la partida; al ver el aviso, subir la mano derecha | «Cada perturbación avisa 2 segundos antes para que el operador se anticipe.» |
| 40–52 s | Nivel 3: cascada de dos alambiques; aviso y pulsos en la tubería de intercambio (q_d = 0,04·sin(2πt/40)) | Mano derecha: altura → v₁; mano izquierda: pellizco → v₂ | *Nivel 3: cascada con las dos manos* |
| 52–60 s | Pantalla "Lo que pasó en el modelo" con las curvas y el botón del CSV; créditos del Grupo 1 | Tecla **F** para terminar | *Grupo 1 — Bohórquez, Galvis, Flórez* |

Sugerencia: grabar con el panel D visible en el clip del nivel 1 para que se vean los FPS medidos.
