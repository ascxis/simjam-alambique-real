# Recursos gráficos — Alambique Real: El Arte de la Alquimia

Recursos creados con Gemini (skill `director-arte-videojuegos`), sección 5.4.
Las imágenes originales se guardan en `arte_fuente/originales/` y se procesan con `npm run assets` (sección 5.8). Los originales están fuera de public/ para que no se copien a dist/ ni al ZIP; los nuevos recursos del día 2 se guardan también en arte_fuente/originales/.

## Guía de estilo visual

### Estilo artístico
- **Estilo:** 2D *stylized painterly* digital art, con estética de laboratorio de alquimia medieval/gótico, combinada con la claridad funcional del estándar ISA-101 en los elementos de monitoreo y control (HMI).
- **Trazos y contornos:** líneas de contorno finas pero definidas (1 px a 2 px), en tono marrón oscuro/carbón `#1A1B1D`, para buena legibilidad sin restar calidez.
- **Iluminación:** luz ambiental cálida y direccional de candelabros de piedra, con luminiscencia verde esmeralda brillante que desprende la poción dentro de los visores de vidrio y los tanques.

### Paleta de colores

| Elemento / función | Código hex | Uso |
|---|---|---|
| Cobre / alambiques (A, h₁, h₂) | `#B85A24` | Cuerpo metálico de los tanques de destilación |
| Poción / reactivo líquido | `#2ECC71` | Verde esmeralda brillante, con alto contraste frente a las alarmas (antes ámbar `#FFB300`; se cambió para no confundirlo con la alarma H) |
| Fondo HMI (ISA-101, neutro) | `#3A3D40` | Gris neutro desaturado para los paneles de la interfaz |
| Alarma H (nivel alto ≥ 2,4 m) | `#FFD700` | Amarillo brillante de advertencia |
| Alarma HH / crítica (≥ 2,8 m) | `#FF1744` | Rojo intenso de desborde inminente |
| Muros / escenario subterráneo | `#1C2026` | Piedra gótica oscura y fría, para alto contraste |
| Estructuras de hierro / válvulas (v₁, v₂) | `#4A5056` | Acero forjado y manivelas de control |
| Luminiscencia mágica / puntos activos | `#00E676` | Verde esmeralda para señales activas e indicadores |
| Contornos | `#1A1B1D` | Línea de contorno de todos los elementos |

### Reglas para Phaser (de la skill)
- Personajes y objetos centrados, sobre fondo magenta sólido `#FF00FF`, sin sombra en el piso, sin texto y sin marcos.
- Hojas de sprites en una sola fila, con cuadros del mismo tamaño y el objeto en la misma escala y posición.
- Escenarios en 16:9, con capas separadas (lejana, media y cercana; la cercana sobre magenta).
- Baldosas cuadradas que se repitan sin cortes.
- Paneles de la HMI en tonos neutros; color intenso solo para alarmas.

### Imagen de prueba
Aprobada por la pareja (versión regenerada con la poción verde): dos alambiques de cobre en cascada con visores graduados, válvulas v₁ y v₂, tubería hacia el caldero y laboratorio gótico de fondo, junto a una maqueta de la HMI.
La HMI de la imagen es solo una maqueta: en el juego, las tendencias y los valores se dibujan con Graphics de Phaser (`src/hmi/`).

## Lista de recursos

Lista final entregada por Gemini (paso 6), limitada a los 11 archivos aceptados y ajustada por la pareja. En la sección 5.8 se agregaron mesa_laboratorio.png y caldero_real.png (13 archivos en total).
El **tamaño en el juego** es al que el script de la sección 5.8 (`npm run assets`) reescala cada imagen, **conservando la proporción**. Pantalla de 1280 × 720 y escala 1 m = 100 px.

