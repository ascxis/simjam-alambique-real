# Documento de Diseño: Alambique Real: El Arte de la Alquimia

## 1. Ficha Técnica

* **Nombre del juego:** Alambique Real: El Arte de la Alquimia
* **Sistema simulado:** Sistema hidráulico no lineal de dos tanques (alambiques de cobre) en cascada.
* **Jugadores:** 1 jugador (Aprendiz de Alquimista).
* **Duración de una partida:** Entre 2 y 2.5 minutos por nivel (tiempo real de simulación: 120 s a 150 s).

---

## 2. Concepto y Justificación Educativa

* **Explicación técnica:** La dinámica de llenado y vaciado de fluidos a través de orificios de descarga presenta una no linealidad debida a la raíz cuadrada de la altura del fluido ($\sqrt{h}$), según el principio de Torricelli. Linealizar el sistema alrededor de un punto de operación ($h_0$) permite calcular la constante de tiempo ($\tau = \frac{2A\sqrt{h_0}}{c}$) y la ganancia ($K = \frac{2\sqrt{h_0}}{c}$), demostrando cómo la respuesta del sistema varía dinámicamente según la altura del líquido.
* **Regla del juego:** El jugador no fija directamente el nivel de esencia en los alambiques, sino el flujo de entrada $v_1$ mediante una válvula de alimentación y la apertura de salida final $v_2$. Como la velocidad de vaciado no lineal aumenta con la altura de la columna de líquido, el jugador debe anticipar la constante de tiempo del sistema para evitar fluctuaciones drásticas, prevenir desbordamientos ($h \ge 3.0\text{ m}$) y mantener el nivel dentro de los rangos de tolerancia exigidos para preparar la poción.

---

## 3. Modelo Matemático

```
                    [Válvula Entrada v₁]
                            │
                            ▼
                        q_in (m³/s)
                            │
                     ┌──────┴──────┐
                     │ Alambique 1 │  ◄──  A = 1 m², h₁ (m)
                     │   (Tanque)  │  ◄──  q_d (Restado en Nivel 1 y 2)
                     └──────┬──────┘
                            │
                       c₁·√h₁ (m³/s) (Salida libre por gravedad)
                            │
                            ▼
                     ┌─────────────┐
                     │ Alambique 2 │  ◄──  A = 1 m², h₂ (m)
                     │   (Tanque)  │  ◄──  q_d (Restado en Nivel 3)
                     └──────┬──────┘
                            │
                     c₂·v₂·√h₂ (m³/s) [Válvula Salida v₂]
                            │
                            ▼

```

### Variables y Unidades

* **Variables de entrada:**
* $v_1$: Apertura de válvula de entrada de reactivo $[0, 1]$ (señal continua).
* $v_2$: Apertura de válvula de salida del Alambique 2 $[0, 1]$ (señal continua).


* **Variables de estado:**
* $h_1$: Nivel de líquido en el Alambique 1 $[m]$ (Rango: $0 \text{ a } 3.0\text{ m}$).
* $h_2$: Nivel de líquido en el Alambique 2 $[m]$ (Rango: $0 \text{ a } 3.0\text{ m}$).


* **Variables de salida:**
* $h_1, h_2$: Lecturas de los visores de nivel $[m]$.


* **Perturbaciones:**
* $q_d$: Consumo externo o fuga de poción $[m^3/s]$. Se resta siempre del último alambique en uso.



### Ecuaciones Diferenciales Ordinarias (EDO)

1. **Niveles 1 y 2 (1 Alambique activo):**

$$\frac{dh_1}{dt} = \frac{0.4 \, v_1 - c_1 \sqrt{h_1} - q_d}{A}$$


2. **Nivel 3 (2 Alambiques en cascada):**

$$\frac{dh_1}{dt} = \frac{0.4 \, v_1 - c_1 \sqrt{h_1}}{A}$$


$$\frac{dh_2}{dt} = \frac{c_1 \sqrt{h_1} - c_2 \, v_2 \sqrt{h_2} - q_d}{A}$$



### Parámetros Fijos

