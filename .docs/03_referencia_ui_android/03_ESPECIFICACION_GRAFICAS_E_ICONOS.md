# 📊 03. Especificación de Gráficas en Canvas y Catálogo Completo de Íconos SVG

Este documento preserva la lógica matemática y visual exacta de las 3 vistas personalizadas en Canvas (`BarChartView.kt`, `LineChartView.kt`, `ActivityCalendarView.kt`) y las rutas vectoriales (`pathData`) de los 21 íconos de `res/drawable/ic_*.xml`.

---

## 1. Especificación Matemática y Visual de las Gráficas (`Canvas 2D`)

> **Nota de implementación en JS:** Para que los gráficos se vean nítidos en pantallas móviles de alta densidad (Retina / FHD+ / QHD+), todo `<canvas>` debe escalar su buffer interno multiplicando `clientWidth` y `clientHeight` por `window.devicePixelRatio || 1` y aplicando `ctx.scale(dpr, dpr)`.

---

### 1.1 Gráfica de Barras (`BarChartView`)
* **Dimensiones del contenedor:** Ancho `100%`, alto fijo `180px`.
* **Márgenes internos:**
  * `topPad = 18px` (espacio superior para el número sobre la barra).
  * `labelH = 22px` (franja inferior reservada para las etiquetas del eje X).
  * `chartBottom = height - labelH`.
  * `chartH = chartBottom - topPad`.
* **Escala vertical:**
  * `maxValue = Math.max(minTop, ...bars.map(b => b.value))` donde `minTop = 4` (evita que una sola sesión ocupe el 100% del alto de la tarjeta).
* **Líneas guía horizontales (`3 líneas`):**
  * Para `i = 0, 1, 2`: `y = topPad + (chartH * i) / 2`.
  * Color: `#2A303C` (`chart_grid`), grosor `1px`, desde `x = 0` hasta `x = width`.
* **Geometría y Color de cada Barra:**
  * `slot = width / bars.length`.
  * `barW = Math.min(slot * 0.56, 34)` (ancho máximo `34px`).
  * `radius = 6px` (esquinas redondeadas).
  * Centro horizontal de la barra `index`: `cx = slot * index + slot / 2`.
  * Altura de la barra:
    * Si `bar.value <= 0`: `barH = 3px`, color `#2A303C` (`chart_grid`).
    * Si `bar.value > 0`: `barH = chartH * (bar.value / maxValue)`.
      * Si `bar.highlight === true` (día de hoy o semana actual): color `#FF9100` (`accent_orange`).
      * Si `bar.highlight === false`: color `rgba(255, 145, 0, 0.40)` (`accent_orange_dim`).
* **Etiquetas de Valor y Eje X:**
  * **Valor sobre la barra:** Se dibuja si `bar.value > 0` y `bars.length <= 14`. Fuente `11px` Bold `#F0F3F6`, centrado en `cx`, en `y = (chartBottom - barH) - 5px`.
  * **Etiqueta eje X:** Fuente `11px` Regular `#858F9C`, centrada en `cx`, en `y = height - 6px`.

---

### 1.2 Gráfica de Línea con Gradiente (`LineChartView`)
* **Dimensiones del contenedor:** Ancho `100%`, alto `140px` (en Medidas) o `150px` (en Progreso).
* **Estado Vacío (`points.length === 0`):**
  * Dibuja `emptyMessage` centrado en `(width / 2, height / 2)` con fuente `13px` `#858F9C`.
* **Márgenes internos:**
  * `leftPad = 40px` (espacio para los valores del eje Y).
  * `rightPad = 10px`, `topPad = 12px`, `bottomPad = 24px`.
  * `chartW = width - leftPad - rightPad`.
  * `chartH = height - topPad - bottomPad`.
* **Escala vertical con margen del 15%:**
  * `rawMin = Math.min(...points.map(p => p.value))`.
  * `rawMax = Math.max(...points.map(p => p.value))`.
  * `span = Math.max(1.0, rawMax - rawMin)`.
  * `minV = rawMin - span * 0.15`.
  * `maxV = rawMax + span * 0.15`.
