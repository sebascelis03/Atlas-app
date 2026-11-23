# 🎨 01. Sistema de Diseño, Paleta de Colores y Tokens Visuales (ATLAS)

Este documento preserva de forma íntegra los códigos de color, la escala tipográfica, los selectores de estado y las formas geométricas extraídas de `colors.xml`, `themes.xml`, `res/color/*.xml` y `res/drawable/bg_*.xml` del proyecto Android original.

---

## 1. Paleta Oficial de Colores (`colors.xml`)

### 1.1 Fondos y Superficies
| Token Original | Código Hex | Equivalente CSS / RGBA | Uso Exacto en la Interfaz |
| :--- | :--- | :--- | :--- |
| `bg_dark` | `#0E1117` | `#0E1117` | Fondo general de todas las pantallas, barra de estado y texto sobre botones primarios naranjas/neón. |
| `surface_dark` | `#161B22` | `#161B22` | Barra de navegación inferior (`BottomNav`), barra superior/inferior de Entrenamiento en Vivo y fondo de todos los BottomSheets. |
| `surface_card` | `#212631` | `#212631` | Fondo de todas las tarjetas (`Atlas.Card`), modales de diálogo centrados y avatares circulares. |
| `surface_card_stroke` | `#30363D` | `#30363D` | Borde (`1px`) de tarjetas, divisores internos, bordes de botones `Outlined`, inputs no enfocados y asa (`drag handle`) de BottomSheets. |
| `surface_input` | `#1A1F29` | `#1A1F29` | Fondo de campos de texto (`TextInputLayout`), píldoras (`bg_pill`), barra de descanso, celdas inactivas de calendario y pistas (`tracks`) de barras de progreso. |
| `surface_pressed` | `#2A3040` | `#2A3040` | Estado presionado/hover en filas interactivas y tarjetas. |
| `surface_danger` | `#1C1517` | `#1C1517` | Fondo del botón "Cerrar sesión" en la pestaña Perfil. |
| `nav_divider` | `#262C38` | `#262C38` | Línea divisoria horizontal (`1px`) encima del `BottomNavigationView`. |
| `chart_grid` | `#2A303C` | `#2A303C` | Líneas guía horizontales de las gráficas (`BarChartView` y `LineChartView`) y barras con valor `0`. |

### 1.2 Colores de Acento y Estado
| Token Original | Código Hex | Equivalente CSS / RGBA | Uso Exacto en la Interfaz |
| :--- | :--- | :--- | :--- |
| `accent_orange` | `#FF9100` | `#FF9100` | Acento principal de las 5 pestañas: botones primarios (`Atlas.Button.Primary`), pestaña activa, anillo de meta semanal, días entrenados, trazos de gráficas, chip activo y botón de registro. |
| `accent_orange_glow` | `#33FF9100` | `rgba(255, 145, 0, 0.20)` | Píldora del indicador activo del `BottomNav`, fondo de chips seleccionados (`chip_goal_bg`), fondo del botón `+ Nueva Rutina` y badge `Hecho hoy`. |
| `accent_orange_dim` | `#66FF9100` | `rgba(255, 145, 0, 0.40)` | Color de las barras históricas (no destacadas) en `BarChartView`. |
| `primary_neon` | `#00E676` | `#00E676` | Acento de Login (logo, eslogan, botón `INICIAR SESIÓN`), borde de input enfocado, series completadas (`✓`), deltas positivos que acercan a la meta y botón `Finalizar` del entrenamiento en vivo. |
| `primary_neon_glow` | `#3300E676` | `rgba(0, 230, 118, 0.20)` | Resplandor/halo sutil para elementos en verde neón. |
| `accent_cyan` | `#00E5FF` | `#00E5FF` | Acento exclusivo de Hidratación (ícono de gota, botones `±` de agua, barra de progreso de agua), tile de Tiempo en Progreso y tile de Peso en Perfil. |
| `accent_red` | `#FF5252` | `#FF5252` | Mensajes e íconos de error en formularios, botón `Eliminar` rutina y botón/diálogo de `Cerrar sesión`. |
| `set_completed` | `#1B382B` | `#1B382B` | Fondo alternativo de estado para serie completada. |
| `set_completed_stroke`| `#00E676` | `#00E676` | Borde de estado para serie completada. |
| `black` / `white` | `#000000` / `#FFFFFF` | `#000000` / `#FFFFFF` | Texto blanco en confirmación de logout y negro base. |

