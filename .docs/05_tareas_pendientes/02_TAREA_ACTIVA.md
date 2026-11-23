# 🎯 Tarea Activa en Curso

## Plan de Implementación #8: Pestaña 2 — Rutinas (Bloques), Creación de Ejercicios Propios y Motor de Sesión en Vivo (Resolución de H-03)

* **Estado:** Pendiente de aprobación del usuario.
* **Objetivo:**
  1. Construir la **Pestaña 2 — Rutinas (Bloques)** (`src/screens/tabs/RoutinesTab.js`):
     * Filtros por grupo muscular, tarjetas con franja lateral coloreada por músculo primario y botón circular ▶ para iniciar el bloque.
     * BottomSheet de **Vista Previa de Bloque** (lista numerada de ejercicios, botón `"Iniciar entrenamiento"`, botón `"Editar"` y botón `"Eliminar"` con confirmación de doble toque).
     * BottomSheet de **Crear / Editar Bloque** (nombre libre sin días fijos, músculos principales, selección de ejercicios del catálogo y botón integrado **"+ Crear ejercicio propio"**).
  2. Resolver el hallazgo **H-03** implementando el **Motor de Alarma Sutil y Vibración (`src/core/alarm.js`)**:
     * Sintetizador de alarma sonora sutil mediante **Web Audio API** (acorde armónico suave sin archivos MP3 pesados externos) + `navigator.vibrate`, respetando los interruptores de *Preferencias* (`soundEnabled`, `vibrationEnabled`) y calculando el tiempo restante por marca de tiempo real (`Date.now()`) para que nunca pierda segundos aunque la pantalla se bloquee o la app pase a segundo plano.
  3. Construir el **Motor de Sesión en Vivo (`src/screens/WorkoutLiveScreen.js`)**:
     * Inicia tanto desde un **bloque guardado** como desde **"Iniciar rutina improvisada"**.
     * Cronómetro de duración en tiempo real, resumen de Volumen Total y Series Completadas.
     * **Temporizador de descanso programable** (con valor inicial tomado de *Preferencias*, editable durante la sesión, controles `+15s`, `-15s`, `Saltar` y alarma sutil al llegar a `00:00`).
     * Tarjetas de ejercicio con tabla de series (`SERIE`, `ANTERIOR` con marca histórica real, `KG`, `REPS`, botón check `✓`), botón **"+ Añadir Serie"** (copiando peso y reps de la anterior), botón **"Cambiar ejercicio"** sobre la marcha y botón eliminar ejercicio.
     * BottomSheet **Selector de Ejercicios** con buscador en tiempo real, chips por grupo muscular y formulario rápido para **"Crear ejercicio propio"** sin salir del entrenamiento.
     * Opciones para **"Finalizar"** o **"Finalizar antes"** guardando todo lo registrado y mostrando el **Diálogo Resumen de Entrenamiento Completado**.
