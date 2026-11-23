# 🔮 Tareas Pendientes a Futuro (Hoja de Ruta)

Estas tareas **no se tocarán** hasta completar y aprobar la tarea activa.

## 1. Hoja de ruta por planes
1. **Plan #7 — Pestaña 1: Inicio (`src/screens/tabs/HomeTab.js`):**
   * Saludo dinámico, meta semanal rápida y tira de la semana (`L-D`).
   * Acceso rápido para iniciar un bloque guardado.
   * Botón destacado **"Iniciar rutina improvisada"** (abre sesión en vivo vacía para ir agregando ejercicios sobre la marcha con el buscador).
   * Registros diarios rápidos de **vasos de agua** (`±` con barra cian) y **peso corporal** (`±0.5 kg` y diálogo de peso exacto).
2. **Plan #8 — Pestaña 2: Rutinas (Bloques) y Motor de Sesión en Vivo (Resuelve H-03):**
   * Gestión de bloques con nombre libre y sin días fijos (filtros por grupo muscular, vista previa, crear, editar, eliminar).
   * Selector de ejercicios con buscador, filtro por músculo y **"Crear ejercicio propio"**.
   * Sesión en vivo (`src/screens/WorkoutLiveScreen.js`): cronómetro, tabla de series (`SERIE`, `ANTERIOR`, `KG`, `REPS`, `✓`), **temporizador de descanso programable con alarma sutil (Web Audio API) y vibración**, **cambiar ejercicio** sobre la marcha, agregar nuevos ejercicios y **finalizar antes** guardando todo lo registrado.
3. **Plan #9 — Pestaña 3: Dashboard y Gráficas Canvas 2D:**
   * Implementación en HTML5 Canvas 2D de `BarChart`, `LineChart` y `ActivityCalendar`.
   * Panel analítico con filtros de tiempo (`7 días`, `30 días`, `90 días`), métricas de progreso, gráficas de volumen y entrenamientos, evolución del peso diario, calendario de actividad, historial detallado de sesiones y récords personales.
4. **Plan #10 — Integración de Capacitor Android y Exportación del `.apk`:**
   * Adición de la plataforma `@capacitor/android` (`com.proyecto.atlas`), configuración de recursos e íconos, script de compilación directa por terminal y verificación del archivo `.apk`.

## 2. Hallazgos técnicos
| ID | Hallazgo | Estado | Se resuelve en |
| :--- | :--- | :--- | :--- |
| **H-01** | Carpeta local en Android vs. Web | ✅ **Resuelto en Plan #4** | Plan #4 |
| **H-02** | Paleta para tema claro | Pendiente (se resuelve en la tarea activa actual) | Plan #6 |
| **H-03** | Alarma sutil y vibración en descanso | Pendiente | Plan #8 |
