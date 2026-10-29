# Recursos gráficos — Alambique Real: El Arte de la Alquimia

Recursos creados con Gemini (skill `director-arte-videojuegos`), sección 5.4.
Las imágenes originales se guardan en `public/assets/originales/` y se procesan con `npm run assets` (sección 5.8).

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