* $A = 1.0 \text{ m}^2$ (Área transversal de los alambiques).
* $c_1 = 0.2 \text{ m}^{2.5}/\text{s}$ (Coeficiente de descarga de la boquilla 1).
* $c_2 = 0.2 \text{ m}^{2.5}/\text{s}$ (Coeficiente de descarga de la boquilla 2).
* $q_{in\_max} = 0.4 \text{ m}^3/\text{s}$ (Flujo máximo cuando $v_1 = 1$).

### Puntos de Operación y Linealización por Nivel

Los parámetros linealizados se evalúan en el setpoint ($h_0 = h_{sp}$) correspondiente a cada nivel:

| Nivel | Punto de Operación ($h_0$) | Flujo $q_{in0}$ ($v_{10}$) | Constante de Tiempo ($\tau$) | Ganancia $K = \frac{\Delta h}{\Delta q_{in}}$ | Ganancia $K_{v1} = 0.4 \cdot K$ |
| --- | --- | --- | --- | --- | --- |
| **Nivel 1** | $h_0 = 1.5 \text{ m}$ | $0.245\text{ m}^3/\text{s}$ ($v_{10} \approx 0.612$) | $\tau = \frac{2 A \sqrt{1.5}}{c_1} \approx 12.25 \text{ s}$ | $K = \frac{2\sqrt{1.5}}{c_1} \approx 12.25 \frac{\text{s}}{\text{m}^2}$ | $K_{v1} \approx 4.90 \text{ m}$ |
| **Nivel 2** | $h_0 = 1.0 \text{ m}$ | $0.200\text{ m}^3/\text{s}$ ($v_{10} = 0.500$) | $\tau = \frac{2 A \sqrt{1.0}}{c_1} = 10.00 \text{ s}$ | $K = \frac{2\sqrt{1.0}}{c_1} = 10.00 \frac{\text{s}}{\text{m}^2}$ | $K_{v1} = 4.00 \text{ m}$ |
| **Nivel 3 (Tramo A)** | $h_{20} = 1.2 \text{ m}$ ($h_{10} = 1.2 \text{ m}$) | $0.219\text{ m}^3/\text{s}$ ($v_{10} \approx 0.548, v_{20} = 1$) | $\tau_2 = \frac{2 A \sqrt{1.2}}{c_2} \approx 10.95 \text{ s}$ | $K_2 = \frac{2\sqrt{1.2}}{c_2} \approx 10.95 \frac{\text{s}}{\text{m}^2}$ | $K_{v1\_3A} \approx 4.38 \text{ m}$ |
| **Nivel 3 (Tramo B)** | $h_{20} = 0.8 \text{ m}$ ($h_{10} = 0.8 \text{ m}$) | $0.179\text{ m}^3/\text{s}$ ($v_{10} \approx 0.447, v_{20} = 1$) | $\tau_2 = \frac{2 A \sqrt{0.8}}{c_2} \approx 8.94 \text{ s}$ | $K_2 = \frac{2\sqrt{0.8}}{c_2} \approx 8.94 \frac{\text{s}}{\text{m}^2}$ | $K_{v1\_3B} \approx 3.58 \text{ m}$ |

* **Función de Transferencia $G(s)$ del Alambique 1 en Nivel 2 ($\Delta H_1(s) / \Delta V_1(s)$):**

$$G(s) = \frac{\Delta H_1(s)}{\Delta V_1(s)} = \frac{K_{v1}}{\tau s + 1} = \frac{4}{10s + 1}$$


* **Espacio de Estados (Alambique 1 en $h_0 = 1.0\text{ m}$):**
Definiendo el estado $x(t) = \Delta h_1(t) = h_1(t) - h_0$, la entrada $u(t) = \Delta v_1(t) = v_1(t) - v_{10}$ y la salida $y(t) = \Delta h_1(t)$:

$$\dot{x}(t) = A_{sys} \, x(t) + B_{sys} \, u(t)$$


$$y(t) = C_{sys} \, x(t) + D_{sys} \, u(t)$$


Donde:

$$A_{sys} = -\frac{c_1}{2 A \sqrt{h_0}} = -0.1 \text{ s}^{-1}, \quad B_{sys} = \frac{0.4}{A} = 0.4 \text{ m/s}, \quad C_{sys} = 1, \quad D_{sys} = 0$$



---

## 4. Bucle Principal de Juego (Game Loop)

Cada 10 segundos, el jugador experimenta la siguiente dinámica de control:

