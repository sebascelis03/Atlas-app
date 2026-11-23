# 📱 02. Distribución de Pantallas, Componentes, Modales y Textos (ATLAS)

Este documento detalla la estructura exacta de cada pantalla, sus márgenes, paddings, componentes internos, reglas de visualización y todos los textos oficiales extraídos de `res/layout/*.xml`, `strings.xml` y `strings_tabs.xml`.

---

## 1. Pantallas de Autenticación

### 1.1 Pantalla de Inicio de Sesión (`activity_login.xml`)
* **Contenedor raíz:** Scroll vertical sobre fondo `#0E1117`, `padding: 72px 28px 32px`, alineación horizontal centrada.
* **Cabecera de Marca:**
  * Ícono `ic_fitness_center` de `72×72px` tintado en `#00E676` (`primary_neon`).
  * Título `ATLAS` (`38px` Bold, `#F0F3F6`, `letter-spacing: 0.25em`, `margin-top: 12px`).
  * Eslogan `ENTRENA SIN LÍMITES` (`13px` Bold, `#00E676`, `margin-top: 2px`).
* **Tarjeta del Formulario (`margin-top: 40px`):**
  * Estilo `Atlas.Card` (`#212631`, borde `1px #30363D`, radio `18px`, `padding: 20px`).
  * Título: `"Iniciar sesión"` (`20px` Bold, `#F0F3F6`).
  * Subtítulo: `"Ingresa tus datos para continuar"` (`13px`, `#A3ACB8`, `margin-top: 2px`).
  * Input `"Correo electrónico"` (`margin-top: 22px`, tipo email).
  * Input `"Contraseña"` (`margin-top: 14px`, tipo password con botón ojo para mostrar/ocultar).
  * Enlace `"¿Olvidaste tu contraseña?"` (alineado a la derecha, `12px`, `#A3ACB8`, `margin-top: 10px`; al tocar muestra Toast `"Esta función estará disponible pronto"`).
  * Botón `"INICIAR SESIÓN"` (`width: 100%`, `height: 54px`, `margin-top: 16px`, fondo `#00E676`, texto `#0E1117` `15px` Bold, radio `14px`).
* **Pie de Pantalla:**
  * Enlace `"¿No tienes cuenta? Regístrate"` (`margin-top: 24px`, `14px`, `#A3ACB8`, con la palabra **`Regístrate`** en `#00E676` Bold).
  * Nota demo: `"Modo demo: admin@atlas.com / 123456"` (`margin-top: 18px`, `11px`, `#858F9C`).
* **Mensajes de Validación:**
  * Correo vacío: `"Ingresa tu correo electrónico"`
  * Correo inválido: `"El formato del correo no es válido"`
  * Contraseña vacía: `"Ingresa tu contraseña"`
  * Credenciales inválidas: `"Correo o contraseña incorrectos"`
  * Éxito: `"Bienvenido de nuevo, {Nombre}"`

---

### 1.2 Pantalla de Registro (`activity_register.xml`)
* **Contenedor raíz:** Scroll vertical sobre `#0E1117`, `padding: 20px 28px 32px`.
* **Elementos:**
  * Botón volver (`ic_arrow_back`, `40×40px`, padding `8px`, color `#F0F3F6`).
  * Título: `"Crea tu cuenta"` (`28px` Bold, `#F0F3F6`, `margin-top: 28px`).
  * Subtítulo: `"Empieza a registrar tu progreso hoy."` (`14px`, `#A3ACB8`, `margin-top: 6px`).
  * Input `"Nombre"` (`margin-top: 36px`, placeholder `"Tu nombre"`).
  * Input `"Correo electrónico"` (`margin-top: 14px`, placeholder `"nombre@correo.com"`).
  * Input `"Contraseña"` (`margin-top: 14px`, placeholder `"••••••••"`, toggle de visibilidad).
  * Texto legal (`margin-top: 20px`, `12px`, `#858F9C`): `"Al crear una cuenta aceptas los Términos y la Política de Privacidad."`
  * Botón `"Crear cuenta"` (`width: 100%`, `height: 54px`, `margin-top: 24px`, fondo `#FF9100`, texto `#0E1117` `16px` Bold, radio `12px`).
  * Enlace inferior centrado (`margin-top: 28px`, `14px`, `#A3ACB8`): `"¿Ya tienes cuenta? Inicia sesión"` con **`Inicia sesión`** resaltado en `#FF9100` Bold.
