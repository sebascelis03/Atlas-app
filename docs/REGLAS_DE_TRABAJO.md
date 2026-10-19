# 📋 Reglas de Trabajo y Colaboración

Este documento define las pautas para trabajar en el proyecto **ATLAS** utilizando simultáneamente **Android Studio**, **Claude Code** y asistentes de IA.

---

## 🤝 1. Flujo de Trabajo Multi-Herramienta (Antigravity + Claude Code + Android Studio)

### División de Roles
* 🧠 **Antigravity (Arquitecto / Tech Lead):**
  * Analiza requerimientos y diseña la arquitectura técnica.
  * Mantiene y actualiza la documentación en `docs/`.
  * Genera **Prompts de Implementación Detallados** listos para ser ejecutados por Claude Code.
  * Valida la calidad y consistencia del código.

* 🔨 **Claude Code (Constructor / Implementador):**
  * Recibe los prompts técnicos detallados.
  * Genera o edita los archivos Kotlin (`.kt`), layouts (`.xml`), y recursos (`drawables`, `strings`).
  * Ejecuta compilaciones en terminal con `./gradlew assembleDebug`.

* 📱 **Android Studio (Entorno de Visualización y Pruebas):**
  * Vista previa visual en modo Split/Design.
  * Ejecución y depuración en el emulador o dispositivo físico.

---

## ⚙️ 2. Reglas Técnicas de Implementación

1. **Recarga Automática:** Android Studio detecta automáticamente cuando un archivo es modificado externamente (por el asistente o por ti). Si en algún momento no se refresca de inmediato, presiona `Ctrl + Alt + Y` (Sync All) en Android Studio.
2. **Sincronización de Gradle:** Si se agregan dependencias nuevas en [build.gradle.kts](file:///c:/Users/HP%20INC/Desktop/ATLAS2/app/build.gradle.kts) o se modifican plugins, haz clic en **Sync Now** en la barra amarilla superior de Android Studio.
3. **Registro en el Manifiesto:** Cada vez que creemos una nueva `Activity`, debemos asegurarnos de que quede declarada en `AndroidManifest.xml` para evitar cierres inesperados (`ActivityNotFoundException`).
4. **Vistas e IDs:**
   * Utilizar IDs descriptivos en `camelCase` (ej. `btnIniciarSesion`, `etCorreo`, `tvTitulo`).
   * No mezclar `findViewById` con `ViewBinding`; todo nuevo código debe usar `binding.nombreDelControl`.

---

## 🐙 2. Git y GitHub vs. Docker

### ¿Se debe Dockerizar este proyecto?
❌ **No se recomienda dockerizar una app cliente de Android.**
* **¿Por qué?** Docker está diseñado para aplicaciones de servidor, microservicios y bases de datos que corren en entornos Linux homogéneos. Una aplicación móvil de Android requiere emulación gráfica acelerada por hardware (Intel HAXM / Hyper-V), interfaces gráficas táctiles y herramientas SDK de escritorio.
* En la industria móvil, **nadie usa Docker para programar el día a día de una app Android**. Docker solo se usa en servidores CI/CD corporativos avanzados para compilar APKs en la nube automáticamente.

### ¿Se puede y se debe subir a GitHub?
✅ **¡Sí, totalmente! GitHub es la forma estándar de compartir el proyecto.**
Cualquier compañero o profesor solo necesitará clonar el repositorio y abrirlo directamente en Android Studio. Gracias al archivo `gradlew` (Gradle Wrapper) incluido, Android Studio descargará todas las librerías necesarias automáticamente.

#### Pasos para subir el proyecto a GitHub:
1. Abrir terminal en la raíz del proyecto.
2. Inicializar el repositorio:
   ```bash
   git init
   git branch -M main
   ```
3. Agregar los archivos y hacer el primer commit (el archivo `.gitignore` ya está configurado para no subir archivos temporales pesados):
   ```bash
   git add .
   git commit -m "feat: estructura inicial de ATLAS con documentacion y mockup de entrenamiento"
   ```
4. Conectar con tu repositorio remoto de GitHub:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
   git push -u origin main
   ```