### 1.3 Jerarquía de Texto (`Typography Colors`)
| Token Original | Código Hex | Contraste sobre `#212631` | Uso Exacto |
| :--- | :--- | :--- | :--- |
| `text_primary` | `#F0F3F6` | > 11:1 (AAA) | Títulos de pantalla, títulos de sección, nombres de ejercicios, valores numéricos y texto dentro de inputs. |
| `text_secondary` | `#A3ACB8` | > 5.8:1 (AA) | Subtítulos, descripciones de grupos musculares, etiquetas de configuración e ítems inactivos del `BottomNav`. |
| `text_muted` | `#858F9C` | ≥ 4.5:1 (AA) | Placeholders, subtítulos de gráficas, etiquetas de ejes/calendario, encabezados de tabla (`SERIE`, `ANTERIOR`, `KG`, `REPS`) y notas al pie. |

### 1.4 Colores por Grupo Muscular (`MuscleStyle`)
Usados en la barra lateral izquierda (`5px` de ancho) de cada tarjeta de rutina y en el tile de volumen (`group_core`):
| Grupo Muscular | Token | Código Hex |
| :--- | :--- | :--- |
| **Pecho** | `group_pecho` | `#FF9100` |
| **Espalda** | `group_espalda` | `#4FC3F7` |
| **Pierna** | `group_pierna` | `#B388FF` |
| **Hombro** | `group_hombro` | `#FF9100` |
| **Brazos** | `group_brazos` | `#FF5252` |
| **Core** | `group_core` | `#FFD740` |
| *Por defecto / Libre* | `accent_orange` | `#FF9100` |

---

## 2. Escala Tipográfica (`themes.xml`)

La fuente base es Sans-Serif del sistema (`Roboto`, `Inter` o `system-ui`). En móvil `1sp ≈ 1px` (`1dp ≈ 1px` en viewport lógico CSS):

| Estilo Original | Tamaño | Peso (`font-weight`) | Color | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Título Login (`tvAppTitle`)** | `38px` | `700` (Bold) | `#F0F3F6` | Texto `ATLAS` en Login con `letter-spacing: 0.25em`. |
| **Avatar Perfil (`tvProfileAvatar`)**| `38px` | `700` (Bold) | `#FF9100` | Inicial dentro del círculo de `92×92px` en Perfil. |
| **Peso Principal (`tvCurrentWeight`)**| `34px` | `700` (Bold) | `#F0F3F6` | Valor central editable de peso en la pestaña Medidas. |
| **Título Registro (`tvRegisterTitle`)**| `28px` | `700` (Bold) | `#F0F3F6` | Encabezado "Crea tu cuenta". |
| **`Atlas.Text.Screen`** | `26px` | `700` (Bold) | `#F0F3F6` | Títulos principales de pestaña (`Hola, Nombre`, `Rutinas`, `Medidas`, `Progreso`) y valor numérico del IMC. |
| **Nombre en Perfil (`tvProfileName`)** | `24px` | `700` (Bold) | `#F0F3F6` | Nombre centrado del usuario en Perfil. |
| **Títulos de BottomSheet** | `20px`–`22px` | `700` (Bold) | `#F0F3F6` | Títulos de hojas inferiores (`Editar mis metas`, `Nueva rutina`, vista previa). |
| **`Atlas.Text.Value`** | `20px` | `700` (Bold) | `#F0F3F6` | Valores destacados en tiles (`5 días`, `84.0 cm`, `%` de meta semanal a `17px`). |
| **`Atlas.Text.Section`** | `17px` | `700` (Bold) | `#F0F3F6` | Encabezados de sección (`Meta semanal`, `Hoy te toca`, `Mi plan`, títulos de rutina). |
| **`Atlas.Text.CardTitle`** | `15px` | `700` (Bold) | `#F0F3F6` | Títulos internos de tarjetas (`Agua de hoy`, `Peso corporal`, `Entrenamientos`, filas de ejercicios). |
| **`Atlas.Text.Body`** | `14px` | `400` (Regular) | `#A3ACB8` | Subtítulos de pantalla, músculos trabajados, estados vacíos y filas de configuración. |
| **`Atlas.Text.Caption`** | `12px` | `400` / `700` | `#858F9C` | Píldoras de métricas (`5 ejercicios • 50 min`), etiquetas de tiles, fechas y ejes. |

