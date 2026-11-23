# Auditoría del proyecto ATLAS (27 oct 2026)

Alcance: app Android nativa (Kotlin + XML + ViewBinding, Material 1.10, sin librerías de gráficos),
~4.950 líneas. Revisadas las 4 pestañas (Inicio, Rutinas, Progreso, Perfil), repositorios, tema,
navegación, entrenamiento en vivo y documentación. No se modificó ningún archivo de la app.

## 1. Resumen ejecutivo

La base es sana: arquitectura simple y consistente, paleta oscura reconocible, validaciones y persistencia
ligera funcionando. Los problemas principales son (a) **datos que se corrompen con el tiempo** (semana, agua
e historial nunca se reinician ni guardan fechas reales), (b) **no se guarda el historial de entrenamientos**,
por eso la pestaña "Progreso" no tiene nada que graficar y en realidad es un formulario de registro,
y (c) **inconsistencia visual**: cada pantalla repite tarjetas a mano, hay dos colores "primarios" y varios textos
con poco contraste.

## 2. Hallazgos por severidad

### Críticos (datos / lógica)
| # | Hallazgo | Dónde |
|---|----------|-------|
| C1 | `entrenamientosSemana` solo se incrementa; **nunca se reinicia** al cambiar de semana. La meta semanal pasa del 100 % y queda así para siempre. | MetricsRepository |
| C2 | `vasosAgua` no se reinicia por día: el contador de "hoy" acumula indefinidamente. | MetricsRepository |
| C3 | El historial de peso usa la etiqueta literal `"Hoy"`: solo existe **una** entrada que se sobrescribe; no hay fechas reales, por lo que no hay historial ni tendencia. | MetricsRepository.updateWeight |
| C4 | Las métricas (peso, racha, total, agua) son **globales**, no por usuario: al cambiar de cuenta se ve la información del usuario anterior. | MetricsRepository (prefs sin clave de usuario) |
| C5 | Los entrenamientos terminados **no se guardan** (ni duración, volumen, series, ejercicios). Solo se suma un contador. `previousInfo` de cada serie siempre es "-". | MainActivity.finishWorkout |
| C6 | Contraseñas en texto plano en SharedPreferences y `allowBackup="true"`. Aceptable como demo escolar, pero debe documentarse o hashearse. | AuthRepository / Manifest |

### Altos (UX / producto)
| # | Hallazgo |
|---|----------|
| A1 | **Inicio**: la "Rutina de hoy" es un dato fijo (Press de banca, Press militar…) con un check falso y título "Empuje" quemado en strings; "Comenzar entrenamiento" abre una sesión **vacía**, no la rutina mostrada. |
| A2 | **Progreso** mezcla *registrar* (peso, agua) con *ver progreso* (que no existe): no hay gráficas, tendencia, récords, ni calendario de actividad. El peso se edita en dos pasos (±0.5 y luego "Guardar"). |
| A3 | **Rutinas**: toda la tarjeta inicia el entrenamiento al tocarla (inicio accidental, sin vista previa/confirmación aunque el README la promete). Las rutinas creadas nacen con 0 ejercicios, no se pueden editar ni borrar y se pierden al cerrar la app (solo en memoria). Sin búsqueda ni filtros. |
| A4 | **Perfil**: "Nivel: Intermedio" es fijo; la pestaña mezcla estadísticas, cuenta y metas sin jerarquía; no hay ajustes (unidades, meta semanal). |
| A5 | **No existe sección de medidas corporales** (pecho, cintura, brazo, etc.); el peso queda aislado en Progreso. |
| A6 | La meta semanal está fija en 4 (`META_SEMANAL`) y no es configurable. |