1. **Monitorear el Visor y Tendencia:** Observa la posición actual del nivel controlado en la pantalla HMI y revisa si la línea de tendencia se aproxima a la banda de tolerancia o a las alarmas.
2. **Evaluar la Inercia del Sistema:** Reconoce la constante de tiempo del nivel actual ($\tau \approx 12.25\text{ s}$ en Nivel 1, $\tau = 10\text{ s}$ en Nivel 2, $\tau \approx 10.95\text{ s}$ en Nivel 3) para determinar la velocidad con la que reaccionará el fluido ante ajustes en las válvulas.
3. **Ajustar Actuadores de Forma Continua:** Modifica suavemente la posición vertical de la mano derecha ($v_1$) o la apertura del pellizco izquierdo ($v_2$) para estabilizar la entrada y salida de flujo.
4. **Absorber Perturbaciones:** Al presentarse escalones o variaciones senoidales de consumo $q_d$, anticipa la caída o elevación del nivel ajustando $v_1$ antes de que el nivel sobrepase los límites operativos.

---

## 5. Actuadores

* **Válvula de Entrada 1 ($v_1$):**
* Rango: $[0, 1]$ (Señal continua).
* Velocidad máx. de cambio: $0.25 \text{ s}^{-1}$ (de $0\%$ a $100\%$ en $4\text{ segundos}$).


* **Válvula de Salida 2 ($v_2$):**
* Rango: $[0, 1]$ (Señal continua).
* Velocidad máx. de cambio: $0.25 \text{ s}^{-1}$ (de $0\%$ a $100\%$ en $4\text{ segundos}$).



---

## 6. Esquema de Controles

| Acción | Gesto de la Mano (MediaPipe) | Botón Gamepad | Tecla |
| --- | --- | --- | --- |
| **Control de Válvula 1 ($v_1$)** | Altura de la mano derecha (Señal continua $0 \text{ a } 1$) | Stick Derecho Vertical | Flechas Arriba / Abajo |
| **Control de Válvula 2 ($v_2$)** | Pellizco de la mano izquierda (Señal continua $0 \text{ a } 1$) | Gatillo Izquierdo (LT) | Teclas `Q` / `E` |
| **Pausa / Menú** | *Pausa automática si las manos salen de la zona > 3 s* | Botón `Start` | Tecla `Enter` |

---

## 7. Niveles de Juego

### Nivel 1: El Primer Destilado (Aprendizaje)

* **Objetivo:** Llevar $h_1$ desde $0.5\text{ m}$ hasta $1.5\text{ m}$ y mantenerlo estabilizado en el nuevo punto de operación.
* **Configuración del Modelo:** 1 Alambique ($h_1$), sin perturbaciones ($q_d = 0$). Válvula $v_2$ fuera de servicio.
* **Perturbaciones:** Ninguna.
* **Duración:** $120\text{ s}$.
* **Criterio de Victoria:** Mantener $h_1$ dentro del rango $1.5\text{ m} \pm 10\%$ ($[1.35\text{ m}, 1.65\text{ m}]$) durante $30\text{ segundos consecutivos}$.

### Nivel 2: La Demanda del Caldero Real (Perturbación Escalón)

* **Objetivo:** Mantener $h_1$ estable en $1.0\text{ m}$ frente a un consumo repentino de flujo.
* **Configuración del Modelo:** 1 Alambique ($h_1$).
* **Perturbaciones:** Consumo escalón $q_d = +0.08\text{ m}^3/\text{s}$ que se resta de $h_1$ entre $t = 40\text{ s}$ y $t = 80\text{ s}$.
* **Duración:** $120\text{ s}$.
* **Criterio de Victoria:** Mantener $h_1$ dentro de $1.0\text{ m} \pm 5\%$ ($[0.95\text{ m}, 1.05\text{ m}]$) durante al menos el $80\%$ del tiempo total y sin activar la alarma $HH \ge 2.8\text{ m}$.

### Nivel 3: El Elixir Doble en Cascada (Reto Multivariable)