| Recurso | Archivo | Cuadro en el juego (px) | N.º de cuadros | Uso |
|---|---|---|---|---|
| Equipo principal | `alambique_cuerpo_vacio.png` | 215 × 300 (alto = 3 m) | 1 | Cuerpo del alambique; el visor viene recortado en magenta para ver el líquido detrás |
| Equipo principal (nivel 3) | `alambique_columna_liquido.jpg`, parte izquierda → `alambique_cascada.png` | 510 px de alto (sin deformar) | 1 | Dos alambiques apilados en cascada, cada uno con su visor, con la válvula de entrada v1 arriba a la derecha, la de salida v2 abajo a la derecha y el tubo de unión a la izquierda. El líquido de cada visor se dibuja con Graphics según h1 y h2 |
| Equipo principal | `alambique_columna_liquido.jpg`, parte derecha → `columna_liquido.png` | se ajusta al visor | 1 | Columna de líquido verde graduada. Opcional: el líquido se dibuja con Graphics |
| Actuadores | `valvula_cuerpo_estatico.jpg` | 80 × 80 | 1 | Cuerpo de la válvula y tramo de tubería, sin volante |
| Actuadores | `valvula_volante_aislado.png` | 50 × 50 | 1 | Volante de frente; el juego lo rota según la apertura v₁ o v₂ |
| Perturbaciones | `caldero_real.png` | 110 px de ancho | 1 | El Caldero Real recibe la salida del alambique; en el nivel 2 representa el consumo qd. Un chorro verde dibujado con Graphics muestra el caudal de salida |
| Mobiliario | `mesa_laboratorio.png` | 390 px de ancho | 1 | Mesa de trabajo sobre la que se apoya el alambique en los niveles 1 y 2. Vista un poco desde arriba: el tablero va del 17 % al 35 % de la altura de la imagen, y el alambique se apoya a la altura del 28 % |
| Indicadores y alarmas | `alarma_placa.png` | 64 × 64 | 1 | Placa de piedra con el hueco de la runa |
| Indicadores y alarmas | `alarma_runa.png` | 64 × 64 | 1 | Runa blanca; el juego la colorea: gris (apagada), `#FFD700` (alarma H) y `#FF1744` (alarma HH) |
| Escenario 1 | `fondo_laboratorio.png` | 1280 × 720 | 1 | Fondo único 16:9. El juego es de pantalla fija (sin desplazamiento de cámara), así que no se usan capas de parallax |
| Baldosas | `baldosas_laboratorio.png` | 64 × 64 por baldosa | 16 (4 × 4) | Piso de piedra (primera fila); las piezas vienen separadas por líneas magenta |
| Interfaz (HMI) | `interfaz_iconos.png` | 64 × 64 por ícono (hoja de 256 × 128) | 8 (4 × 2) | Nivel, válvula, alarma H, alarma HH, setpoint, mano, reloj y pausa. Los íconos de alarma traen la palabra "NO" y no se usan; las alarmas se muestran con la runa |
| Interfaz (HMI) | `logotipo_titulo.png` | 400 × 256 | 1 | Logotipo "Alambique Real: El Arte de la Alquimia" (menú) |
| Interfaz (HMI) | `pantalla_post_partida.png` | 588 × 680 | 1 | Panel de la pantalla "Lo que pasó en el modelo", con dos áreas para las gráficas h(t) y v(t) y espacio para el botón del CSV |

### Ajustes de la pareja sobre la lista de Gemini
- **Tamaños originales:** la columna "tamaño original" de Gemini no coincide con los archivos reales (por ejemplo, los tres recortes de la HMI miden 493 × 251, 416 × 266 y 483 × 559 px). No importa, porque el script reescala al tamaño en el juego.
- **Alambique:** se fijó en 300 px de alto para respetar la escala 1 m = 100 px (altura máxima de 3 m).
- **Formato JPG:** `alambique_columna_liquido.jpg` y `valvula_cuerpo_estatico.jpg` se descargaron de Gemini en JPG; el resto son PNG. Como el JPG comprime el color, el magenta del fondo queda con bordes irregulares, por eso el script debe quitarlo con tolerancia y guardar el resultado en PNG con transparencia.
- **Imagen de la cascada:** `alambique_columna_liquido.jpg` contiene dos piezas sobre magenta, y se recortan por separado. Medidas en fracciones del ancho y del alto de la imagen:
  - **Cascada:** x 0,063–0,433; y 0,115–0,972.
  - **Visor superior:** x 0,213–0,227; y 0,253–0,447.
  - **Visor inferior:** x 0,213–0,227; y 0,661–0,853.
  - **Columna de líquido:** x 0,693–0,773; y 0,087–0,913.
  - **Cuerpo de los alambiques:** x 0,139–0,308; base del alambique 2 en y 0,911.
  - **Extremo del tubo de salida:** x 0,413–0,433; y 0,972.
  - **Tubo de vidrio de la unión q12:** x 0,089–0,109; y 0,510–0,650.

  Todas las fracciones están medidas sobre la imagen original de 2576 × 1438 px.

  La pareja eligió los alambiques apilados para el nivel 3 porque muestran la cascada por gravedad: el alambique 1 descarga en el 2. El dibujo trae una llave manual en el tubo de unión; en el modelo, esa llave siempre está abierta (q12 = c1·√h1).
- **Baldosas:** no se usan en la simulación. Las pruebas mostraron que los bloques no combinan con el fondo, que ya trae piso; los alambiques se apoyan en ese piso con sombra y una base baja de hierro dibujada con Graphics.
- **Panel final:** Gemini proponía 1280 × 720, pero el panel es vertical (proporción ≈ 0,86); estirarlo a 16:9 lo deformaría. Se usa 588 × 680, centrado sobre el fondo.

