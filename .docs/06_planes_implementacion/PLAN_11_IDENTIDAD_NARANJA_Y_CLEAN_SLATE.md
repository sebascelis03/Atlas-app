# 📋 Plan de Implementación #11: Identidad Monocromática Naranja (`#FF9100`), Catálogo de Ejercicios Reales, Selector de Género de 40 Opciones y Pizarra 100 % Limpia

* **Fecha:** 23 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/javascript-apk-port`

---

## 1. Objetivo
1. **Tema Oscuro Predeterminado y Paleta 100 % Anaranjada:** Mantener el tema oscuro activo por defecto y unificar todos los acentos de la interfaz a tonos anaranjados (`#FF9100` y variantes), eliminando el verde neón, el cian y otros colores secundarios en botones, barras de progreso, checks de serie completada, hidratación, bordes de foco, íconos y franjas de grupos musculares.
2. **Eliminación de Rutinas/Bloques por Defecto:** Iniciar la lista de bloques en `[]` (sin *Empuje*, *Tirón*, *Pierna* ni *Torso Completo* pre-cargados) para que el usuario cree sus propios bloques desde cero.
3. **Catálogo Base de Ejercicios Reales + Creación Personalizada:** Incorporar 50 ejercicios fundamentales reales clasificados por grupo muscular (incluyendo *Press de banca en banco plano*, *Press plano con mancuernas*, *Press militar con mancuernas*, *Press militar en máquina*, *Jalón dorsal con agarre ancho*, *Jalón dorsal unilateral*, *Jalón dorsal*, etc.), manteniendo siempre visible el botón **"+ Crear ejercicio propio"**.
4. **Cero Datos Pre-rellenados / Sin Datos Demo:** Eliminar `DEMO_USERS`, botones de autocompletado demo, pesos inventados (`70 kg` / `75 kg`) y valores pre-escritos en formularios, cambiando el prefijo de almacenamiento a `atlas_v3_`.
5. **Lista Desplegable (`<select>`) de Género con 40 Opciones:** Reemplazar los chips de género en Registro (`AuthScreen.js`) y Configuración de Cuenta (`ProfileMenuModal.js`) por un `<select>` estilizado con las 40 opciones oficiales en orden.

## 2. Archivos Modificados
* `index.html`, `vite.config.js`, `src/styles/atlas.css`
* `src/core/storage.js`
* `src/services/authService.js`, `src/services/blockService.js`, `src/services/exerciseCatalog.js`, `src/services/preferencesService.js`, `src/services/dailyLogService.js`
* `src/screens/AuthScreen.js`, `src/screens/ProfileMenuModal.js`, `src/screens/WorkoutLiveScreen.js`, `src/screens/tabs/HomeTab.js`, `src/screens/tabs/RoutinesTab.js`, `src/screens/tabs/DashboardTab.js`
* `.docs/` (actualización de documento maestro, referencia UI, bitácora y tareas)
