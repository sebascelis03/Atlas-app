# 📋 Plan de Implementación #7: Pestaña 1 — Inicio (`src/screens/tabs/HomeTab.js`)

* **Fecha:** 23 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/javascript-apk-port`

---

## 1. Objetivo
Construir la vista completa de la **Pestaña 1 — Inicio** en `src/screens/tabs/HomeTab.js` e integrarla en `src/screens/AppShell.js`, incluyendo:
1. Saludo con fecha en español, anillo circular SVG de Meta Semanal (`76×76px`), tira de la semana (`L–D`) y fila de 3 mini-estadísticas (Racha, Volumen semanal, Entrenamientos).
2. Tarjeta y botón destacado **"Iniciar rutina improvisada"** para comenzar una sesión en vivo vacía y agregar ejercicios sobre la marcha.
3. **Acceso rápido a bloques guardados** con rotación sugerida automática, chips para previsualizar cualquier bloque guardado, lista de ejercicios y botón **"Iniciar bloque"**.
4. **Registros diarios rápidos:**
   * **Peso corporal:** ajuste instantáneo `±0.5 kg`, diálogo numérico exacto al tocar el valor (`30–300 kg`), badge de delta coloreado según cercanía al peso meta y mensaje dinámico de distancia a la meta.
   * **Vasos de agua:** contador diario con reinicio por fecha, botones `−` / `+` y barra de progreso cian.

## 2. Archivos Creados / Modificados
* `src/styles/atlas.css` (anillo circular `.goal-ring`, tira semanal `.week-strip`, tarjeta de rutina improvisada `.card-improvised` y filas de ejercicio)
* `src/screens/tabs/HomeTab.js`
* `src/screens/AppShell.js`