* **Objetivo:** Regular la poción en el Alambique inferior ($h_2$), manteniéndola en $1.2\text{ m}$ y bajándola a $0.8\text{ m}$ a los $75\text{ s}$.
* **Configuración del Modelo:** 2 Alambiques en cascada ($h_1 \rightarrow h_2$).
* **Perturbaciones:** Consumo senoidal $q_d(t) = 0.04 \cdot \sin\left(\frac{2\pi}{40} t\right)\text{ m}^3/\text{s}$ (período de $40\text{ s}$) restado del Alambique 2.
* **Duración:** $150\text{ s}$.
* **Criterio de Victoria:** Mantener $h_2$ dentro de $target \pm 5\%$ durante el $70\%$ del tiempo de la partida sin desbordar ningún tanque ($h_1 < 3.0\text{ m}, h_2 < 3.0\text{ m}$).

---

## 8. Elementos Visuales y Alarmas

* **Alambiques de Cobre (Tanques):** Recipientes cilíndricos estilizados en 2D con visores de vidrio graduados.
* **Válvulas y Tuberías:** Representación visual de apertura mediante indicadores porcentuales y animación de flujo de reactivo.
* **Sistema de Alarmas Unificado (Límites Operativos):**
* **Alarma H ($h \ge 2.4\text{ m}$):** Indicador visual amarillo brillante / advertencia de alto nivel.
* **Alarma HH ($h \ge 2.8\text{ m}$):** Indicador visual rojo intenso parpadeante con sonido de alerta crítica.
* **Desborde ($h \ge 3.0\text{ m}$):** Derrame de líquido, fin de la partida por fallo operativo (Game Over).



---

## 9. Escenarios y Estética

* **Ambiente y Fondo Decorativo:** Laboratorio de alquimia subterráneo decorado con estantes llenos de frascos con elixires coloridos, pergaminos antiguos colgando con ecuaciones diferenciales anotadas a pluma, tubos de vidrio curvados con chispas mágicas circulando, vitrales góticos e iluminación tenue proveniente de candelabros de piedra.
* **Paleta de Colores HMI:** Los paneles de la HMI mantienen fondos grises y desaturados de tono neutro (`#3A3D40`) para garantizar la claridad de lectura según ISA-101. Los colores de alta intensidad están reservados exclusivamente para las alarmas: Amarillo encendido (`#FFD700` para Alarma H) y Rojo brillante (`#FF1744` para Alarma HH).

---

## 10. Interfaz de Usuario (HMI bajo Criterio ISA-101)

Siguiendo las directrices de la norma ISA-101 para interfaces de control industrial, la pantalla utiliza paneles grises y desaturados, aplicando colores llamativos únicamente para llamar la atención sobre desviaciones y alarmas.

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ALAMBIQUE REAL: SISTEMA DE CONTROL HMI                TIEMPO: 085s / 120s │
├───────────────────────────────────────────────────────────────────────────┤
│  PLANTAS Y NIVELES                  TENDENCIAS EN TIEMPO REAL             │
│  ┌───┐ 3.0m [DESBORDE]             3.0m┌──────────────────────────────┐ │
│  │   │                             2.8m│ - - - - ALARMA HH - - - - -  │ │
│  │   │ 2.4m [ALARMA H]             2.4m│ - - - - ALARMA H - - - - - - │ │
│  │▓▓▓│ 1.5m ── Target h₁               │════════ Banda ±5%/±10% ══════│ │
│  │▓▓▓│                                 │──────── h₁(t) / h₂(t) ───────│ │
│  └───┘ 0.0m                        0.0m└──────────────────────────────┘ │
│                                    100%┌──────────────────────────────┐ │
│  Apertura v₁: 50%                      │──────── v₁(t) / v₂(t) ───────│ │
│  Apertura v₂: 50%                   0%└──────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────## ┤
│  PARÁMETROS LINEALIZADOS EN EL NIVEL ACTUAL:                              │
│  Punto Op (h₀): [h_sp actual]  |  τ = 2A√h₀/c  |  K = 2√h₀/c  |  K_v1       │
└───────────────────────────────────────────────────────────────────────────┘