* **Líneas guía y Eje Y (`3 niveles`):**
  * Para `i = 0, 1, 2`:
    * `y = topPad + (chartH * i) / 2`.
    * Línea horizontal de `x = leftPad` a `x = width - rightPad`, color `#2A303C`, grosor `1px`.
    * Valor del eje Y: `val = maxV - ((maxV - minV) * i) / 2`, formateado sin decimales (`Math.round(val)`), fuente `11px` `#858F9C`, alineado a la izquierda en `x = 0`, `y + 4px`.
* **Coordenadas `(x, y)` de cada punto:**
  * Si `points.length === 1`: `x = leftPad + chartW / 2`.
  * Si `points.length > 1`: `x = leftPad + (chartW * index) / (points.length - 1)`.
  * `y = topPad + chartH * ((maxV - point.value) / (maxV - minV))`.
* **Trazo, Relleno con Gradiente y Puntos:**
  * Si `points.length > 1`:
    * **Área bajo la curva (`fillPath`):** Polígono cerrado desde `(x0, topPad + chartH)` pasando por todos los puntos `(xi, yi)` hasta `(xLast, topPad + chartH)`. Relleno con gradiente lineal vertical desde `rgba(255, 145, 0, 0.33)` (`#55FF9100`) en `topPad` hasta `rgba(255, 145, 0, 0.0)` en `topPad + chartH`.
    * **Línea principal (`linePath`):** Color `#FF9100`, grosor `3px`, `lineCap = "round"`, `lineJoin = "round"`.
  * **Puntos (`dots`):** Si `points.length <= 12` se dibujan todos; si hay más de 12, solo se dibuja el último punto. Cada punto consta de un círculo exterior de radio `5px` en `#FF9100` y un círculo interior (núcleo) de radio `2.5px` en `#212631` (`surface_card`).
* **Etiquetas del Eje X:**
  * Primera fecha (`points[0].label`) alineada a la izquierda en `x = leftPad`, `y = height - 5px` (`11px` `#858F9C`).
  * Última fecha (`points[last].label`, si `points.length > 1`) alineada a la derecha en `x = width - rightPad`, `y = height - 5px`.

---

### 1.3 Calendario de Actividad de 5 Semanas (`ActivityCalendarView`)
* **Dimensiones:**
  * Columnas: `7` (`L`, `M`, `X`, `J`, `V`, `S`, `D`).
  * Filas: `weeks = 5` (las últimas 5 semanas, de lunes a domingo).
  * `cell = width / 7`.
  * `headerH = 22px`.
  * Altura total del canvas: `height = headerH + cell * 5`.
  * Radio de cada círculo: `radius = Math.min(cell * 0.36, 18)`.
* **Cabecera (`L M X J V S D`):**
  * Fuente `11px` `#858F9C`, centrada en `cx = cell * col + cell / 2`, `y = 12px`.
* **Cálculo de Celdas:**
  * `firstMonday` = lunes de la semana actual menos `28 días` (`7 * (5 - 1)`).
  * Para `row = 0..4` y `col = 0..6`:
    * Fecha de la celda = `firstMonday + (row * 7 + col) días`, convertida a clave `yyyy-MM-dd`.
    * Centro del círculo: `cx = cell * col + cell / 2`, `cy = headerH + cell * row + cell / 2`.
    * **Relleno del círculo:** `#FF9100` si `key` está en `trainedDays`; `#1A1F29` (`surface_input`) si no.
    * **Anillo de Hoy:** Si `key === todayKey`, dibuja un círculo adicional sin relleno con borde `2px solid #FF9100` del mismo `radius`.
    * **Número del día del mes (`1..31`):** Centrado en `(cx, cy + 4px)`, fuente `11px`:
      * Si entrenó (`done`): color `#0E1117` (`bg_dark`), Bold.
      * Si es día futuro (`key > todayKey`): color `#858F9C` (`text_muted`), Regular.
      * Si es día pasado/hoy no entrenado: color `#A3ACB8` (`text_secondary`), Regular.

---

## 2. Catálogo Completo de los 21 Íconos Vectoriales (`viewBox="0 0 24 24"`)

Todos los íconos originales de `app/src/main/res/drawable/ic_*.xml` usan un lienzo `24×24` (`viewBox="0 0 24 24"`). Aquí están sus rutas SVG exactas para construir el módulo `Icons.js` sin perder ningún vector:

| Nombre del Ícono | Tipo SVG | Atributos / `d` (`pathData` exacto) |
| :--- | :--- | :--- |
| **`ic_add`** | `fill` | `M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z` |
| **`ic_arrow_back`** | `fill` | `M20,11H7.83l5.59,-5.59L12,4l-8,8 8,8 1.41,-1.41L7.83,13H20v-2z` |
| **`ic_bar_chart`** | `fill` | `M5,9.2h3V19H5V9.2zM10.6,5h2.8v14h-2.8V5zM16.2,13H19v6h-2.8V13z` |
| **`ic_bolt`** | `fill` | `M13,2 L5,13 H11 L10,22 L19,10 H13 Z` |
| **`ic_calendar`** | `fill` (`evenOdd`) | `M5,4 H19 A2,2 0 0 1 21,6 V20 A2,2 0 0 1 19,22 H5 A2,2 0 0 1 3,20 V6 A2,2 0 0 1 5,4 Z M5,9 V20 H19 V9 Z` |
| **`ic_check`** | `fill` | `M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41,-1.41z` |
| **`ic_chevron_right`** | `stroke` (`2.5`, `round`) | `M9,5 L16,12 L9,19` (`fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`) |
| **`ic_close`** | `fill` | `M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z` |
| **`ic_delete`** | `fill` | `M6,19c0,1.1 0.9,2 2,2h8c1.1,0 2,-0.9 2,-2V7H6v12zM19,4h-3.5l-1,-1h-5l-1,1H5v2h14V4z` |
| **`ic_drop`** | `fill` | `M12,2 C12,2 5,10 5,14.5 A7,7 0 0 0 19,14.5 C19,10 12,2 12,2 Z` |
| **`ic_edit`** | `fill` | `M4,16 L4,20 L8,20 L19,9 L15,5 Z` |
| **`ic_fitness_center`**| `fill` | `M20.57,14.86L22,13.43 20.57,12 17,15.57 8.43,7 12,3.43 10.57,2 9.14,3.43 7.71,2 5.57,4.14 4.14,2.71 2.71,4.14l1.43,1.43L2,7.71l1.43,1.43L2,10.57 3.43,12 7,8.43 15.57,17 12,20.57 13.43,22l1.43,-1.43 1.43,1.43 2.14,-2.14 1.43,1.43 1.43,-1.43 -1.43,-1.43 1.43,-1.43 -1.43,-1.43 -1.43,-1.43 3.57,-3.57z` |
| **`ic_flame`** | `fill` | `M12,2 C12,2 6,8 6,14 A6,6 0 0 0 18,14 C18,11 16,9 15,8 C15,10 14,11 13,11 C13,8 12,2 12,2 Z` |
| **`ic_home`** | `fill` | `M10,20v-6h4v6h5v-8h3L12,3 2,12h3v8z` |
| **`ic_person`** | `fill` | `M12,12c2.21,0 4,-1.79 4,-4s-1.79,-4 -4,-4 -4,1.79 -4,4 1.79,4 4,4zM12,14c-2.67,0 -8,1.34 -8,4v2h16v-2c0,-2.66 -5.33,-4 -8,-4z` |
| **`ic_play`** | `fill` | `M8,5 V19 L19,12 Z` |
| **`ic_ruler`** | `fill` (`evenOdd`) | `M3,7 H21 V17 H3 Z M6,7 V12 H7.5 V7 Z M10,7 V13 H11.5 V7 Z M14,7 V12 H15.5 V7 Z M18,7 V13 H19.5 V7 Z` |
| **`ic_search`** | `fill` | `M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zm-6,0C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14z` |
| **`ic_timer`** | `fill` | `M15,1H9v2h6V1zm-4,13h2V8h-2v6zm8.03,-6.61l1.42,-1.42c-.43,-.51 -.9,-.99 -1.41,-1.41l-1.42,1.42C16.07,4.74 14.12,4 12,4c-4.97,0 -9,4.03 -9,9s4.02,9 9,9 9,-4.03 9,-9c0,-2.12 -.74,-4.07 -1.97,-5.61zM12,20c-3.87,0 -7,-3.13 -7,-7s3.13,-7 7,-7 7,3.13 7,7 -3.13,7 -7,7z` |
| **`ic_trend`** | `stroke` (`2.5`, `round`) | `M3,17 L9,11 L13,15 L21,7 M15,7 H21 V13` (`fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`) |
| **`ic_trophy`** | `fill` | `M7,4 H17 V10 A5,5 0 0 1 7,10 Z M10,16 H14 V19 H16 V21 H8 V19 H10 Z` |