### Medios (diseño visual / accesibilidad)
| # | Hallazgo |
|---|----------|
| M1 | Doble identidad de color: el tema define `colorPrimary` verde (#00E676) pero casi toda la UI usa naranja (#FF9100); el verde aparece solo en deltas y el hint de inputs. |
| M2 | `text_muted` (#586069) sobre tarjetas (#212631) ≈ **2.3:1** de contraste: incumple WCAG AA (mín. 4.5:1) en descripciones, hints y métricas. |
| M3 | Objetivos táctiles pequeños: "Ver todo" (~24 dp), botón "Iniciar" (42 dp), botones del peso (44 dp). Mínimo recomendado 48 dp. |
| M4 | ~10 bloques de `MaterialCardView` copiados con los mismos atributos; tamaños de texto en `sp` sueltos (11/12/13/14/15/16/17/18/22/24/32) sin escala tipográfica. |
| M5 | Emojis (🔥 💧 🎯) como iconografía: se ven distinto según dispositivo y no son tintables. El set de iconos es mínimo (solo 12 vectores). |
| M6 | Las pestañas se recrean con `replace()`: se pierde el scroll y el estado al cambiar de pestaña; no hay animación de transición. |
| M7 | Sin estados vacíos ilustrados ni esqueletos; el vacío del historial es solo texto gris. |

### Bajos (mantenimiento)
- Textos duros en código (`"¡Entrenamiento guardado con éxito!"`, `"Hoy"`, `"Intermedio"`) fuera de `strings.xml`.
- Documentación desfasada: README/PLAN describen `QuickLogActivity`, `DailyLog` y `ProfileActivity`, que no existen (la app usa fragments).
- `release { optimization { enable = false } }`: sin minificación; tests unitarios/instrumentados son las plantillas por defecto (cero cobertura).
- Material 1.10.0 (antigua); `adapter.notifyDataSetChanged()` en lugar de DiffUtil; `androidx.recyclerview` no está declarada explícitamente.
- `.idea/` y `.gradle/` presentes en el árbol (el `.gitignore` los cubre parcialmente).

## 3. Lo que está bien (conservar)
- Separación UI / repositorios; el cambio a Room/Retrofit es posible sin tocar pantallas.
- Paleta oscura coherente, tarjetas con radios y bordes consistentes, edge-to-edge bien resuelto.
- Validaciones de formularios, diálogos con ancho controlado, rotación de pantalla cubierta en Progreso.
- Cálculo de racha por calendario (varias sesiones el mismo día = 1 día).

## 4. Propuesta de rediseño

**Navegación (5 pestañas):** Inicio · Rutinas · Progreso · **Medidas** · Perfil

| Pestaña | Rol | Contenido propuesto |
|---------|-----|---------------------|
| Inicio | "Hoy": qué hago ahora | Saludo + fecha; tira de la semana (L-D con días entrenados); meta semanal; rutina de hoy **real** (de RoutineRepository) con botón que la inicia; tarjeta rápida de agua del día; mini-stats (racha, volumen semanal). |
| Rutinas | Biblioteca | Chips de filtro por grupo muscular; tarjetas con acento de color por grupo, duración y ejercicios; toque = vista previa (bottom sheet) con "Iniciar"; crear/editar/borrar con ejercicios del catálogo; persistencia. |
| Progreso | Análisis | Selector 7D / 30D / 90D; gráfica de entrenamientos por semana; tendencia de peso (línea); volumen total; récords personales; calendario de actividad del mes; historial de sesiones. Solo lectura: nada de formularios. |
| Medidas (nueva) | Cuerpo | Peso con entrada rápida y fecha; cuadrícula de medidas (cuello, hombros, pecho, brazo, cintura, cadera, muslo, pantorrilla); IMC; delta vs. registro anterior y vs. inicio; historial por medida; fecha real en cada registro. |
| Perfil | Cuenta | Cabecera con avatar y nivel calculado (por entrenamientos totales); metas; ajustes (meta semanal, unidades); cerrar sesión. |

**Sistema de diseño:** un solo acento (naranja) + verde solo para "mejora"/éxito y cian para agua; estilos
`Atlas.Card`, `Atlas.Text.*` (escala tipográfica), `text_muted` subido a ≥ 4.5:1, objetivos táctiles ≥ 48 dp,
iconos vectoriales propios en lugar de emojis, gráficas dibujadas con Canvas propio (sin añadir dependencias).

**Capa de datos:** `WorkoutLogRepository` (sesiones con fecha, duración, volumen, ejercicios), `BodyMeasureRepository`
(registros fechados), reinicio diario/semanal real, métricas por usuario, rutinas persistidas en JSON.

## 5. Orden de ejecución sugerido
1. Datos y correcciones C1–C5 (sin esto las gráficas no tienen contenido).
2. Sistema de diseño (colores, estilos, iconos) + navegación de 5 pestañas.
3. Inicio → Rutinas → Medidas → Progreso → Perfil.
4. Limpieza (strings, docs, tests básicos de repositorios).

## 6. Estado tras el rediseño (27 oct 2026)

| Hallazgo | Estado |
|----------|--------|
| C1 semana nunca se reinicia | Resuelto: la semana se calcula del historial (lunes a domingo) |
| C2 agua no se reinicia | Resuelto: el contador guarda la fecha y vuelve a 0 cada día |
| C3 historial de peso sin fechas | Resuelto: `BodyRepository` guarda un registro por día con fecha real |
| C4 métricas globales | Resuelto: todo se guarda por usuario |
| C5 entrenamientos no se guardan | Resuelto: `WorkoutLogRepository` (duración, volumen, series, mejores pesos) |
| C6 contraseñas en texto plano / allowBackup | Pendiente (documentado como limitación de la demo) |
| A1–A6, A5 (Medidas) | Resueltos (ver README) |
| M1 doble color primario | Parcial: las 5 pestañas usan un solo acento (naranja); el tema de Login/Registro no se tocó |
| M2 contraste, M3 áreas táctiles | Resueltos en las 5 pestañas (muted ≥ 4.5:1, objetivos ≥ 48 dp) |
| M4 estilos repetidos | Resuelto: estilos `Atlas.Card`, `Atlas.Text.*`, `Atlas.Button.*` |
| M5 emojis como iconos | Resuelto en las 5 pestañas (iconos vectoriales) |
| M6 pierde scroll al cambiar pestaña | Resuelto (show/hide de fragments) |
| Bajos: strings, docs | Resueltos parcialmente; tests unitarios y `optimization` de release siguen pendientes |

Nota de migración: el contador de entrenamientos/racha de versiones anteriores no tenía historial, así que
empieza en cero; el último peso guardado se conserva como registro de hoy.