---

## 3. Componentes Base, Formas y Selectores (`themes.xml` + `drawable/bg_*.xml`)

### 3.1 Tarjetas (`Atlas.Card` / `bg_card_dark.xml`)
* **Fondo:** `#212631` (`surface_card`).
* **Borde:** `1px solid #30363D` (`surface_card_stroke`).
* **Radio de esquina (`border-radius`):**
  * Tarjetas principales (`Atlas.Card`): `18px`.
  * Tiles estadísticos (`item_stat_tile`, `item_measure_tile`, `item_workout_exercise`, `bg_card_dark`): `16px`.
* **Sombra / Elevación:** `0` (diseño plano con borde definido).
* **Padding interno estándar:** `18px` en tarjetas de sección; `14px` en tiles pequeños y tarjetas de ejercicios en vivo; `24px` en diálogos modales.

### 3.2 Botones (`Atlas.Button.*`)
1. **`Atlas.Button.Primary` (Botón Principal Naranja):**
   * Altura mínima: `52px` (`54px` en "Comenzar entrenamiento" y "Crear cuenta").
   * Fondo: `#FF9100` (`accent_orange`).
   * Texto e ícono: `#0E1117` (`bg_dark`), `15px` Bold.
   * Radio de esquina: `14px` (`12px` en Registro).
2. **Botón Primario Verde Neón (Login y Entrenamiento en Vivo):**
   * Usado en `btnLogin` (`54px` alto, radio `14px`), `btnFinishWorkout` (`40px` alto, radio `10px`) y `btnDoneSummary` (`48px` alto, radio `10px`).
   * Fondo: `#00E676` (`primary_neon`), texto `#0E1117` Bold.
3. **`Atlas.Button.Outlined` (Botón Secundario con Borde):**
   * Altura mínima: `48px`.
   * Fondo: Transparente.
   * Borde: `1px solid #30363D` (o `#FF5252` cuando es acción destructiva como `Eliminar` o `Cerrar sesión` con fondo `#1C1517`).
   * Texto: `#F0F3F6` (o `#A3ACB8` en botones `Cancelar`), `14px` Bold.
   * Radio de esquina: `14px`.
4. **`Atlas.Button.Round` (Botones Circulares `±`):**
   * Dimensiones: `48×48px` en Agua (`#00E5FF`); `52×52px` en Peso (`#F0F3F6`).
   * Fondo: Transparente con borde `1px solid #30363D`, `border-radius: 50%` (`24px`–`26px`), texto `20px` Bold centrado.
5. **Botón Tonal `+ Nueva Rutina` (`btnCreateRoutine`):**
   * Altura: `44px`, padding horizontal `14px 18px`, `border-radius: 22px`.
   * Fondo: `rgba(255, 145, 0, 0.20)` (`accent_orange_glow`), borde `1px solid #FF9100`, texto e ícono `#FF9100` a `13px` Bold.
