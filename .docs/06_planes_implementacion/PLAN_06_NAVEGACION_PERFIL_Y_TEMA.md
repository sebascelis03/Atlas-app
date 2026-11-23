# 📋 Plan de Implementación #6: Estructura de Navegación Principal (Header con Menú de Perfil + Barra de 3 Pestañas) y Resolución de H-02 (Tema Claro)

* **Fecha:** 23 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/javascript-apk-port`

---

## 1. Objetivo
1. Sincronizar en `.docs/` el nombre real de la rama en GitHub (`feat/javascript-apk-port`).
2. Resolver el hallazgo **H-02** añadiendo la paleta oficial para el **Tema Claro (`:root[data-theme="light"]`)** en `src/styles/atlas.css`.
3. Implementar el **Menú Superior de Perfil (`src/screens/ProfileMenuModal.js`)** con sus 3 flujos completos:
   * **Configuración de cuenta:** edición de datos personales, carpeta local y respaldo JSON (exportar/importar).
   * **Preferencias:** cambio en tiempo real de Tema Oscuro/Claro, tiempo de descanso por defecto, sonido, vibración y metas personales.
   * **Cerrar sesión:** diálogo de confirmación.
4. Implementar el contenedor principal **`src/screens/AppShell.js`** con el Header superior fijo y la barra inferior de **3 pestañas (`Inicio`, `Rutinas`, `Dashboard`)** que preserva el estado y scroll de cada pestaña.

## 2. Archivos Creados / Modificados
* `.docs/` (actualización de referencias de rama a `feat/javascript-apk-port`, bitácora y tareas)
* `src/styles/atlas.css` (paleta `:root[data-theme="light"]`, menú desplegable de perfil, interruptores y paneles de pestaña)
* `src/screens/ProfileMenuModal.js`
* `src/screens/AppShell.js`
* `src/main.js`