## Día 2: especificación de los sprites (sección 5.2 a)

Todas las hojas de un mismo elemento usan el mismo tamaño de cuadro, una sola fila y fondo magenta #FF00FF. Los originales se guardan en `arte_fuente/originales/` y los procesados en `public/assets/sprites/`.

| Elemento | Tamaño del cuadro | Estados y número de cuadros | Velocidad sugerida |
|---|---|---|---|
| Equipo principal: alambique de cobre (simple y cascada) | Simple 256x640 px y cascada 256x768 px (verticales; la guía sugiere 128x128 o 192x192, pero el alambique es un tanque alto y un cuadro cuadrado lo haría muy pequeño) | Reposo 1, funcionando 4 (brillo del cobre y vapor en la boca), falla 4 (desborde: líquido que se derrama por la tapa), alarma 2 (runa y remaches en rojo) | Funcionando: timeScale proporcional a q_in (0,5 a 2) |
| Actuadores: válvula de entrada v₁ y válvula de salida v₂ (nivel 3) | 64x64 px | Cuerpo fijo + volante móvil; marca semitransparente del mando; variante de falla en rojo | Sin animación fija: el volante gira según la salida del Actuador |
| Piezas que se deforman | Según el elemento | Líquido del visor, chorro de entrada, flujo de la tubería de salida, superficie del líquido | Se dibujan desde x(t) en cada cuadro |
| Perturbación: consumo del caldero real (nivel 2, escalón de +0,08 m³/s) | 64x64 px | Aviso 3 (el cucharón se levanta y brilla), activa 4 (cucharón que extrae poción), fin 3 | 8 fps |
| Perturbación: consumo oscilante (nivel 3, ±0,04 m³/s, período 40 s) | 64x64 px | Aviso 3, activa 4 (sifón con onda), fin 3 | 8 fps |
| Indicadores y alarmas (runa) | 32x32 px | Normal, alarma alta (H), alarma muy alta (HH) | Parpadeo de 2 Hz solo en alarma |
| Baldosas | 32x32 px | Hoja de 8x4: piso de piedra, muros, tuberías de cobre, pasarelas y variaciones | No aplica |
| Fondos | 1280x720 px | Tres capas: lejana (muros y ventanales), media (estantes con frascos), primer plano (velas y mesa) | Fijos (cámara fija) |
| Efectos | 64x64 px | Salpicadura 5, vapor 6, chispa 4, polvo 4, aparición 5 y desborde 6 (efecto propio del concepto) | 15 a 20 fps, sin bucle |

## Día 2: mapa variable del modelo → representación (sección 5.2 b)

Rangos del modelo: h de 0 a 3 m (desborde a 3,0 m), v de 0 a 1, q_in = 0,4·v₁ de 0 a 0,4 m³/s, q₁₂ = c₁·√h₁, q_d de −0,04 a 0,08 m³/s. Alarmas: H = 2,4 m y HH = 2,8 m.

| Variable del modelo | Rango | Representación visual | Función | Sonificación |
|---|---|---|---|---|
| h₁, h₂ (nivel de cada alambique) | 0 a 3 m | Altura del líquido en el visor recortada con setCrop según h/3 | Lineal saturada | Tono del burbujeo de 200 a 800 Hz según h del alambique controlado (sube cuando el nivel sube); suavizado con setTargetAtTime, τ = 0,03 s |
| q_in = 0,4·v₁ (caudal de entrada) | 0 a 0,4 m³/s | Ancho del chorro de entrada (2 a 10 px), amplitud del oleaje de la superficie y timeScale de la animación "funcionando" (0,5 a 2) | Lineal saturada | Tasa del burbujeo de 2 a 12 burbujas por segundo |
| v₁, v₂ (salida del Actuador) | 0 a 1 | Ángulo del volante de cada válvula, de 0° a 270° | Lineal | Clic corto al abrir o cerrar más de 0,1 |
| Mando de la mano (u) | 0 a 1 | Marca semitransparente del volante en la posición ordenada | Lineal | — |
| q₁₂ = c₁·√h₁ (salida del alambique 1) | 0 a 0,35 m³/s | Ancho del flujo verde en la tubería de salida y en la cascada | Lineal saturada | — |
| q_d (consumo del caldero) | −0,04 a 0,08 m³/s | Tamaño del cucharón o de la onda de la perturbación; aviso antes de que actúe | Lineal en la magnitud | Sonido de aviso al empezar el aviso |
| h frente a H y HH | Umbrales | Runa normal, H (ámbar) o HH (roja, parpadeo de 2 Hz); franja de color en el visor | Umbral con histéresis: H entra en 2,4 m y sale en 2,3 m; HH entra en 2,8 m y sale en 2,7 m | Alarma H y alarma HH, distintas; la HH baja la música (ducking) |
| h ≥ 3,0 m | Evento | Estado "falla" del alambique y efecto de desborde | Umbral | Sonido propio de desborde |
| Error h − h_sp dentro de la banda (±tolerancia) | Evento | Brillo verde suave del nivel en la HMI | Umbral con histéresis | Sonido corto de confirmación al entrar en la banda |

