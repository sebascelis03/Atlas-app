# 📋 Plan de Implementación #2: Redefinición Funcional de ATLAS y Limpieza del Repositorio Antiguo

* **Fecha:** 22 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama de trabajo:** `feat/javascript-apk-port` (con `main` intacta y tag de respaldo `v1.0-kotlin-academico`)

> **Regla Permanente de Compactación:** cuando el usuario lo indique, los planes antiguos de esta carpeta se compactarán en `HISTORIAL_PLANES_COMPACTADOS.md`.

---

## 1. Objetivo
1. Actualizar `.docs/` con la definición funcional definitiva de ATLAS (portada con registro ampliado, almacenamiento local híbrido, header con menú de perfil y 3 pestañas: Inicio, Rutinas/Bloques y Dashboard).
2. Registrar los tres hallazgos técnicos pendientes (carpeta SAF en Android, paleta de tema claro y alarma/vibración en segundo plano).
3. Eliminar del disco el proyecto antiguo de Android Studio, conservando únicamente `.git/` y `.docs/`.

## 2. Archivos de `.docs/` Actualizados
* `02_idea_general/DOCUMENTO_MAESTRO_ATLAS_JS.md` (reescrito)
* `05_tareas_pendientes/01_TAREAS_REALIZADAS.md`, `02_TAREA_ACTIVA.md`, `03_TAREAS_FUTURAS.md` (reescritos)
* `04_toma_de_decisiones/BITACORA_DECISIONES.md` (Iteración #02 con ADR-004 a ADR-007 y hallazgos H-01 a H-03)
* `06_planes_implementacion/PLAN_02_REDEFINICION_Y_LIMPIEZA.md` (este archivo)
* `03_referencia_ui_android/` sin cambios.

## 3. Elementos Eliminados del Disco
| Elemento | ¿Seguido por Git? |
| :--- | :--- |
| `app/`, `gradle/`, `docs/` | Sí |
| `build.gradle.kts`, `settings.gradle.kts`, `gradle.properties`, `gradlew`, `gradlew.bat`, `README.md`, `.gitignore` | Sí |
| `.idea/` | En parte |
| `.gradle/`, `.kotlin/`, `build/`, `local.properties` | No (cachés / ignorados) |

La eliminación se hizo con `Remove-Item` (sistema de archivos). El registro en Git lo ejecuta el usuario manualmente (`git add -A` + `git commit`).

## 4. Recuperación de la Versión Académica
`git checkout main` o `git checkout v1.0-kotlin-academico`.
