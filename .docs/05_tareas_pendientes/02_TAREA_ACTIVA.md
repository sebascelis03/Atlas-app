# 🎯 Tarea Activa en Curso

## Plan de Implementación #4: Capa de Datos, Almacenamiento Local Híbrido (Android Carpeta / Web) y Servicios de Dominio

* **Estado:** Pendiente de aprobación del usuario.
* **Objetivo:**
  1. Resolver el hallazgo **H-01** implementando el adaptador de almacenamiento local híbrido (`src/core/storage.js`) que distingue automáticamente entre entorno Android (`.apk`, con solicitud de carpeta local en primera ejecución y lectura/escritura JSON) y navegador web (desactivación automática del modal de carpeta y persistencia directa en `localStorage` / `IndexedDB`).
  2. Implementar utilidades de fecha (`src/core/date.js`) y aislamiento por cuenta activa (`src/core/userScope.js`).
  3. Implementar los 6 servicios de dominio limpios desde cero en `src/services/`:
     * `authService.js` (Login, Registro ampliado con todos los campos nuevos, sesión activa y cuentas demo).
     * `preferencesService.js` (Tema oscuro/claro, tiempo de descanso por defecto, sonido/vibración, ruta de carpeta local).
     * `exerciseCatalog.js` (29 ejercicios base en 6 grupos musculares + creación/persistencia de **ejercicios propios** por usuario).
     * `blockService.js` (CRUD de bloques de entrenamiento con nombre libre, sin días fijos).
     * `workoutService.js` (Historial de sesiones terminadas o finalizadas antes, cálculo de racha, volumen, récords personales).
     * `dailyLogService.js` (Registro diario de vasos de agua con reinicio por fecha y registro fechado de peso corporal).
