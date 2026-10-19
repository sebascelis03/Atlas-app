# Prompt 4: Pantalla de Rutinas (Bloques de Entrenamiento)

**Objetivo:** Crear la pestaña de **Rutinas** (`RoutinesFragment` + `fragment_routines.xml` + adapter de rutinas) que permita visualizar bloques de entrenamiento (Push / Pull / Legs), crear una nueva rutina y lanzar `MainActivity` para entrenar.

---

### Instrucciones para Claude Code:

1. **Crear Modelo y Repositorio de Rutinas `RoutineRepository.kt`:**
   * Ruta: `app/src/main/java/com/proyecto/atlas/data/RoutineRepository.kt`
   * Modelo `Routine.kt`: id, nombre (ej: "Bloque A: Empuje"), descripción ("Pecho, Hombro y Tríceps"), cantidadEjercicios, minutosEstimados, listaDeEjercicios.
   * Rutinas mock predeterminadas:
     - "Día 1: Empuje (Push)" - 5 ejercicios - 55 min.
     - "Día 2: Tirón (Pull)" - 5 ejercicios - 50 min.
     - "Día 3: Pierna (Legs)" - 6 ejercicios - 65 min.
     - "Día 4: Torso Completo" - 6 ejercicios - 60 min.
   * Método `addRoutine(newRoutine)` para agregar nuevas rutinas personalizadas.

2. **Crear Layout de Ítem de Rutina `app/src/main/res/layout/item_routine_card.xml`:**
   * Tarjeta `MaterialCardView` con fondo `@color/surface_card` y borde sutil `@color/surface_card_stroke`.
   * Título de la rutina (ej: "Día 1: Empuje").
   * Subtítulo con grupos musculares y duración (ej: "5 ejercicios • 55 min").
   * Botón estilizado naranja "Iniciar ▶" (`btnStartRoutine`) que abre `MainActivity`.

3. **Crear Layout `app/src/main/res/layout/fragment_routines.xml`:**
   * Encabezado: Título **"Mis Rutinas"** y botón superior **"+ Nueva Rutina"** (`btnCreateRoutine`) en naranja.
   * `RecyclerView` (`rvRoutines`) vertical para listar las rutinas disponibles.
   * Diálogo o BottomSheet sencillo al pulsar "+ Nueva Rutina" que permita ingresar el nombre del bloque y guardarlo.

4. **Crear `RoutinesFragment.kt` y `RoutineAdapter.kt`:**
   * Enlazar el RecyclerView con `RoutineRepository.getDefaultRoutines()`.
   * Al hacer clic en "Iniciar", abrir `MainActivity`.

5. **Verificar compilación con `./gradlew assembleDebug`.**
