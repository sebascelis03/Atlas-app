# 📋 Plan de Implementación #4: Capa de Datos, Almacenamiento Local Híbrido (Resolución de H-01) y Servicios de Dominio

* **Fecha:** 22 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/atlas-js-clean`

---

## 1. Objetivo
Construir desde cero la capa de almacenamiento local híbrido (Android carpeta `.json` con `@capacitor/filesystem` vs. Web `localStorage` con desactivación automática del modal de carpeta), las utilidades de fecha local (`yyyy-MM-dd`, semana lunes-domingo, formato `es-CO`), el alcance por usuario (`userScope`) y los 6 servicios de dominio de ATLAS.

## 2. Resolución del Hallazgo H-01
* Se implementó `src/core/storage.js` con detección automática de plataforma (`Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'`).
* En **Web (navegador)**: `needsFolderSetup()` devuelve `false` automáticamente para no interrumpir las pruebas, persistiendo en `localStorage` (`atlas_v2_*`).
* En **Android (`.apk`)**: `needsFolderSetup()` devuelve `true` hasta que el usuario confirme/elija la carpeta local en la ventana emergente de primera ejecución, escribiendo y leyendo archivos `.json` reales mediante `@capacitor/filesystem` (`Directory.Documents`) sincronizados con caché en memoria.
* Incluye exportación e importación de respaldo JSON completo para el menú superior de **Configuración de cuenta**.

## 3. Archivos Creados / Modificados
* `package.json` (`+ "@capacitor/filesystem": "^6.0.0"`)
* `src/core/date.js`
* `src/core/storage.js`
* `src/core/userScope.js`
* `src/services/authService.js`
* `src/services/preferencesService.js`
* `src/services/exerciseCatalog.js`
* `src/services/blockService.js`
* `src/services/workoutService.js`
* `src/services/dailyLogService.js`
* `src/services/index.js`
* `src/main.js` (panel interactivo de diagnóstico de datos + guía de diseño)
