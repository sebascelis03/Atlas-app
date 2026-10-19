# Prompt 3: Contenedor Principal (BottomNavigation) y Pantalla de Inicio (Dashboard)

**Objetivo:** Crear la actividad principal con menú de navegación inferior (`BottomNavigationView`) con las 4 pestañas y la pantalla de **Inicio** exactamente como en el mockup del equipo (Tarjeta de meta semanal, racha, y rutina del día).

---

### Instrucciones para Claude Code:

1. **Crear Menú de Navegación `app/src/main/res/menu/bottom_nav_menu.xml`:**
   * 4 ítems:
     - `nav_home` ("Inicio", icono home).
     - `nav_routines` ("Rutinas", icono lista/pesas).
     - `nav_progress` ("Progreso", icono gráfico/estadísticas).
     - `nav_profile` ("Perfil", icono persona).

2. **Crear Layout del Contenedor `app/src/main/res/layout/activity_home_container.xml`:**
   * `FragmentContainerView` que ocupe la pantalla.
   * `BottomNavigationView` anclado abajo:
     - Fondo: `@color/surface_dark`
     - Color de ítem seleccionado: `@color/accent_orange`
     - Color de ítem no seleccionado: `@color/text_secondary`

3. **Crear Layout de Inicio `app/src/main/res/layout/fragment_home.xml` (según mockup 3):**
   * Encabezado:
     - Fecha: "Martes, 15 de septiembre" (`text_secondary`, 13sp).
     - Saludo: "Hola, Andrés" (`text_primary`, 22sp, bold).
     - Avatar circular a la derecha con fondo gris/azul y letra "A".
   * Tarjeta "Meta semanal" (`surface_card` redondeada):
     - Anillo de progreso o indicador circular con "68%".
     - Texto: "Meta semanal - 4 de 6 entrenamientos".
     - Indicador con icono de llama: "🔥 Racha de 6 días" en `@color/accent_orange`.
   * Sección "Rutina de hoy • Empuje":
     - Título a la izquierda y enlace "Ver todo" a la derecha en naranja.
     - Lista de ejercicios de muestra:
       * "Press de banca" (4 series × 8 reps)
       * "Press militar" (3 series × 10 reps) con check naranja
       * "Fondos en paralelas" (3 series × 12 reps)
     - Botón "Comenzar entrenamiento": abre `MainActivity.kt` para entrenar con cronómetro en tiempo real.

4. **Crear `HomeContainerActivity.kt` y `HomeFragment.kt`:**
   * Conectar el cambio de pestañas del `BottomNavigationView` para intercambiar los fragments (`HomeFragment`, `RoutinesFragment`, `ProgressFragment`, `ProfileFragment`).
   * Configurar `LoginActivity.kt` para que al iniciar sesión navegue a `HomeContainerActivity`.

5. **Registrar en `AndroidManifest.xml` y verificar con `./gradlew assembleDebug`.**