## Día 2: retoques hechos a mano sobre los originales de Gemini

| Archivo | Retoque | Motivo |
|---|---|---|
| `perturbacion_cucharon_activa.png` | En el cuadro 2 se recortó el charco verde en forma de elipse con contorno oscuro y se limpiaron los restos de líneas | Gemini lo entregó como un rectángulo cortado contra el borde de la imagen, y al pedir otra versión cambió el diseño del cucharón |
| `perturbacion_cucharon_fin.png` | Se armó con el cuadro 1 de la hoja de fin de Gemini (cucharón vacío limpio): tres cuadros con escala 100 %, 85 % y 70 % que suben | Gemini hizo la transparencia mezclando el cucharón con el magenta, lo que dejaba un tinte morado al quitar el fondo. La desaparición se aplica en el juego con setAlpha |
| `perturbacion_sifon_activa.png` | Las partes vacías del vidrio se pasaron de rosado a gris neutro | Gemini dibujó el vidrio transparente dejando ver el magenta del fondo; al quitar el fondo, el sifón habría quedado rosado |
| `perturbacion_sifon_aviso.png` | Se armó con el sifón vacío de la hoja de fin y un halo ámbar opaco que crece en los 3 cuadros (10, 22 y 34 px) | El aviso de Gemini era otro sifón (con un bulbo y en otra orientación) y su halo semitransparente se mezclaba con el magenta |
| `perturbacion_sifon_fin.png` | Sin cambios: los 3 cuadros del sifón vacío; la desaparición se aplica en el juego con setAlpha | — |
| `deco_vela.png` | Se quitó el halo rosado alrededor de las llamas | El brillo semitransparente de Gemini se mezcló con el magenta |
| `fondo_cercano.png` | Se quitaron los halos rosados de las velas y las cadenas del fondo, que salieron moradas, se pasaron a marrón oscuro | Mismo motivo: transparencias mezcladas con el magenta |
| `laboratorio_tiles.png` | Se armó la hoja de 8x4 baldosas de 32x32 px con piezas de la hoja de Gemini: fila 1 pisos, fila 2 muros de ladrillo (recorte central para que encajen), fila 3 tuberías de cobre (rectas, codos, T, cruz y manómetro) y fila 4 pasarelas | Gemini entregó piezas de tamaños distintos (no una cuadrícula 8x4) y los muros con bordes irregulares. Su estilo es pixel art, pero a 32 px no se distingue del resto |
| `fondo_lejano.png`, `fondo_medio.png` | Sin cambios | — |
| `deco_engranaje.png` | Se tomó el cuadro 1 (limpio), se borraron las líneas de cuadrícula y los números que Gemini dibujó encima, y los 4 cuadros se generaron rotándolo 0°, 22,5°, 45° y 67,5° | La hoja traía una cuadrícula y números superpuestos, manchas entre cuadros y dos cuadros casi iguales |
| `deco_frasco.png` | Se quitaron las copias borrosas ("fantasmas") a la izquierda de los cuadros 2 y 4, y el cuadro 4 se reemplazó por el cuadro 2 reflejado | El cuadro 4 traía burbujas borrosas dentro del frasco |
| `efecto_vapor.png`, `efecto_polvo.png` | Se quitaron las líneas negras que separaban los cuadros y el tinte rosado del polvo; cada cuadro se centró en una celda cuadrada | Gemini dibujó marcos alrededor de los cuadros |
| `efecto_aparicion.png` | Se quitaron las franjas moradas entre cuadros y se recortó cada cuadro por su celda real | Los cuadros eran de anchos distintos y el anillo grande invadía la celda vecina |
| `efecto_chispa.png` | Se quitaron los marcos y los números; el cuadro 4 (dos estrellas borrosas) se reemplazó por la estrella del cuadro 2 al 55 % | Copia fantasma en el cuadro 4 |
| `efecto_salpicadura.png` | Solo se centraron los cuadros | — |
| `efecto_desborde.png` | Se extrajo solo el líquido que rebosa (sin la olla de la imagen de Gemini) y se aclaró el verde para que coincida con el visor del alambique | La olla no es el alambique; así el efecto se dibuja sobre la cúpula del alambique en el juego |