6. **Botón Circular Play en Tarjeta de Rutina (`bg_play_button.xml`):**
   * Dimensiones: `48×48px`, `border-radius: 50%`, fondo `#FF9100`, ícono `ic_play` (`20×20px`) en color `#0E1117`.

### 3.3 Campos de Texto (`Atlas.TextInputLayout` y `bg_input_field.xml`)
* **Input de Formulario (`Atlas.TextInputLayout`):**
  * Fondo: `#1A1F29` (`surface_input`).
  * Radio de esquina: `12px`.
  * Borde (`atlas_box_stroke.xml`): `1px solid #30363D` en reposo/hover; cambia a `2px solid #00E676` (`primary_neon`) en estado `:focus`.
  * Etiqueta flotante / Hint activo: `#00E676` (`primary_neon`); placeholder: `#858F9C` (`text_muted`); texto: `#F0F3F6`.
  * Estado de error: Borde y texto inferior (`12px`) en `#FF5252` (`accent_red`).
* **Caja de Entrada Compacta (`bg_input_field.xml`):**
  * Usada en inputs de `KG` y `REPS` (`38px` alto), barra buscadora de ejercicios (`46px` alto) y badges secundarios.
  * Fondo: `#1A1F29`, borde `1px solid #30363D`, radio `8px`.

### 3.4 Chips de Filtro y Selección (`Atlas.Chip.Choice`)
* Altura mínima: `38px`, padding horizontal `14px`, `border-radius: 8px`–`10px`, texto `13px`.
* **Estado No Seleccionado:** Fondo `#1A1F29` (`surface_input`), borde `1px solid #30363D`, texto `#A3ACB8` (`text_secondary`).
* **Estado Seleccionado (`checked`):** Fondo `rgba(255, 145, 0, 0.20)` (`accent_orange_glow`), borde `1px solid #FF9100`, texto e ícono check en `#FF9100` (`accent_orange`) Bold.

### 3.5 Formas Auxiliares (`drawable/bg_*.xml`)
* **`bg_avatar_circle_orange.xml`**: Círculo (`border-radius: 50%`), fondo `#212631`, borde `2px solid #FF9100`. Dimensiones: `48×48px` en Inicio (`19px` bold) y `92×92px` en Perfil (`38px` bold).
* **`bg_chip_orange.xml`**: Cápsula con fondo `rgba(255, 145, 0, 0.20)`, borde `1px solid #FF9100`, radio `20px`, texto `#FF9100` (`11px`–`12px` bold). Usado en `"Hecho hoy"` y badge de Nivel (`"Intermedio"`).
* **`bg_pill.xml`**: Cápsula con fondo `#1A1F29`, sin borde, radio `20px`, padding `5px 12px`. Usado en `"5 ejercicios • 50 min"` y badge de delta de peso.
* **`bg_icon_tile.xml`**: Cuadrado redondeado `44×44px`, fondo `#1A1F29`, radio `12px`, padding `11px` (contenedor del ícono de gota de agua).
* **Círculos de Día de la Semana (`item_week_day.xml` - `34×34px`):**
  * `bg_day_done.xml` (Entrenado): Círculo relleno `#FF9100`, texto `#0E1117` Bold.
  * `bg_day_today.xml` (Hoy sin entrenar): Círculo fondo `#1A1F29`, borde `2px solid #FF9100`, texto `#F0F3F6` Bold.
  * `bg_day_idle.xml` (Inactivo): Círculo fondo `#1A1F29`, sin borde, texto `#858F9C`.
* **Botón Check de Serie (`bg_set_complete_btn.xml` - `40×38px`):**
  * No completada: Fondo `#1A1F29`, borde `1px solid #30363D`, radio `8px`, ícono `ic_check` en `#858F9C`.
  * Completada (`selected`): Fondo `#00E676` (`primary_neon`), sin borde, radio `8px`, ícono `ic_check` en `#0E1117`.