```

* **Paneles de Tendencia:** Visualización en tiempo real de los perfiles $h_1(t)$, $h_2(t)$, la banda de tolerancia ($target \pm 5\%$ o $\pm 10\%$) y la evolución continua de las aperturas $v_1(t)$ y $v_2(t)$.
* **Panel Informativo de Modelo:** Muestra dinámicamente en pantalla los parámetros linealizados calculados para el setpoint del nivel en curso ($h_0$, $\tau$, $K$ y $K_{v1}$).

---

## 11. Pantalla "Lo que pasó en el modelo" (Análisis Post-Partida)

Al finalizar cada nivel, el juego muestra la pantalla de evaluación técnica con el desempeño del operador:

1. **Estado de Resultado del Nivel:** Encabezado destacado indicando **¡Nivel Superado!** o **Nivel Fallido**, reportando el valor numérico exacto alcanzado según el criterio exigido (ej. *"Tiempo consecutivo en banda: 32.4 s / Req: 30.0 s"* o *"Tiempo total en banda: 84.5% / Req: 80.0%"*).
2. **Gráficas Integradas:** Curvas completas de $h(t)$ y $v(t)$ con la banda de tolerancia superpuesta.
3. **Métricas de Desempeño Evaluadas:**
* **Tiempo en banda:** Porcentaje o segundos en rango permitido.
* **IAE (Integral del Error Absoluto):** $\text{IAE} = \int_0^T \vert{}h(t) - h_{sp}(t)\vert{} \, dt$.
* **Nivel máximo alcanzado:** Valor pico de $h_1$ y $h_2$.
* **Alarmas activadas:** Registro de eventos de Alarma H y Alarma HH.
* **Comparativa de $\tau$:** Valor medido experimentalmente en el primer llenado frente al valor teórico del nivel actual (ej. $\tau_{medido}$ vs $\tau = 12.25\text{ s}$ en Nivel 1).


4. **Resumen Matemático del Sistema:** Muestra la EDO correspondiente y los parámetros fijos utilizados ($A, c_1, c_2$).
5. **Texto Educativo de Retroalimentación:**
> *"El alambique responde más lento cuanto más lleno está debido a que la constante de tiempo $\tau = \frac{2A\sqrt{h_0}}{c}$ crece con la raíz de la altura (por ejemplo, pasa de $10\text{ s}$ al estar en $1\text{ m}$ a aproximadamente $12.25\text{ s}$ cuando alcanza $1.5\text{ m}$). Al aumentar el nivel, la masa de fluido acumulada requiere mayores ajustes acumulados para cambiar su estado. Por esta razón, las correcciones en la válvula de entrada $v_1$ deben realizarse de forma anticipada para evitar sobrepasos."*


6. **Descarga de Datos (Registro CSV):** Botón **"Descargar CSV de la partida"** que exporta la partida con los siguientes encabezados y unidades:
* `t`, `u_crudo`, `u`, `x1`, `x2`, `y`, `v2`, `q_d`, `h_sp` (unidades: t en s; u_crudo, u y v2 normalizadas de 0 a 1; x1 = h1, x2 = h2 y y = nivel controlado en m; q_d en m³/s; h_sp en m)



---

## 12. Plan de Alcance (Scope)

### Alcance Mínimo Obligatorio (MVP)

* **Modelo en Capa Independiente:** Estructura de código en `src/modelo/` totalmente desacoplada de Phaser, integrada mediante el método Runge-Kutta de 4.º Orden (RK4) con paso fijo $h = 1/120\text{ s}$.
* **Nivel 1 Completo:** Implementación del Nivel 1 con su respectivo criterio de evaluación numérico ($30\text{ s}$ en $\pm 10\%$).
* **Sistema de Control Multimodal:** Lectura continua por manos (MediaPipe), Gamepad y teclado.
* **Interfaz HMI:** Gráficas de tendencias en tiempo real con alarmas H ($2.4\text{ m}$) y HH ($2.8\text{ m}$).
* **Registro de Datos y Exportación:** Generación de archivo CSV descargable con todas las columnas estipuladas.
* **Pantalla Post-Partida:** Pantalla "Lo que pasó en el modelo" con resultado explicito, gráficos, métricas (IAE, tiempo en banda) y texto conceptual.

### Extras e Incrementos (Si Sobra Tiempo)

* **Niveles 2 y 3:** Implementación de perturbaciones escalón, consumo senoidal y modelo en cascada.
* **Nivel Opcional "Piloto Automático":** Controlador proporcional $P$ donde $q_{in} = K_p \cdot (h_{sp} - h)$, permitiendo al jugador ajustar únicamente la ganancia $K_p$ con la mano para comparar directamente el IAE de la operación manual frente a la automática.