* **Mensajes de Validación:**
  * Nombre vacío: `"Ingresa tu nombre"`
  * Correo vacío: `"Ingresa tu correo electrónico"` / Formato inválido: `"El formato del correo no es válido"`
  * Contraseña vacía: `"Crea una contraseña"` / Menor a 6 caracteres: `"La contraseña debe tener al menos 6 caracteres"`
  * Correo duplicado: `"Ese correo ya está registrado"`
  * Éxito: `"¡Cuenta creada con éxito! Bienvenido"` (crea usuario con `70.0 kg` de peso inicial/meta y objetivo `"Hipertrofia"`).

---

## 2. Contenedor Principal y Barra de Navegación Inferior (`activity_home_container.xml`)

* **Estructura:** Layout de pantalla completa con área superior flexible para las 5 vistas de pestañas (que se ocultan/muestran conservando su scroll) + línea divisoria de `1px` (`#262C38`) + barra inferior fija (`#161B22`).
* **Orden Exacto de las 5 Pestañas (`bottom_nav_menu.xml`):**
  1. **Inicio** (`ic_home`)
  2. **Rutinas** (`ic_fitness_center`)
  3. **Medidas** (`ic_ruler`)
  4. **Progreso** (`ic_bar_chart`)
  5. **Perfil** (`ic_person`)
* **Estilo de cada ítem del BottomNav:**
  * Siempre muestra ícono + etiqueta (`labelVisibilityMode="labeled"`).
  * Ítem activo: Píldora ovalada alrededor del ícono en `rgba(255, 145, 0, 0.20)` (`#33FF9100`), ícono y texto en `#FF9100` Bold.
  * Ítem inactivo: Ícono y texto en `#A3ACB8` (`text_secondary`).

---

## 3. Especificación de las 5 Pestañas Principales

### 3.1 Pestaña 1: Inicio (`fragment_home.xml`)
* **Padding general:** `24px 20px 28px`.
* **1. Encabezado (Fila horizontal):**
  * Columna izquierda: Fecha larga en español capitalizada (ej. `"Lunes, 26 de octubre"`, `14px` `#A3ACB8`) y saludo `"Hola, {Nombre}"` (`26px` Bold `#F0F3F6`, `margin-top: 2px`).
  * Derecha: Avatar circular `48×48px` (`bg_avatar_circle_orange`: fondo `#212631`, borde `2px #FF9100`, inicial en `#FF9100` `19px` Bold).
* **2. Tarjeta de Meta Semanal (`margin-top: 22px`, `padding: 18px`):**
  * Fila superior:
    * Izquierda: Anillo circular (`CircularProgressIndicator`) de `76×76px`, grosor de trazo `8px`, pista `#1A1F29`, indicador `#FF9100` con bordes redondeados (`4px`), porcentaje centrado en el interior (`17px` Bold `#F0F3F6`, ej. `"75%"`).
    * Derecha (`margin-left: 18px`): Título `"Meta semanal"` (`17px` Bold), detalle `"{completados} de {meta} entrenamientos"` (`14px` `#A3ACB8`), y pista inferior (`12px` `#858F9C`, `margin-top: 6px`): `"¡Meta semanal cumplida!"` o `"Te falta(n) {N} entrenamiento(s)"`.
  * Fila inferior (`margin-top: 18px`): **Tira de la Semana (`L M X J V S D`)** con 7 columnas iguales (`item_week_day.xml`): letra superior (`12px` `#858F9C`) y círculo inferior de `34×34px` (`margin-top: 6px`, número del día del mes a `12px` Bold) con estado entrenado (`#FF9100`), hoy (`borde 2px #FF9100`) o inactivo (`#1A1F29`).
