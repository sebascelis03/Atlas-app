# 📋 Plan de Implementación #10: Integración de Capacitor Android y Exportación del Archivo Instalador `.apk`

* **Fecha:** 23 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/javascript-apk-port`

---

## 1. Objetivo
1. Integrar `@capacitor/android` (`^6.0.0`) y generar la plataforma nativa Android (`com.proyecto.atlas`).
2. Crear el script automatizado `scripts/build-apk.ps1` (`npm run build:apk`) que compila el bundle web con Vite, sincroniza Capacitor (`npx cap sync android`), configura el JDK de Android Studio (JBR) y el Android SDK local, ejecuta Gradle por línea de comandos (`gradlew.bat assembleDebug`) y exporta **`ATLAS-debug.apk`** en la raíz del proyecto sin necesidad de abrir Android Studio.

## 2. Archivos Creados / Modificados
* `package.json` (`+ "@capacitor/android": "^6.0.0"`, scripts `sync:android` y `build:apk`)
* `scripts/build-apk.ps1`
* `README.md`
* `android/` (generado por Capacitor CLI)
