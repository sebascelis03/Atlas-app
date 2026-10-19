# Prompt 5: Pantallas de Progreso (Registro Rápido) y Perfil

**Objetivo:** Implementar la pestaña de **Progreso (Registro Rápido de Métricas)** y la pestaña de **Perfil (Datos y Cierre de Sesión)**, completando todas las pantallas de la aplicación.

---

### Instrucciones para Claude Code:

#### PARTE A: Pestaña de Progreso / Registro Rápido (`ProgressFragment.kt`)

1. **Crear Modelo y Repositorio de Métricas `MetricsRepository.kt`:**
   * Modelo `WeightLog`: fecha (String), pesoKg (Double).
   * Modelo `DailyMetrics`: pesoActual, vasosAgua (Int), metaAgua (Int = 8), notas (String).
   * Persistencia en memoria/SharedPreferences con métodos para actualizar peso y vasos de agua.

2. **Crear Layout `app/src/main/res/layout/fragment_progress.xml`:**
   * Título: **"Progreso y Registro Diario"** (`text_primary`, bold).
   * **Tarjeta 1: Registro Rápido de Peso de Hoy:**
     - Título "Peso Corporal Actual".
     - Valor destacado en grande (ej: "74.8 kg").
     - Botones `[ - 0.5 ]` y `[ + 0.5 ]` o campo editable para ajustar rápidamente el peso.
     - Botón naranja: "Guardar peso de hoy" (`btnSaveWeight`).
   * **Tarjeta 2: Hidratación / Vasos de Agua:**
     - Icono de gota 💧 y contador "6 / 8 vasos".
     - Botones interactivos `[ - ]` y `[ + ]` para sumar vasos en tiempo real.
   * **Tarjeta 3: Historial reciente de peso:**
     - Pequeña lista o tarjetas con los últimos 3 registros (ej: "Lunes: 75.0 kg", "Miércoles: 74.8 kg").

3. **Crear `ProgressFragment.kt`:**
   * Lógica para sumar/restar agua y actualizar el texto.
   * Guardar peso con Toast de confirmación ("Peso registrado: XX kg").

---

#### PARTE B: Pestaña de Perfil (`ProfileFragment.kt`)

1. **Crear Layout `app/src/main/res/layout/fragment_profile.xml`:**
   * Avatar circular grande (fondo `#212631` con inicial del usuario o icono de perfil).
   * Nombre del usuario (obtenido de `AuthRepository.getCurrentUser()?.name ?: "Andrés Pérez"`).
   * Correo del usuario (`text_secondary`).
   * Fila de 3 tarjetas estadísticas:
     - Card 1: **"Peso"** -> "74.8 kg"
     - Card 2: **"Meta"** -> "80.0 kg"
     - Card 3: **"Racha"** -> "6 días 🔥"
   * Sección de Opciones:
     - Objetivo fitness: "Hipertrofia muscular" (con chip o texto editable).
     - Nivel de experiencia: "Intermedio".
   * Botón destacado abajo:
     - `btnLogout` ("Cerrar Sesión"): Botón con borde o fondo rojo sutil (`@color/accent_red`), que limpia la sesión en `AuthRepository` y redirige a `LoginActivity`.

2. **Crear `ProfileFragment.kt`:**
   * Conectar con `AuthRepository.getCurrentUser()`.
   * En `btnLogout`, invocar `AuthRepository.logout()`, limpiar backstack y lanzar `LoginActivity`.

3. **Verificar compilación general:**
   * Ejecutar `./gradlew assembleDebug`.
