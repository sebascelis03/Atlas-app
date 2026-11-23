# 🔮 Tareas Pendientes a Futuro (Hoja de Ruta)

Estas tareas **no se tocarán** hasta completar y aprobar la tarea activa.

## 1. Hoja de ruta por planes
1. **Plan #9 — Pestaña 3: Dashboard y Gráficas Canvas 2D:**
   * Implementación en HTML5 Canvas 2D de `BarChart`, `LineChart` y `ActivityCalendar` (`src/ui/charts.js`) con soporte `devicePixelRatio` y compatibilidad con Tema Oscuro y Tema Claro.
   * Panel analítico (`src/screens/tabs/DashboardTab.js`) con filtros de tiempo (`7 días`, `30 días`, `90 días`), métricas de progreso (Sesiones, Volumen, Tiempo, Racha), gráficas de volumen y entrenamientos, evolución del peso diario, calendario de actividad de 5 semanas, historial detallado de sesiones y récords personales.
2. **Plan #10 — Integración de Capacitor Android y Exportación del `.apk`:**
   * Adición de la plataforma `@capacitor/android` (`com.proyecto.atlas`), configuración de recursos e íconos, script de compilación directa por terminal y verificación del archivo `.apk` final.

## 2. Hallazgos técnicos
| ID | Hallazgo | Estado | Se resuelve en |
| :--- | :--- | :--- | :--- |
| **H-01** | Carpeta local en Android vs. Web | ✅ **Resuelto en Plan #4** | Plan #4 |
| **H-02** | Paleta para tema claro | ✅ **Resuelto en Plan #6** | Plan #6 |
| **H-03** | Alarma sutil y vibración en descanso | Pendiente (se resuelve en la tarea activa actual) | Plan #8 |
