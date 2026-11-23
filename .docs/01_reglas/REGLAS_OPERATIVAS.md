# 📜 Reglas Operativas Estrictas del Proyecto ATLAS (JavaScript → APK)

Este documento constituye el reglamento permanente e inquebrantable para el desarrollo del proyecto. Debe ser consultado y respetado en cada interacción.

---

## 1. Planificación Obligatoria Previa (Cero Cambios sin Aprobación)
* **Regla:** Antes de escribir código, crear archivos, modificar configuraciones o eliminar elementos del espacio de trabajo, **siempre** se debe redactar y presentar un **Plan de Implementación** detallado y numerado.
* **Contenido del Plan:** Debe explicar con precisión cómo está planteada la idea, qué archivos se verán afectados (creados, editados o eliminados) y el paso a paso exacto de ejecución.
* **Bloqueo de Ejecución:** Ningún cambio se aplica hasta que el usuario haya revisado y aprobado explícitamente el Plan de Implementación.
* **Registro:** Una vez aprobado un plan, debe quedar almacenado en `.docs/06_planes_implementacion/`.

---

## 2. Prohibición Absoluta de Ejecutar Comandos de Git
* **Regla:** El asistente tiene **estrictamente prohibido** ejecutar comandos de `git` por su cuenta en la terminal (incluyendo comandos de consulta o modificación como `git status`, `git add`, `git commit`, `git checkout`, `git branch`, `git rm`, `git push`, etc.).
* **Procedimiento:** Cada vez que sea necesario realizar una operación de control de versiones, el asistente deberá redactar los comandos exactos en un bloque de código y entregárselos al usuario para que él los ejecute manualmente en su terminal y notifique el resultado o cualquier inconveniente.

---

## 3. Fuente Única de Verdad y Orden Documental (`.docs/`)
* **Regla:** La carpeta `.docs/` es la única fuente de verdad y documentación del proyecto, y debe mantenerse estrictamente dividida en sus **6 subcarpetas oficiales**:
  1. `.docs/01_reglas/`: Reglas operativas estrictas del proyecto.
  2. `.docs/02_idea_general/`: Documento maestro con propósito, alcance y arquitectura en JavaScript orientada al `.apk`.
  3. `.docs/03_referencia_ui_android/`: Especificación visual y estética extraída del proyecto Android original (paleta de colores, tipografía, medidas, pantallas, modales, gráficas Canvas y rutas SVG).
  4. `.docs/04_toma_de_decisiones/`: Bitácora cronológica e incremental de decisiones técnicas, avances por iteración, problemas encontrados y soluciones aplicadas.
  5. `.docs/05_tareas_pendientes/`: Tablero dividido en tres archivos: tareas realizadas (de forma simplificada), tarea activa en curso y tareas pendientes a futuro.
  6. `.docs/06_planes_implementacion/`: Almacén numerado de los Planes de Implementación.

---

## 4. Política de Compactación Periódica
* **Planes de Implementación (`.docs/06_planes_implementacion/`):** Para evitar la acumulación y desorden de archivos a lo largo del desarrollo, cada cierto tiempo —y **cuando el usuario lo indique expresamente**— los planes de implementación antiguos o ya superados deberán compactarse en un único archivo Markdown histórico (`HISTORIAL_PLANES_COMPACTADOS.md`), eliminando los archivos individuales ya consolidados.
* **Tareas Realizadas (`.docs/05_tareas_pendientes/01_TAREAS_REALIZADAS.md`):** El registro de tareas completadas debe mantenerse siempre en formato simplificado y conciso, reflejando los hitos terminados sin texto redundante.
* **Trazabilidad Continua:** Al finalizar cada Plan de Implementación aprobado, se debe actualizar la bitácora en `.docs/04_toma_de_decisiones/BITACORA_DECISIONES.md` y el estado de tareas en `.docs/05_tareas_pendientes/`.
