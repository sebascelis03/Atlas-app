# 📋 Plan de Implementación #8: Pestaña 2 — Rutinas (Bloques), Creación de Ejercicios Propios y Motor de Sesión en Vivo (Resolución de H-03)

* **Fecha:** 23 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/javascript-apk-port`

---

## 1. Objetivo
1. Construir la **Pestaña 2 — Rutinas (Bloques)** (`src/screens/tabs/RoutinesTab.js`) con filtros por grupo muscular, tarjetas coloreadas según grupo principal, BottomSheet de vista previa (con eliminación de doble toque), BottomSheet de creación/edición de bloques con nombre libre (sin días fijos) y diálogo para **"Crear ejercicio propio"**.
2. Resolver el hallazgo **H-03** mediante `src/core/alarm.js` (sintetizador de alarma sonora sutil con **Web Audio API** + vibración `navigator.vibrate`, sincronizado con las preferencias del usuario y temporizadores basados en marcas de tiempo `Date.now()` resistentes a segundo plano).
3. Construir el **Motor de Sesión en Vivo (`src/screens/WorkoutLiveScreen.js`)** compatible con bloques guardados y con **"Iniciar rutina improvisada"**, incluyendo cronómetro, tabla de series con marca `ANTERIOR` real, temporizador de descanso programable con alarma sutil, cambio de ejercicio sobre la marcha, selector con buscador + crear ejercicio propio, y opción de finalizar o **finalizar antes** guardando todo lo registrado.

## 2. Archivos Creados / Modificados
* `src/core/alarm.js`
* `src/styles/atlas.css`
* `src/screens/tabs/RoutinesTab.js`
* `src/screens/WorkoutLiveScreen.js`
* `src/screens/AppShell.js`
