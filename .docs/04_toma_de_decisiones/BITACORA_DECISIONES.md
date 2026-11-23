# 📓 Bitácora Cronológica de Toma de Decisiones (ATLAS JS)

Este documento registra de forma cronológica e incremental cada decisión técnica y arquitectónica tomada en el proyecto, los avances logrados en cada iteración, los problemas encontrados y sus soluciones.

---

## Iteración #01 — 22 de noviembre de 2026: Replanteamiento Arquitectónico y Fuente Única de Verdad (`.docs/`)

### 1. Contexto y Problema
El repositorio original (`ATLAS2`) contenía la versión académica desarrollada en Android Studio con Kotlin y XML. Sin embargo, compilar y probar dentro de Android Studio resulta demasiado pesado y lento en el equipo de trabajo. Se requería migrar hacia un ecosistema basado en JavaScript capaz de desarrollarse con agilidad y exportar el instalador `.apk`.

### 2. Decisiones Tomadas
* **ADR-001 (Reconstrucción Limpia desde Cero en JavaScript):** Se descartó mantener una estructura híbrida acoplada al código Kotlin existente. Del proyecto Android Studio original **únicamente se conserva la estética visual** (paleta de colores, tipografía, proporciones, distribución de pantallas, modales, gráficas e íconos SVG). Toda la arquitectura, lógica y código se construirá desde cero en un entorno limpio basado en JavaScript orientado a exportar el `.apk`.
* **ADR-002 (Extracción Estética Previa a la Limpieza):** Antes de eliminar cualquier archivo del proyecto Android original, se realizó una auditoría exhaustiva de todos los archivos `res/values/*.xml`, `res/layout/*.xml`, `res/drawable/*.xml`, `res/color/*.xml` y vistas `Canvas` en Kotlin, consolidando el 100% de los códigos hexadecimales, medidas, textos, fórmulas de gráficas y rutas SVG en `.docs/03_referencia_ui_android/`.
* **ADR-003 (Gobernanza y Fuente Única de Verdad en `.docs/`):** Se estableció la carpeta `.docs/` dividida estrictamente en 6 subcarpetas (`01_reglas`, `02_idea_general`, `03_referencia_ui_android`, `04_toma_de_decisiones`, `05_tareas_pendientes`, `06_planes_implementacion`) bajo tres reglas permanentes:
  1. Planificación obligatoria y aprobación explícita del usuario antes de crear o modificar archivos.
  2. Prohibición absoluta para el asistente de ejecutar comandos de Git por su cuenta (siempre se entregan al usuario).
  3. Política de compactación periódica de planes antiguos en `.docs/06_planes_implementacion/` cuando el usuario lo indique.