* **3. Fila de 3 Mini-Estadísticas (`margin-top: 12px`, separación `8px` entre tarjetas):**
  * Usa `item_stat_tile.xml` (radio `16px`, `padding: 14px`, ícono superior `20×20px`, valor `20px` Bold `margin-top: 10px`, etiqueta `12px` `#858F9C`):
    1. **Racha:** Ícono `ic_flame` en `#FF9100`, valor `"{N} día(s)"`, etiqueta `"Racha"`.
    2. **Volumen semanal:** Ícono `ic_bolt` en `#FFD740` (`group_core`), valor `"{X} kg"` (o `"{X.X} t"` si ≥ 1000 kg), etiqueta `"Volumen semanal"`.
    3. **Entrenamientos:** Ícono `ic_trophy` en `#00E676` (`primary_neon`), valor `"{Total}"`, etiqueta `"Entrenamientos"`.
* **4. Sección "Hoy te toca" (`margin-top: 22px`):**
  * Cabecera: Texto `"Hoy te toca"` (`17px` Bold) a la izquierda y botón de texto `"Ver todo"` (`14px` Bold `#FF9100`) a la derecha que navega a la pestaña Rutinas.
  * Tarjeta de Rutina Sugerida (`padding: 18px 0`):
    * Cabecera (`padding: 0 18px`): Título de la rutina (`17px` Bold), músculos (`14px` `#A3ACB8`), y a la derecha badge opcional `"Hecho hoy"` (`bg_chip_orange`, `11px` Bold) si ya se entrenó hoy.
    * Píldora de métricas (`margin: 10px 0 0 18px`, `bg_pill`): `"{N} ejercicios • {Min} min"`.
    * Lista de primeros 4 ejercicios (`item_home_exercise.xml`, `padding: 12px 18px`): cuadro de ícono `34×34px` (`#1A1F29`, radio `8px`, `ic_fitness_center` en `#A3ACB8`), nombre del ejercicio (`15px` Bold) y subtítulo `"3 series × 10 reps"` (`13px` `#A3ACB8`). Si hay más de 4, muestra fila `"+{N} ejercicios más"`.
    * Botón `"Comenzar entrenamiento"` (`margin: 14px 18px 0`, `height: 54px`, fondo `#FF9100`, ícono `ic_play` + texto `#0E1117` `15px` Bold, radio `14px`).
* **5. Tarjeta de Hidratación (`margin-top: 16px`, `padding: 18px`):**
  * Fila superior: Cuadro `44×44px` (`bg_icon_tile` `#1A1F29`, radio `12px`) con ícono `ic_drop` en `#00E5FF`; columna central con `"Agua de hoy"` (`15px` Bold) y `"{vasos} / 8 vasos"` (`14px` `#A3ACB8`); a la derecha dos botones circulares `48×48px` (`−` y `+`, texto `#00E5FF`, separados por `8px`).
  * Barra inferior (`margin-top: 16px`): Barra de progreso lineal de `8px` de alto, radio `4px`, pista `#1A1F29`, relleno `#00E5FF`.

---

### 3.2 Pestaña 2: Rutinas (`fragment_routines.xml`)
* **1. Encabezado (`padding: 24px 20px 0`):**
  * Izquierda: Título `"Rutinas"` (`26px` Bold) y contador `"{N} rutina(s)"` (`14px` `#A3ACB8`).
  * Derecha: Botón tonal `"+ Nueva Rutina"` (`height: 44px`, radio `22px`, fondo `#33FF9100`, borde `1px #FF9100`, texto `#FF9100` `13px` Bold).
* **2. Tira de Filtros por Grupo Muscular (`margin-top: 14px`, scroll horizontal, `padding: 0 20px`):**
  * Chips de selección única (`item_goal_chip.xml`): `"Todos"`, `"Pecho"`, `"Espalda"`, `"Pierna"`, `"Hombro"`, `"Brazos"`, `"Core"`.
* **3. Lista de Tarjetas de Rutina (`padding: 14px 20px 20px`):**
  * Cada tarjeta (`item_routine_card.xml`, `margin-bottom: 12px`, radio `18px`, `overflow: hidden`) tiene:
    * Barra vertical izquierda de `5px` de ancho coloreada según el grupo muscular principal de sus ejercicios (`MuscleStyle`).
    * Cuerpo (`padding: 16px`, fila horizontal):
      * Columna izquierda: Título (`17px` Bold), músculos (`14px` `#A3ACB8`), vista previa de hasta 3 ejercicios separados por `" • "` (`12px` `#858F9C`, `margin-top: 8px`, máx 2 líneas con elipsis), y píldora `"{N} ejercicios • {Min} min"` (`bg_pill`, `margin-top: 10px`).
      * Derecha (`margin-left: 12px`): Botón circular Play de `48×48px` (`#FF9100` con ícono `ic_play` en `#0E1117`).
  * **Interacción dual:** Tocar el cuerpo de la tarjeta abre el **BottomSheet de Vista Previa**; tocar el botón ▶ inicia directamente el entrenamiento en vivo con esa rutina.