---

## 3. Datos Semilla Oficiales (Catálogo de 29 Ejercicios y 4 Rutinas Base)

Para mantener la coherencia visual y funcional de las tarjetas de rutina y del selector de ejercicios:

### 3.1 Catálogo de 29 Ejercicios (`6 grupos musculares`)
* **Pecho (5):**
  1. `Press de Banca Plano` (Barra)
  2. `Press Inclinado con Mancuernas` (Mancuerna)
  3. `Aperturas en Polea (Cruces)` (Polea)
  4. `Fondos en Paralelas (Dips)` (Peso Corporal)
  5. `Press en Máquina Pecho` (Máquina)
* **Espalda (5):**
  6. `Peso Muerto Convencional` (Barra)
  7. `Jalón al Pecho (Lat Pulldown)` (Polea)
  8. `Remo con Barra` (Barra)
  9. `Remo Gironda (Polea Baja)` (Polea)
  10. `Dominadas (Pull-ups)` (Peso Corporal)
* **Pierna (6):**
  11. `Sentadilla Trasera` (Barra)
  12. `Prensa de Piernas 45°` (Máquina)
  13. `Extensiones de Cuádriceps` (Máquina)
  14. `Curl Femoral Tumbado` (Máquina)
  15. `Elevación de Talones (Gemelos)` (Máquina)
  16. `Hip Thrust con Barra` (Barra)
* **Hombro (5):**
  17. `Press Militar con Barra` (Barra)
  18. `Press Militar con Mancuernas` (Mancuerna)
  19. `Elevaciones Laterales` (Mancuerna)
  20. `Pájaros (Deltoides Posterior)` (Mancuerna)
  21. `Face Pulls` (Polea)
* **Brazos (5):**
  22. `Curl de Bíceps con Barra Z` (Barra)
  23. `Curl en Banco Scott (Predicador)` (Máquina)
  24. `Curl Martillo con Mancuernas` (Mancuerna)
  25. `Extensiones de Tríceps en Polea` (Polea)
  26. `Press Francés` (Barra)
* **Core (3):**
  27. `Plancha Abdominal` (Peso Corporal)
  28. `Elevaciones de Piernas Colgado` (Peso Corporal)
  29. `Crunch en Polea Alta` (Polea)

### 3.2 Las 4 Rutinas Base Sembradas
1. **`Día 1: Empuje (Push)`** — `"Pecho, Hombro y Tríceps"` (`5 ejercicios • 50 min`):
   * `Press de Banca Plano`, `Press Inclinado con Mancuernas`, `Press Militar con Barra`, `Elevaciones Laterales`, `Extensiones de Tríceps en Polea`.
2. **`Día 2: Tirón (Pull)`** — `"Espalda y Bíceps"` (`5 ejercicios • 45 min`):
   * `Dominadas (Pull-ups)`, `Remo con Barra`, `Jalón al Pecho (Lat Pulldown)`, `Curl de Bíceps con Barra Z`, `Curl Martillo con Mancuernas`.
3. **`Día 3: Pierna (Legs)`** — `"Cuádriceps, Femorales y Gemelos"` (`6 ejercicios • 60 min`):
   * `Sentadilla Trasera`, `Prensa de Piernas 45°`, `Extensiones de Cuádriceps`, `Curl Femoral Tumbado`, `Hip Thrust con Barra`, `Elevación de Talones (Gemelos)`.
4. **`Día 4: Torso Completo`** — `"Pectoral, Dorsales y Deltoides"` (`5 ejercicios • 55 min`):
   * `Press de Banca Plano`, `Remo Gironda (Polea Baja)`, `Press Militar con Mancuernas`, `Aperturas en Polea (Cruces)`, `Face Pulls`.