### 3. Lo que se Hizo en esta Iteración
* Lectura completa y extracción de la especificación estética del proyecto Kotlin/Android Studio.
* Creación de las 6 subcarpetas y los 10 archivos Markdown fundacionales dentro de `.docs/` (ejecución del **Plan de Implementación #1**).

### 4. Errores o Inconvenientes Encontrados
* Ninguno durante la extracción y creación documental. Todo el catálogo visual (21 vectores SVG, 3 algoritmos de gráficas Canvas, paleta de 27 tokens de color y layouts de todas las pantallas y modales) quedó respaldado sin pérdidas.

---

## Iteración #02 — 22 de noviembre de 2026: Definición Funcional Definitiva y Limpieza del Repositorio

### 1. Contexto
Con la estética ya respaldada en `.docs/03_referencia_ui_android/`, el usuario definió la funcionalidad definitiva de ATLAS para el proyecto limpio en JavaScript y aprobó eliminar el proyecto Android Studio de la rama de trabajo.

### 2. Decisiones Tomadas
* **ADR-004 (Navegación de 3 pestañas + menú de perfil):** se reemplazan las 5 pestañas originales por un header (logo ATLAS + botón de perfil con menú: Configuración de cuenta, Preferencias, Cerrar sesión) y una barra inferior con **Inicio**, **Rutinas (Bloques)** y **Dashboard**. Las 5 pestañas descritas en `03_referencia_ui_android/` quedan **solo como referencia visual** de componentes (tarjetas, tiles, gráficas, modales), no como estructura de navegación.
* **ADR-005 (Almacenamiento local híbrido):** en Android (`.apk`) la primera ejecución pide crear/elegir una carpeta local de datos; en navegador la ventana se desactiva automáticamente y se usa `localStorage`/`IndexedDB`. Un adaptador común oculta la diferencia al resto de la app.
* **ADR-006 (Registro ampliado):** Nombre (obligatorio), Apellido (opcional), Correo y Contraseña (obligatorios), Ciudad y País (opcionales por privacidad), Género (`Hombre` / `Mujer` / `Prefiero no decirlo`), Año de nacimiento y aceptación de Términos y Condiciones.
* **ADR-007 (Limpieza en rama aparte):** la eliminación del proyecto Android Studio se hace en `feat/atlas-js-clean`. `main` queda intacta con la versión académica y el tag `v1.0-kotlin-academico` como punto de restauración.

### 3. Hallazgos Técnicos Registrados (pendientes)
* **H-01 — Carpeta local en Android (SAF):** elegir una carpeta requiere el Storage Access Framework (`ACTION_OPEN_DOCUMENT_TREE`), no disponible en `@capacitor/filesystem`. Se evaluará en el **Plan #4** (plugin comunitario, plugin nativo propio o carpeta privada + exportación).
* **H-02 — Paleta para tema claro:** la referencia solo define el tema oscuro. Se diseñará y aprobará una paleta clara en el **Plan #6**.
* **H-03 — Alarma/vibración en segundo plano:** los temporizadores JS pueden pausarse con la pantalla bloqueada. Se evaluará Web Audio + `navigator.vibrate` frente a `@capacitor/haptics` y `@capacitor/local-notifications` en el **Plan #8**.

### 4. Lo que se Hizo
* Reescritura de `02_idea_general/DOCUMENTO_MAESTRO_ATLAS_JS.md` con la definición funcional v2.
* Reescritura de los 3 archivos de `05_tareas_pendientes/` con la nueva hoja de ruta (Planes #3 a #10) y los hallazgos H-01 a H-03.
* Eliminación del disco de `app/`, `gradle/`, `docs/`, `.idea/`, `.gradle/`, `.kotlin/`, `build/`, `build.gradle.kts`, `settings.gradle.kts`, `gradle.properties`, `gradlew`, `gradlew.bat`, `local.properties`, `README.md` y `.gitignore`. Quedan únicamente `.git/` y `.docs/`.

### 5. Errores o Inconvenientes
* Ninguno registrado al momento de cerrar la iteración.

---

## Iteración #03 — 22 de noviembre de 2026: Inicialización de la Base Limpia en JavaScript + Sistema de Diseño e Íconos

### 1. Contexto
Con el repositorio limpio y la definición funcional definitiva en `.docs/`, se ejecutó el **Plan de Implementación #3** para levantar la base técnica del proyecto en JavaScript.

### 2. Decisiones Tomadas
* **ADR-008 (Configuración de Vite con rutas relativas `base: "./"`):** Se configuró Vite para emitir activos con rutas relativas en `dist/`, requisito indispensable para que el `WebView` local de Capacitor en Android cargue los módulos ES y hojas de estilo sin errores de protocolo `file://` o `https://localhost`.
* **ADR-009 (Variables CSS preparadas para multi-tema `data-theme="dark"`):** Los 27 tokens de color oficiales se declararon en `:root, :root[data-theme="dark"]` en `src/styles/atlas.css`, dejando listo el punto de extensión para cuando se defina la paleta del tema claro (**H-02** en el Plan #6).
* **ADR-010 (Motor de Íconos SVG sin dependencias externas):** Los 21 íconos extraídos de Android Studio fueron encapsulados en `src/ui/icons.js` con soporte para trazos (`stroke`), rellenos (`fill`) y reglas `evenodd`, heredando el color mediante `currentColor`.

### 3. Lo que se Hizo
* Creación de `.gitignore`, `README.md`, `package.json`, `vite.config.js`, `capacitor.config.json` e `index.html`.
* Creación del sistema de diseño completo en `src/styles/atlas.css`.
* Creación del catálogo de 21 vectores en `src/ui/icons.js`.
* Creación de la guía visual interactiva de verificación en `src/main.js`.

---

## Iteración #04 — 22 de noviembre de 2026: Capa de Datos, Almacenamiento Local Híbrido (Resolución de H-01) y Servicios de Dominio

### 1. Contexto
Con la base de Vite, Capacitor y el sistema de diseño en marcha, se ejecutó el **Plan de Implementación #4** para dotar a ATLAS de su capa de datos completa en JavaScript puro.

### 2. Decisiones Tomadas y Resolución de H-01
* **ADR-011 / Resolución de H-01 (Adaptador de Almacenamiento Híbrido con `@capacitor/filesystem`):**
  * Se implementó `src/core/storage.js` detectando automáticamente si la app corre en Android nativo (`Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'`) o en navegador web.
  * En **Web (entorno de pruebas)**: `needsFolderSetup()` devuelve `false` de forma automática, desactivando el modal de carpeta y guardando todas las colecciones en `localStorage` bajo el prefijo `atlas_v2_*`.
  * En **Android (`.apk`)**: `needsFolderSetup()` devuelve `true` hasta que el usuario elija/cree su carpeta local en la ventana emergente de primera ejecución. Cada colección se escribe como un archivo `.json` independiente dentro de `Directory.Documents/<folderName>/` usando `@capacitor/filesystem`, manteniendo una caché en memoria sincronizada para lecturas síncronas instantáneas en la interfaz.
* **ADR-012 (Aislamiento por Cuenta Activa con `UserScope`):** Todas las colecciones de usuario (`preferences`, `custom_exercises`, `routine_blocks`, `workout_logs`, `daily_water`, `daily_weight`) se indexan con el sufijo `_u_${userId}` mediante `scopedKey()`, garantizando que cambiar de cuenta en el mismo dispositivo nunca mezcle datos.
* **ADR-013 (Marca "ANTERIOR" Real y Finalización Anticipada en `workoutService`):** `WorkoutService.getPreviousSetInfo(exerciseName, setNumber)` consulta el último entrenamiento real donde se realizó ese ejercicio y devuelve `"{kg} kg × {reps}"`. Además, `saveWorkoutSession()` soporta el flag `endedEarly: true` para guardar todo lo registrado cuando el usuario decide finalizar antes.

### 3. Lo que se Hizo
* Instalación de `@capacitor/filesystem` (`^6.0.0`).
* Creación de `src/core/date.js`, `src/core/storage.js` y `src/core/userScope.js`.
* Creación de `src/services/authService.js`, `src/services/preferencesService.js`, `src/services/exerciseCatalog.js`, `src/services/blockService.js`, `src/services/workoutService.js`, `src/services/dailyLogService.js` y `src/services/index.js`.
* Actualización de `src/main.js` con diagnóstico interactivo en vivo de todos los servicios.

### 4. Errores o Inconvenientes
* Ninguno; la compilación de producción (`npm run build`) empaquetó todos los servicios y `@capacitor/filesystem` sin errores.

---

## Iteración #05 — 22 de noviembre de 2026: Sistema de Modales/Toasts, Portada (Login y Registro Ampliado) y Modal de Carpeta Local

### 1. Contexto
Con la capa de datos y almacenamiento híbrido verificada, se ejecutó el **Plan de Implementación #5** para construir el sistema de modales reutilizables, el diálogo de carpeta local de primera ejecución en Android y la Portada completa de Login y Registro Ampliado.

### 2. Decisiones Tomadas
* **ADR-014 (Gestor Unificado de Modales `src/ui/modals.js`):** Se centralizaron `showDialog()` (88 % del ancho sobre backdrop oscuro), `showBottomSheet()` (hoja inferior `#161B22` con asa `40×4px`) y `showToast()` en un único módulo reutilizable sin dependencias externas.
* **ADR-015 (Modal de Carpeta Local `src/screens/FolderSetupModal.js`):** Al iniciar la aplicación se invoca `checkAndShowFolderSetupIfNeeded()`. En navegador web se omite automáticamente (`StorageEngine.needsFolderSetup() === false`), mientras que en Android (`.apk`) se despliega en la primera ejecución. Además, `openFolderSetupModal()` queda expuesto para poder invocarse en cualquier momento desde *Configuración de cuenta*.
* **ADR-016 (Portada de Autenticación con Registro Ampliado `src/screens/AuthScreen.js`):** Se implementó el flujo completo de Inicio de Sesión y Registro con todos los campos definidos (Nombre obligatorio, Apellido opcional, Correo, Contraseña con botón Ver/Ocultar, Ciudad y País opcionales en grilla de 2 columnas, chips de Género, Año de nacimiento y casilla de aceptación de Términos y Condiciones con modal de lectura local).

### 3. Lo que se Hizo
* Ampliación de `src/styles/atlas.css` con estilos de modales, animaciones y portada.
* Creación de `src/ui/modals.js`, `src/screens/FolderSetupModal.js` y `src/screens/AuthScreen.js`.
* Conexión del ciclo de sesión en `src/main.js` (Portada cuando no hay sesión activa -> Vista autenticada con diálogo de confirmación de cierre de sesión).

### 4. Errores o Inconvenientes
* Ninguno; `npm run build` compiló todos los módulos de interfaz sin errores.