---

### 3.3 Pestaña 3: Medidas (`fragment_measures.xml`)
* **Padding general:** `24px 20px 28px`.
* **1. Encabezado:** Título `"Medidas"` (`26px` Bold) y subtítulo `"Tu cuerpo, con fechas reales"` (`14px` `#A3ACB8`).
* **2. Tarjeta de Peso Corporal (`margin-top: 20px`, `padding: 18px`):**
  * Fila superior: Título `"Peso corporal"` (`15px` Bold) a la izquierda y badge de variación (`bg_pill`, `12px` Bold, ej. `"-0.4 kg"`, coloreado en `#00E676` si acerca al peso meta o `#FF9100` si aleja).
  * Fila central (`margin-top: 12px`): Botón circular `−` (`52×52px`) a la izquierda, valor de peso clicable en el centro (`34px` Bold `#F0F3F6`, ej. `"74.8 kg"` o `"Sin registro"`), y botón circular `+` (`52×52px`) a la derecha. Los botones `±` ajustan y guardan `0.5 kg` al instante; tocar el número central abre el diálogo de peso exacto.
  * Textos informativos centrados: Mensaje de distancia a la meta (`13px` Bold `#FF9100`, `margin-top: 8px`: `"Estás a X kg de tu meta"` / `"Te faltan X kg para tu meta"` / `"¡Alcanzaste tu peso meta! 🎯"` / `"Define tu peso meta en el Perfil"`) y pista `"Toca el valor para escribirlo exacto"` (`12px` `#858F9C`).
  * Gráfica de línea (`chartWeight`, `height: 140px`, `margin-top: 14px`): Muestra los últimos 30 registros de peso.
* **3. Tarjeta de Índice de Masa Corporal (`margin-top: 14px`, `padding: 18px`, fila horizontal):**
  * Izquierda: Título `"Índice de masa corporal"` (`15px` Bold), valor numérico del IMC (`26px` Bold `#F0F3F6`, `margin-top: 4px`, o `"—"`), y categoría (`14px` `#A3ACB8`: `"Bajo peso"` < 18.5, `"Peso normal"` < 25.0, `"Sobrepeso"` < 30.0, `"Obesidad"` ≥ 30.0, o `"Agrega tu estatura para calcularlo"`).
  * Derecha: Botón `Atlas.Button.Outlined` (`height: 48px`, ícono `ic_edit` + texto `"Agregar estatura"` o `"Estatura: {X} cm"`).
* **4. Sección de Medidas Corporales (`margin-top: 24px`):**
  * Título `"Medidas corporales"` (`17px` Bold) y subtítulo `"Toca una medida para anotarla (en centímetros)"` (`12px` `#858F9C`).
  * **Cuadrícula `2×4` (`margin-top: 10px`, 4 filas de 2 columnas con `gap: 8px`):**
    * Orden de las 8 medidas: **Cuello**, **Hombros**, **Pecho**, **Brazo**, **Cintura**, **Cadera**, **Muslo**, **Pantorrilla**.
    * Cada tile (`item_measure_tile.xml`, radio `16px`, `padding: 14px`) muestra: etiqueta (`14px` `#A3ACB8`) + ícono `ic_edit` (`14×14px` `#858F9C`) arriba; valor `"{X.X} cm"` o `"—"` (`20px` Bold, `margin-top: 8px`); y delta inferior (`12px` Bold: `"{+X.X} cm"` coloreado en `#00E676` o `#FF9100`, o `"Toca para anotar"` / `"Primer registro"` en `#858F9C`).
    * *Regla de color del delta en medidas:* Para `cintura` y `cadera` (o si el objetivo del usuario es `"Pérdida de Grasa"`), bajar (`delta < 0`) es verde `#00E676`; para el resto de músculos en Hipertrofia/Fuerza, subir (`delta > 0`) es verde `#00E676`.
