# 📋 Plan de Implementación #5: Sistema de Modales/Toasts, Portada (Login y Registro Ampliado) y Modal de Carpeta Local (Android)

* **Fecha:** 22 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/javascript-apk-port`

---

## 1. Objetivo
1. Implementar el gestor reutilizable de modales y notificaciones (`src/ui/modals.js`: Diálogos centrados al `88%` de ancho, BottomSheets deslizables con asa de `40×4px` y Toasts flotantes).
2. Implementar la ventana emergente de primera ejecución para elegir/crear la carpeta local de datos en Android (`src/screens/FolderSetupModal.js`), que se desactiva automáticamente en navegador web para no interrumpir las pruebas.
3. Implementar la Portada de Autenticación Local (`src/screens/AuthScreen.js`) con las vistas de Inicio de Sesión y Registro Ampliado (Nombre obligatorio, Apellido opcional, Correo, Contraseña, Ciudad y País opcionales, Género, Año de nacimiento y aceptación de Términos y Condiciones).

## 2. Archivos Creados / Modificados
* `src/styles/atlas.css` (ampliado con overlays de modales, animaciones, toasts y estilos de portada)
* `src/ui/modals.js`
* `src/screens/FolderSetupModal.js`
* `src/screens/AuthScreen.js`
* `src/main.js` (conectado al flujo real de sesión: Portada <-> Vista autenticada)