* **5. Tarjeta de Historial (`margin-top: 8px`, `padding: 18px`):**
  * Título `"Historial"` (`15px` Bold) y lista de los últimos 8 registros diarios (`item_weight_log.xml`, `padding: 10px 0`): fecha (`"Hoy"` o `"26 oct"`, `14px` Bold) y resumen (`"Solo peso"` o `"{N} medida(s)"`, `12px` `#858F9C`) a la izquierda; badge de variación de peso (`bg_input_field`, `11px` Bold) y peso (`15px` Bold) a la derecha.

---

### 3.4 Pestaña 4: Progreso (`fragment_progress.xml`)
* **Padding general:** `24px 20px 28px`. Solo análisis de lectura (sin formularios).
* **1. Encabezado y Selector de Periodo:**
  * Título `"Progreso"` (`26px` Bold) y subtítulo `"Cómo vienes entrenando"` (`14px` `#A3ACB8`).
  * Grupo de 3 chips de selección única (`margin-top: 14px`): **`7 días`** (activo por defecto), **`30 días`**, **`90 días`**.
* **2. Fila de 3 Tiles del Periodo (`margin-top: 12px`, `item_stat_tile.xml`):**
  1. **Sesiones:** Ícono `ic_fitness_center` en `#FF9100`, cantidad de sesiones en el rango.
  2. **Volumen:** Ícono `ic_bolt` en `#FFD740`, suma de volumen del rango (`kg` o `t`).
  3. **Tiempo:** Ícono `ic_timer` en `#00E5FF`, tiempo total entrenado (`"{M} min"` o `"{H} h {M} min"`).
* **3. Tarjeta Gráfica de Entrenamientos (`margin-top: 8px`, `padding: 18px`):**
  * Título `"Entrenamientos"` (`15px` Bold).
  * Subtítulo dinámico (`12px` `#858F9C`): `"Por día · últimos 7 días"` (en 7D) o `"Por semana (lunes a domingo)"` (en 30D = 5 semanas, en 90D = 13 semanas).
  * Gráfica `BarChartView` (`height: 180px`, `margin-top: 10px`).
* **4. Tarjeta Tendencia de Peso (`margin-top: 14px`, `padding: 18px`):**
  * Cabecera: Izquierda con título `"Tendencia de peso"` (`15px` Bold) y resumen (`12px` `#858F9C`: `"{último} kg · {±cambio} kg en el periodo"` o `"Registra tu peso en Medidas"`); derecha con botón de texto `"Medidas"` (`13px` Bold `#FF9100`) que salta a la pestaña Medidas.
  * Gráfica `LineChartView` (`height: 150px`, `margin-top: 8px`).
* **5. Tarjeta Calendario de Actividad (`margin-top: 14px`, `padding: 18px`):**
  * Título `"Actividad"` (`15px` Bold) y subtítulo `"Últimas 5 semanas · cada círculo naranja es un día entrenado"` (`12px` `#858F9C`).
  * Vista `ActivityCalendarView` (`margin-top: 12px`, cuadrícula de 5 semanas × 7 columnas `L–D`).
* **6. Tarjeta Récords Personales (`margin-top: 14px`, `padding: 18px`):**
  * Título `"Récords personales"` (`15px` Bold).
  * Top 5 mejores levantamientos históricos por ejercicio (`item_record_row.xml`, `padding: 9px 0`): círculo de posición `1..5` (`26×26px`, fondo `#1A1F29`, texto `#FF9100` `12px` Bold), nombre del ejercicio (`14px` Bold `#F0F3F6`) y mejor peso (`15px` Bold `#FF9100`, ej. `"80.0 kg"`).
* **7. Tarjeta Últimas Sesiones (`margin-top: 14px`, `padding: 18px`):**
  * Título `"Últimas sesiones"` (`15px` Bold).
  * Lista de hasta 8 entrenamientos terminados (`item_session_log.xml`, `padding: 10px 0`): título de la sesión (`14px` Bold) y metadatos `"{tiempo} • {series} series • {volumen}"` (`12px` `#858F9C`) a la izquierda; fecha corta (`"26 oct"`, `14px` `#A3ACB8`) a la derecha.

---

### 3.5 Pestaña 5: Perfil (`fragment_profile.xml`)
* **Padding general:** `28px 20px 28px`.
* **1. Identidad Centrada:**
  * Avatar circular `92×92px` (`bg_avatar_circle_orange`, inicial a `38px` Bold `#FF9100`).
  * Nombre del usuario (`24px` Bold `#F0F3F6`, centrado, `margin-top: 14px`).
  * Correo electrónico (`14px` `#A3ACB8`, centrado, `margin-top: 2px`).
* **2. Tarjeta de Nivel del Atleta (`margin-top: 22px`, `padding: 18px`):**
  * Fila superior: `"Nivel"` (`15px` Bold) a la izquierda y badge `bg_chip_orange` (`12px` Bold `#FF9100`) a la derecha (`"Principiante"` 0–9, `"Intermedio"` 10–29, `"Avanzado"` 30–74, `"Élite"` 75+ entrenamientos).
  * Barra de progreso lineal (`margin-top: 14px`, altura `8px`, radio `4px`, pista `#1A1F29`, relleno `#FF9100`).
  * Detalle inferior (`12px` `#858F9C`, `margin-top: 8px`): `"{actual} de {necesarios} entrenamientos para {SiguienteNivel}"` o `"Nivel máximo alcanzado"`.
* **3. Fila de 3 Tiles (`margin-top: 12px`, `item_stat_tile.xml`):**
  1. **Peso:** Ícono `ic_ruler` en `#00E5FF`, último peso o `"Sin registro"`.
  2. **Meta:** Ícono `ic_trophy` en `#00E676`, peso meta (clicable para abrir editor de metas).
  3. **Racha:** Ícono `ic_flame` en `#FF9100`, `"{N} día(s)"`.
* **4. Sección "Mi plan" (`margin-top: 22px`):**
  * Título `"Mi plan"` (`17px` Bold) y tarjeta con 3 filas clicables (`item_setting_row.xml`, altura mínima `56px`, `padding: 0 18px`, divisor interno `1px #30363D`, con chevron derecho `ic_chevron_right` `16×16px` en `#858F9C`; tocar cualquiera abre el **BottomSheet Editar mis metas**):
    1. `"Objetivo"` → `"Hipertrofia"` / `"Fuerza"` / `"Pérdida de Grasa"`
    2. `"Meta"` → `"{X.X} kg"`
    3. `"Meta semanal"` → `"{N} por semana"`
* **5. Sección "Información de la cuenta" (`margin-top: 22px`):**
  * Título `"Información de la cuenta"` (`17px` Bold) y tarjeta con 2 filas informativas (sin chevron):
    1. `"Correo"` → correo del usuario
    2. `"Entrenamientos totales"` → total histórico
* **6. Botón Cerrar Sesión (`margin-top: 26px`):**
  * Altura `54px`, radio `14px`, fondo `#1C1517` (`surface_danger`), borde `1px solid #FF5252`, ícono `ic_close` y texto `"Cerrar sesión"` en `#FF5252` `15px` Bold.

---

## 4. Pantalla de Entrenamiento en Vivo (`activity_main.xml`)

* **1. Barra Superior (`#161B22`, `padding: 12px 16px`, fila horizontal):**
  * Izquierda:
    * Marca `"ATLAS GYM"` (`12px` Bold `#00E676`, `letter-spacing: 0.1em`).
    * Título de la rutina o `"Entrenamiento de Hoy"` (`20px` Bold `#F0F3F6`).
    * Cronómetro en vivo: Ícono `ic_timer` (`14×14px` `#A3ACB8`) + tiempo transcurrido `MM:SS` (`13px` `#A3ACB8`).
  * Derecha: Botón `"Finalizar"` (`height: 40px`, padding horizontal `16px`, radio `10px`, fondo `#00E676`, texto `#0E1117` `13px` Bold).
* **2. Barra Resumen Rápida (`#212631`, `padding: 8px 16px`, fila horizontal de 2 columnas divididas por línea vertical `1×24px #30363D`):**
  * Columna 1: `"VOLUMEN TOTAL"` (`10px` Bold `#858F9C`) y valor `"{X} kg"` (`15px` Bold `#F0F3F6`).
  * Columna 2: `"SERIES COMPLETADAS"` (`10px` Bold `#858F9C`) y valor `"{completadas} de {total}"` (`15px` Bold `#F0F3F6`).
* **3. Barra Colapsable de Temporizador de Descanso (`#1A1F29`, `padding: 8px 16px`):**
  * Se activa automáticamente en `01:30` (`90s`) cada vez que el usuario marca una serie como completada (`✓`).
  * Izquierda: Ícono `ic_timer` (`18×18px` `#FF9100`), texto `"Descanso:"` (`13px` `#A3ACB8`) y cuenta regresiva `MM:SS` (`16px` Bold `#FF9100`).
  * Derecha: Botón `"+15s"` (`bg_input_field`, `12px` Bold `#F0F3F6`) y botón `"Saltar"` (`bg_input_field`, `12px` `#A3ACB8`, `margin-left: 8px`).
* **4. Lista de Ejercicios Activos (`padding: 8px 0 80px`):**
  * **Estado vacío** (cuando se entra en modo libre sin ejercicios): Ícono `ic_fitness_center` (`64×64px` `#858F9C`), título `"Tu entrenamiento está vacío"` (`18px` Bold) y subtítulo `"Toca el botón inferior para agregar tus primeros ejercicios de gimnasio."` (`14px` `#A3ACB8`).
  * **Tarjeta de Ejercicio (`item_workout_exercise.xml`, `margin: 8px 12px`, radio `16px`, `padding: 14px`):**
    * Cabecera: Nombre del ejercicio (`18px` Bold `#F0F3F6`), fila inferior con tag de músculo en mayúsculas (`bg_input_field`, `11px` Bold `#00E676`, ej. `"PECHO"`) + equipamiento (`11px` `#858F9C`, ej. `"Barra"`), y a la derecha botón papelera `ic_delete` (`32×32px` `#858F9C`).
    * Divisor horizontal `1px #30363D`.
    * Cabecera de tabla de series (`11px` Bold `#858F9C`):
      * `SERIE` (`36px` ancho, centrado)
      * `ANTERIOR` (`flex: 1.2`, centrado)
      * `KG` (`flex: 1`, centrado)
      * `REPS` (`flex: 1`, centrado)
      * `✓` (`40px` ancho, centrado)
    * Filas de series (`item_workout_set.xml`, `padding: 4px`):
      * Número de serie (`14px` Bold `#A3ACB8`), marca anterior (`12px` `#858F9C`, `"-"` o `"{kg} kg × {reps}"`), input numérico decimal `KG` (`38px` alto, `bg_input_field`, `15px` Bold centrado), input entero `REPS` (`38px` alto, `bg_input_field`, `15px` Bold centrado), y botón check `40×38px` (`bg_set_complete_btn`).
    * Botón `"+ Añadir Serie"` (`margin-top: 10px`, `height: 40px`, fondo `#161B22`, borde `1px #30363D`, radio `8px`, texto `#00E676` `13px` Bold). Al pulsarlo, agrega una serie copiando el peso y repeticiones de la última serie del ejercicio.
* **5. Barra Inferior Fija (`#161B22`, `padding: 12px`):**
  * Botón `"+ Añadir Ejercicio"` (`width: 100%`, `height: 52px`, fondo `#212631`, borde `1px solid #00E676`, radio `14px`, texto `#00E676` `15px` Bold).

---

## 5. Especificación de Modales (BottomSheets y Diálogos al 88% de Ancho)

### 5.1 BottomSheets (`fondo #161B22`, bordes superiores redondeados `24px`, asa superior centrada de `40×4px #30363D`)
1. **Vista Previa de Rutina (`bottom_sheet_routine_preview.xml`):**
   * Título (`22px` Bold), músculos (`14px` `#A3ACB8`), píldora `"{N} ejercicios • {Min} min"`, lista numerada `"1.  {NombreEjercicio}"` (`15px` `#F0F3F6`, `padding: 10px 0`), botón primario `"Iniciar entrenamiento"` (`54px` alto, `#FF9100`), y fila inferior con 2 botones `Outlined` (`48px` alto): `"Editar"` e `"Eliminar"` (en `#FF5252`; el primer toque cambia el texto a `"¿Seguro? Toca otra vez"` y el segundo toque elimina la rutina).
2. **Crear / Editar Rutina (`dialog_create_routine.xml`):**
   * Título `"Nueva rutina"` o `"Editar rutina"` (`22px` Bold), input `"Nombre del bloque"` (placeholder `"Ej. Día 5: Hombro y Core"`), input `"Músculos principales"` (placeholder `"Ej. Deltoides y Abdomen"`), cabecera `"Ejercicios"` con contador `"{N} seleccionado(s)"` en `#FF9100` Bold, grupos de chips multi-selección organizados bajo subtítulos de cada grupo muscular (`Pecho`, `Espalda`, `Pierna`, `Hombro`, `Brazos`, `Core`), y fila inferior con botones `"Cancelar"` y `"Guardar"` (`52px` alto).
3. **Selector de Ejercicios (`bottom_sheet_exercise_picker.xml`):**
   * Cabecera con `"Seleccionar Ejercicio"` (`18px` Bold) y botón cerrar `ic_close`; barra buscadora (`46px` alto, ícono `ic_search` + input `"Buscar ejercicio (ej. Banca, Sentadilla)..."`); tira horizontal de chips de grupo muscular; y lista desplazable de ejercicios (`item_exercise_picker.xml`: cuadro `44×44px` con `ic_fitness_center` en `#00E676`, nombre `15px` Bold, subtítulo `"{Músculo} • {Equipo}"` `12px` `#A3ACB8`, e ícono `ic_add` `24×24px` en `#00E676`).
4. **Editar mis Metas (`bottom_sheet_edit_goals.xml`):**
   * Título `"Editar mis metas"` (`20px` Bold), subtítulo `"Ajusta tu peso objetivo y tu enfoque de entrenamiento"` (`13px` `#A3ACB8`), input `"Peso meta (kg)"` con sufijo `"kg"` (valida rango `30` a `300 kg`), chips de selección única para `"Objetivo fitness"` (`Hipertrofia`, `Fuerza`, `Pérdida de Grasa`), chips de selección única para `"Entrenamientos por semana"` (`1` a `7`), y botón `"Guardar cambios"` (`52px` alto, `#FF9100`).

### 5.2 Diálogos Centrados (`ancho = 88% del viewport`, `bg_card_dark`: fondo `#212631`, borde `1px #30363D`, radio `16px`, `padding: 24px`)
1. **Diálogo de Entrada Numérica (`dialog_edit_weight.xml`):**
   * Usado para Peso exacto (`30–300 kg`), Estatura (`100–250 cm`) y las 8 Medidas corporales (`5–250 cm`).
   * Título (`20px` Bold), subtítulo opcional (`14px` `#A3ACB8`), input numérico con sufijo (`"kg"` o `"cm"`) que acepta punto o coma decimal, y fila de botones `"Cancelar"` (`Outlined`) y `"Aplicar"` (`Primary` `#FF9100`).
2. **Diálogo Resumen de Entrenamiento (`dialog_workout_summary.xml`):**
   * Ícono `ic_check` centrado (`56×56px` en `#00E676`), título `"¡Entrenamiento Completado!"` (`20px` Bold), subtítulo `"Excelente trabajo, sigue construyendo tu fuerza."` (`13px` `#A3ACB8`).
   * Caja de 3 columnas (`bg_input_field`, `padding: 16px`, separadas por divisores verticales `1×32px #30363D`):
     * `TIEMPO` (`10px` Bold `#858F9C`) → `"{M}m {S}s"` (`16px` Bold `#F0F3F6`)
     * `VOLUMEN` (`10px` Bold `#858F9C`) → `"{Volumen} kg"` (`16px` Bold `#00E676`)
     * `SERIES` (`10px` Bold `#858F9C`) → `"{Completadas}"` (`16px` Bold `#F0F3F6`)
   * Botón `"Guardar y Continuar"` (`height: 48px`, fondo `#00E676`, texto `#0E1117` `14px` Bold, radio `10px`).
3. **Diálogo Confirmación de Cierre de Sesión (`dialog_confirm_logout.xml`):**
   * Ícono `ic_close` centrado (`52×52px` en `#FF5252`), título `"¿Cerrar sesión?"` (`20px` Bold), mensaje `"¿Estás seguro de que deseas salir?"` (`14px` `#A3ACB8`), y fila de botones `"Cancelar"` (peso `1`, `Outlined`) y `"Cerrar sesión"` (peso `1.4`, fondo `#FF5252`, texto `#FFFFFF` `14px` Bold, radio `14px`).
