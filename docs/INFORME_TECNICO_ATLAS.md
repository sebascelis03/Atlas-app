**ATLAS - Fitness & Workout Tracker**

**Informe Técnico de Diseño, Arquitectura e Implementación de una Aplicación Móvil Android Nativa**

Andrés Esteban Sandoval Carreño

Jhoan Sebastian Celis Pabón

Zharick Nicolle Acevedo Ascanio

[Nombre de la universidad]

[Nombre de la materia]

[Nombre del docente]

19 de octubre de 2026


# Tabla de Contenido

1. Introducción y Justificación del Proyecto
2. Objetivos del Proyecto
3. Alcance y Especificación de Requerimientos
4. Arquitectura del Software y Patrones Aplicados
5. Descripción de Pantallas y Componentes
6. Guía de Instalación, Configuración y Ejecución
7. Conclusiones y Trabajo Futuro (Fase 2)

Referencias


# 1. Introducción y Justificación del Proyecto

El presente informe documenta el diseño, la arquitectura y la implementación de ATLAS - Fitness & Workout Tracker, una aplicación móvil nativa para el sistema operativo Android, desarrollada en el lenguaje Kotlin. La aplicación permite a una persona registrar sus sesiones de entrenamiento de fuerza, organizar bloques de rutinas, controlar métricas corporales básicas (peso e hidratación) y consultar indicadores de constancia como la racha de días activos y el cumplimiento de una meta semanal.

La práctica del entrenamiento con pesas requiere un registro sistemático de variables como el peso levantado, las repeticiones, las series y los tiempos de descanso. Cuando este registro se hace en papel o en notas dispersas, se pierde la trazabilidad y se dificulta aplicar el principio de sobrecarga progresiva. ATLAS responde a esa necesidad mediante una interfaz móvil que concentra en un solo lugar la planificación, la ejecución en vivo y el seguimiento del progreso.

Desde el punto de vista académico, el proyecto se justifica como un ejercicio integral de ingeniería de software móvil. En él se aplican decisiones de arquitectura (separación entre interfaz y datos mediante el patrón Repository), de seguridad (rechazo de la conexión directa a una base de datos relacional desde el cliente), de experiencia de usuario (tema oscuro, validaciones en tiempo real, principio de arranque sin datos ficticios) y de proceso (desarrollo incremental con compilaciones verificadas). El código fuente, de aproximadamente 2.250 líneas de Kotlin distribuidas en 19 archivos de producción, se encuentra versionado en un repositorio Git y acompañado de documentación técnica en la carpeta `docs/`.

La Tabla 1 resume los datos generales del proyecto.

**Tabla 1**

*Datos generales del proyecto*

| Aspecto | Descripción |
|---|---|
| Nombre | ATLAS - Fitness & Workout Tracker |
| Plataforma | Android nativo |
| Lenguaje | Kotlin |
| Identificador de aplicación | com.proyecto.atlas |
| Versión | 1.0 (versionCode 1) |
| SDK mínimo | API 24 (Android 7.0) |
| SDK de compilación y destino | API 37 (declarado en build.gradle.kts) |
| Entorno de ejecución recomendado | Emulador Android 14 (API 34) |
| Repositorio | https://github.com/sebascelis03/Atlas-app.git |
| Integrantes | Andrés Esteban Sandoval Carreño, Jhoan Sebastian Celis Pabón, Zharick Nicolle Acevedo Ascanio |

*Nota.* Elaboración propia a partir del archivo `app/build.gradle.kts` y del repositorio del proyecto.


## 1.1 Justificación arquitectónica de la persistencia y de PostgreSQL

Una de las decisiones centrales del proyecto fue no conectar la aplicación móvil directamente a un gestor relacional como PostgreSQL mediante JDBC. Esta decisión, registrada en el documento `docs/DECISIONES_Y_ARQUITECTURA.md`, se fundamenta en las razones que se exponen a continuación.

En primer lugar, existe un riesgo crítico de seguridad. Un archivo APK es un paquete distribuible que puede descompilarse con herramientas de uso público. Si la aplicación incluyera la cadena de conexión JDBC, las credenciales de la base de datos quedarían embebidas en el binario y, por tanto, expuestas a cualquier persona que obtuviera el archivo. Además, permitir que dispositivos arbitrarios se conecten a la base de datos obligaría a abrir puertos de la base de datos hacia internet, ampliando de forma innecesaria la superficie de ataque.

En segundo lugar, la práctica estándar de la industria móvil consiste en interponer una capa de servicios (una API REST o GraphQL implementada, por ejemplo, con Node.js o Spring Boot) entre el cliente y la base de datos. Dicha capa autentica a los usuarios, valida las operaciones, aplica reglas de negocio y es la única con acceso a PostgreSQL. De este modo, las credenciales de la base de datos permanecen en el servidor y el cliente solo conoce un punto de acceso público controlado.

En tercer lugar, desde el punto de vista del alcance académico, un backend en ejecución habría añadido dependencias de red y de infraestructura que no son necesarias para validar la lógica y la experiencia de la aplicación. Por ello se optó por una solución desacoplada y verificable de forma inmediata en cualquier equipo.

La solución implementada es una arquitectura basada en el patrón Repository. Los repositorios (`AuthRepository`, `MetricsRepository`, `RoutineRepository` y `ExerciseRepository`) son objetos singleton que encapsulan el acceso a los datos. La persistencia local se resuelve con `SharedPreferences` y serialización JSON mediante la biblioteca `org.json`, incluida en el SDK de Android. La clase `AtlasApp`, que extiende `Application`, inicializa los repositorios de autenticación y de métricas en el arranque del proceso, entregándoles el contexto de aplicación sin acoplarlos a ninguna `Activity`.

La proyección para la Fase 2 es directa: dado que las pantallas consumen únicamente la interfaz pública de los repositorios (por ejemplo, `login`, `register`, `updateGoals`, `updateWeight` o `getRoutines`), es posible sustituir su implementación interna por llamadas a un backend REST o GraphQL, desarrollado en Node.js o Spring Boot y respaldado por PostgreSQL, sin modificar las clases de interfaz gráfica. El propio código de `AuthRepository` documenta esta intención al indicar que, cuando exista backend, solo se reemplazará la implementación por llamadas de red.


## 1.2 Configuración del entorno de ejecución y del emulador

El proyecto declara en su configuración de Gradle un SDK mínimo de API 24, lo que garantiza compatibilidad con dispositivos desde Android 7.0, y un SDK de compilación y de destino de API 37. El entorno de ejecución adoptado por el equipo para las pruebas es Android 14 (API 34), por ser una versión estable y ampliamente desplegada.

Respecto del dispositivo virtual (AVD), el equipo decidió sustituir la imagen experimental API 37.2, que producía congelamientos de la interfaz del sistema (System UI) durante las pruebas, por la imagen "Medium Phone - Google APIs Intel x86_64 Atom System Image (API 34 / Android 14)". Esta imagen es estable, utiliza la arquitectura x86_64 y puede aprovechar la aceleración por hardware del equipo anfitrión en Windows, lo que se traduce en tiempos de arranque menores y en una ejecución fluida de la aplicación. La Tabla 2 compara ambas opciones.

**Tabla 2**

*Comparación de las imágenes de emulador evaluadas*

| Criterio | Imagen API 37.2 (descartada) | Imagen API 34 Google APIs x86_64 (adoptada) |
|---|---|---|
| Estado de la plataforma | Experimental | Estable |
| Comportamiento observado | Congelamientos de System UI | Ejecución fluida |
| Arquitectura | x86_64 | x86_64 |
| Aceleración por hardware en Windows | Disponible, pero con inestabilidad | Disponible y estable |
| Uso en el proyecto | Descartada | Entorno de pruebas oficial |

*Nota.* La decisión de reemplazo corresponde al equipo de desarrollo y se basa en las pruebas realizadas durante la construcción de la aplicación.


## 1.3 Metodología de desarrollo asistido

El desarrollo se organizó mediante una colaboración por roles, documentada en `docs/REGLAS_DE_TRABAJO.md`. El rol de Arquitectura Técnica estuvo a cargo de un asistente de diseño que analizó los requerimientos, definió los modelos de datos, mantuvo la documentación de la carpeta `docs/` y redactó cinco prompts de implementación detallados (autenticación, registro, navegación e inicio, rutinas, y registro rápido con perfil). El rol de Construcción por Componentes estuvo a cargo de un asistente de implementación que, a partir de cada prompt, generó los archivos Kotlin, los layouts XML y los recursos correspondientes. Android Studio se utilizó como entorno de visualización, ejecución y depuración.

Cada componente se construyó de forma incremental y se verificó mediante compilaciones con el Gradle Wrapper (`./gradlew assembleDebug`). El plan de pantallas registra que las cinco fases fueron completadas con la leyenda `BUILD SUCCESSFUL`, y el historial de Git refleja nueve confirmaciones con mensajes convencionales (`feat`, `fix`) que van desde el modelo de usuario y el inicio de sesión hasta la integración final del entrenamiento en vivo con las estadísticas. Esta metodología permitió detectar errores de compilación de manera temprana y mantener el código en un estado ejecutable en cada etapa.


## 1.4 Filosofía de experiencia de usuario

El diseño visual adopta un tema oscuro cuyo color de fondo es `#0E1117`, con acentos en naranja (`#FF9100`) y en verde neón (`#00E676`). La Tabla 3 presenta la paleta de colores definida en el archivo `colors.xml`.

**Tabla 3**

*Paleta de colores principal de ATLAS*

| Recurso | Valor | Uso |
|---|---|---|
| bg_dark | #0E1117 | Fondo general de la aplicación |
| surface_dark | #161B22 | Barra de navegación inferior |
| surface_card | #212631 | Tarjetas y chips |
| surface_input | #1A1F29 | Campos de texto |
| accent_orange | #FF9100 | Acentos, indicador activo y botones principales |
| primary_neon | #00E676 | Color primario, series completadas y progreso favorable |
| accent_red | #FF5252 | Mensajes de error |
| text_primary | #F0F3F6 | Texto principal |
| text_secondary | #8B949E | Texto secundario |

*Nota.* Valores tomados de `app/src/main/res/values/colors.xml`.

Se aplicó el principio de "Clean Slate" (pizarra limpia): la aplicación inicia sin datos ficticios de actividad. El contador de agua comienza en cero, el historial de pesos está vacío, y los totales de entrenamientos, la racha y la meta semanal parten de cero, de modo que cada persona configure su peso y sus metas reales desde el inicio. Cuando no existe un peso registrado, la interfaz muestra el texto "Sin registro" en lugar de un valor inventado.

Los principales puntos de interacción diseñados para reducir la fricción son un BottomSheet interactivo para editar las metas, un diálogo de confirmación para el cierre de sesión, un selector rápido de peso con pasos de 0,5 kg y un contador de hidratación libre, sin tope superior, que permite sumar o restar vasos con un solo toque.


# 2. Objetivos del Proyecto


## 2.1 Objetivo general

Desarrollar una aplicación móvil Android nativa en Kotlin, denominada ATLAS, que permita registrar y dar seguimiento a entrenamientos de fuerza, rutinas y métricas corporales básicas, aplicando una arquitectura desacoplada basada en el patrón Repository que facilite su evolución futura hacia un backend con base de datos relacional.


## 2.2 Objetivos específicos

1. Implementar los módulos de autenticación (inicio de sesión y registro) con validaciones de formato en tiempo real y persistencia local de usuarios y de la sesión activa.

2. Construir la navegación principal de la aplicación con cuatro pestañas (Inicio, Rutinas, Progreso y Perfil) y un catálogo de rutinas y ejercicios que permita crear bloques personalizados y arrancar una sesión de entrenamiento.

3. Desarrollar un motor de entrenamiento en vivo con cronómetro de sesión, registro de peso y repeticiones por serie, temporizador automático de descanso y resumen final de la sesión.

4. Registrar el progreso diario del usuario (peso corporal e hidratación) y calcular indicadores de constancia, como la racha de días y el porcentaje de la meta semanal, persistiéndolos localmente y documentando las decisiones técnicas para la evolución a una Fase 2.


# 3. Alcance y Especificación de Requerimientos


## 3.1 Alcance

El alcance de la versión 1.0 comprende una aplicación cliente de Android, ejecutable sin conexión a internet, con persistencia local. Quedan fuera de este alcance la sincronización con un servidor, la base de datos PostgreSQL, la autenticación con tokens, las notificaciones y la edición o eliminación de rutinas ya creadas. Estos elementos se describen como trabajo futuro en la sección 7.


## 3.2 Requerimientos funcionales

**Tabla 4**

*Requerimientos funcionales*

| Código | Nombre | Descripción |
|---|---|---|
| RF-01 | Autenticación | El sistema permite registrar una cuenta (nombre, correo y contraseña de al menos 6 caracteres), iniciar sesión, mantener la sesión tras cerrar la aplicación y cerrarla desde el perfil. Rechaza correos con formato inválido y correos ya registrados. |
| RF-02 | Dashboard | El sistema muestra un saludo personalizado con la fecha, la meta semanal con porcentaje y detalle (completados de la meta), la racha de días y la rutina del día con acceso directo para comenzar a entrenar. |
| RF-03 | Gestión de rutinas | El sistema lista los bloques de entrenamiento (Empuje, Tirón, Pierna y Torso Completo) con número de ejercicios, tiempo estimado y vista previa de los primeros ejercicios, y permite crear rutinas personalizadas indicando nombre y músculos principales. |
| RF-04 | Entrenamiento en vivo | El sistema ofrece un cronómetro de sesión, el registro de peso y repeticiones por serie, la adición de series y ejercicios desde un selector con búsqueda y filtro por grupo muscular, un temporizador de descanso automático al completar cada serie y un resumen final con duración, volumen y series completadas. |
| RF-05 | Progreso diario | El sistema permite ajustar y guardar el peso corporal del día, muestra la distancia al peso meta, lleva un contador de vasos de agua y presenta un historial de pesos con la variación entre registros. |
| RF-06 | Perfil | El sistema muestra los datos del usuario y sus métricas (peso, meta, racha y total de entrenamientos), permite editar el peso meta y el objetivo fitness desde un BottomSheet y ofrece un cierre de sesión con confirmación. |

*Nota.* Elaboración propia a partir del análisis del código fuente.


## 3.3 Requerimientos no funcionales

**Tabla 5**

*Requerimientos no funcionales*

| Código | Categoría | Descripción |
|---|---|---|
| RNF-01 | Usabilidad | Interfaz con tema oscuro y componentes Material Design 3, mensajes de error junto al campo afectado que se limpian al corregir, diálogos con ancho proporcional a la pantalla (88 %) y estados vacíos informativos. |
| RNF-02 | Rendimiento | Uso de `RecyclerView` para listas, ViewBinding para evitar búsquedas de vistas en tiempo de ejecución y escritura asíncrona en `SharedPreferences` mediante `apply()`, sin bloquear el hilo principal. |
| RNF-03 | Persistencia local | Los usuarios, la sesión, las métricas, el historial de pesos y los contadores sobreviven al cierre de la aplicación mediante `SharedPreferences` y JSON. |
| RNF-04 | Compatibilidad | Soporte desde Android 7.0 (API 24) con compilación contra API 37 y pruebas en Android 14 (API 34); diseño de bordes extendidos (edge-to-edge) con manejo de insets del sistema. |

*Nota.* Elaboración propia a partir de `app/build.gradle.kts` y del código fuente.


# 4. Arquitectura del Software y Patrones Aplicados


## 4.1 Modelo de navegación

La aplicación utiliza una Activity contenedora (`HomeContainerActivity`) que aloja las cuatro pestañas principales como Fragments (`HomeFragment`, `RoutinesFragment`, `ProgressFragment` y `ProfileFragment`), intercambiados mediante un `BottomNavigationView`. Alrededor de este contenedor existen Activities de propósito específico: `LoginActivity` (punto de entrada declarado en el manifiesto), `RegisterActivity` y `MainActivity`, esta última dedicada al motor de entrenamiento en vivo. Por tanto, el modelo es un contenedor único con Fragments para la navegación principal, complementado por pantallas completas para los flujos de autenticación y de entrenamiento.

Al restaurar la Activity (por ejemplo, tras una rotación), la pestaña inicial solo se selecciona cuando `savedInstanceState` es nulo, de modo que el `FragmentManager` restaure la pestaña activa. La Figura 1 muestra el flujo de navegación.

**Figura 1**

*Flujo de navegación de ATLAS*

```
LoginActivity ──(Regístrate)──> RegisterActivity
      │                               │
      └────────(éxito)────────────────┘
                      │
                      v
          HomeContainerActivity
   ┌───────────┬────────────┬────────────┬───────────┐
   │   Inicio  │  Rutinas   │  Progreso  │  Perfil   │
   └─────┬─────┴──────┬─────┴────────────┴─────┬─────┘
         │            │                        │
         └──(Comenzar / Iniciar)──> MainActivity   └──(Cerrar sesión)──> LoginActivity
                          │
                          └──(Finalizar)──> HomeContainerActivity (pestaña Inicio)
```

*Nota.* Elaboración propia a partir de `AndroidManifest.xml` y de las clases de navegación.


## 4.2 Patrón Repository y ViewBinding

El patrón Repository separa la lógica de acceso a datos de la lógica de presentación. Las pantallas no conocen cómo ni dónde se almacenan los datos; solo invocan métodos públicos de los repositorios. La Figura 2 presenta las capas del sistema y la Tabla 6 describe la responsabilidad de cada repositorio.

**Figura 2**

*Capas de la arquitectura de ATLAS (Fase 1)*

```
┌──────────────────────────────────────────────┐
│ Presentación: Activities, Fragments, Adapters │
│ (ViewBinding + Material Design 3)             │
└──────────────────────┬───────────────────────┘
                       │ invoca
┌──────────────────────v───────────────────────┐
│ Datos: AuthRepository, MetricsRepository,     │
│ RoutineRepository, ExerciseRepository         │
└──────────────────────┬───────────────────────┘
                       │ persiste
┌──────────────────────v───────────────────────┐
│ Almacenamiento local: SharedPreferences + JSON│
│ (inicializado desde AtlasApp)                 │
└──────────────────────────────────────────────┘
```

*Nota.* Elaboración propia.

**Tabla 6**

*Repositorios de la capa de datos*

| Repositorio | Responsabilidad | Persistencia |
|---|---|---|
| AuthRepository | Gestión de usuarios, inicio y cierre de sesión, registro y actualización de metas. Siembra dos usuarios de demostración en la primera ejecución. | SharedPreferences `atlas_auth_prefs` (JSON) |
| MetricsRepository | Peso actual, historial de pesos, vasos de agua, total de entrenamientos, entrenamientos de la semana y racha de días. | SharedPreferences `atlas_metrics_prefs` (valores primitivos y JSON) |
| RoutineRepository | Catálogo de cuatro rutinas predefinidas y rutinas creadas por el usuario durante la sesión. | Memoria (no persistente en la Fase 1) |
| ExerciseRepository | Catálogo estático de 29 ejercicios en seis grupos musculares y lista de filtros. | Constante en código |

*Nota.* Elaboración propia a partir de los archivos del paquete `data`.

ViewBinding se habilita en `build.gradle.kts` (`buildFeatures { viewBinding = true }`) y se usa en todas las Activities, Fragments, adaptadores y diálogos. En los Fragments se aplica la práctica recomendada de mantener una referencia opcional al binding (`_binding`) que se libera en `onDestroyView`, evitando fugas de memoria. Este enfoque ofrece seguridad de tipos en tiempo de compilación y elimina el uso de `findViewById`.


## 4.3 Modelado de datos

El modelo de datos está definido en el paquete `model` mediante clases de datos (`data class`) de Kotlin. La Tabla 7 resume las entidades principales.

**Tabla 7**

*Entidades del modelo de datos*

| Entidad | Atributos principales | Observaciones |
|---|---|---|
| User | id, name, email, password, weight, targetWeight, goal | Perfil de la persona usuaria; el objetivo puede ser Hipertrofia, Fuerza o Pérdida de Grasa. |
| Routine | id, title, muscleGroups, exerciseCount, estimatedMinutes, exerciseNames | Bloque de entrenamiento; los ejercicios se referencian por nombre contra el catálogo. |
| Exercise | id, name, muscleGroup, equipment | Elemento del catálogo de ejercicios. |
| WorkoutExercise | exercise, sets | Ejercicio incluido en la sesión en vivo, con su lista de series. |
| WorkoutSet | setNumber, previousInfo, weightKg, reps, isCompleted | Serie individual con peso, repeticiones y estado. |
| ActiveWorkout | title, startTime, workoutExercises | Sesión de entrenamiento en curso. |

*Nota.* Elaboración propia a partir de `Models.kt`, `Routine.kt` y `User.kt`.

Las métricas diarias (peso actual, historial de pesos y vasos de agua) no se modelan como una clase independiente, sino que son gestionadas directamente por `MetricsRepository`, que las expone como propiedades de solo lectura desde el exterior y las almacena en `SharedPreferences`. El historial de pesos se representa como una lista de pares (etiqueta de fecha, peso en kilogramos) serializada como un arreglo JSON.

Para la Fase 2 se proyecta una correspondencia directa entre estas entidades y las tablas de una base de datos PostgreSQL (usuarios, rutinas, ejercicios, sesiones, series y registros de métricas), expuestas mediante la capa de servicios.


## 4.4 Pila tecnológica y dependencias

**Tabla 8**

*Herramientas y dependencias del proyecto*

| Componente | Versión | Propósito |
|---|---|---|
| Android Gradle Plugin | 9.4.1 | Construcción del proyecto |
| Gradle Wrapper | 9.6.0 | Ejecución reproducible de la compilación |
| androidx.core:core-ktx | 1.19.1 | Extensiones de Kotlin para Android |
| androidx.appcompat | 1.6.1 | Compatibilidad de componentes |
| androidx.activity:activity-ktx | 1.13.0 | Soporte edge-to-edge y utilidades de Activity |
| androidx.constraintlayout | 2.1.4 | Diseño de pantallas |
| com.google.android.material | 1.10.0 | Material Design 3, BottomSheet, Chips, BottomNavigationView |
| JUnit / Espresso | 4.13.2 / 3.7.0 | Pruebas unitarias e instrumentadas |
| Compatibilidad de Java | 11 | Opciones de compilación |

*Nota.* Valores tomados de `gradle/libs.versions.toml`, `gradle-wrapper.properties` y `app/build.gradle.kts`.


# 5. Descripción de Pantallas y Componentes


## 5.1 LoginActivity y RegisterActivity

`LoginActivity` es la Activity de entrada de la aplicación. Valida que el correo no esté vacío y cumpla el formato definido por `Patterns.EMAIL_ADDRESS`, y que la contraseña no esté vacía. Los mensajes de error se muestran en el `TextInputLayout` correspondiente y se limpian automáticamente cuando el usuario modifica el campo. La verificación de credenciales se delega en `AuthRepository.login`, que compara el correo sin distinguir mayúsculas y la contraseña de forma exacta. Si el inicio de sesión es correcto, se abre `HomeContainerActivity` y se finaliza la pantalla de acceso. El enlace "¿Olvidaste tu contraseña?" muestra un mensaje indicando que la función estará disponible próximamente.

`RegisterActivity` solicita nombre, correo y contraseña. Aplica las validaciones de campo obligatorio, formato de correo y longitud mínima de contraseña de seis caracteres. El repositorio rechaza correos ya registrados, comparándolos sin distinguir mayúsculas, y en ese caso se informa en el campo de correo. Si el registro es exitoso, la sesión queda abierta y se navega al panel principal limpiando la pila de tareas (`FLAG_ACTIVITY_CLEAR_TASK`). Los nuevos usuarios se crean con un peso y un peso meta iniciales de 70 kg y el objetivo "Hipertrofia", valores que posteriormente pueden modificarse desde las pantallas de Progreso y Perfil.

Para la primera ejecución, `AuthRepository` siembra dos cuentas de demostración (`admin@atlas.com` y `usuario@atlas.com`) que permiten probar la aplicación de inmediato.


## 5.2 HomeFragment

`HomeFragment` presenta el panel de inicio. Muestra la fecha del día con formato en español de Colombia, un saludo con el nombre del usuario autenticado y un avatar con su inicial. Las estadísticas se releen en `onResume`, de modo que se actualizan al regresar de un entrenamiento.

La meta semanal se calcula a partir de la constante `META_SEMANAL` (4 entrenamientos): el porcentaje es el cociente entre los entrenamientos de la semana y la meta, multiplicado por 100 y limitado a un máximo de 100 %. La racha se calcula en `MetricsRepository.incrementWorkouts` con la siguiente regla: si el último entrenamiento fue en la misma fecha, la racha se conserva con un mínimo de uno; si fue el día anterior, se incrementa en uno; en cualquier otro caso se reinicia en uno. Así, varias sesiones el mismo día cuentan como un único día de racha.

El botón "Comenzar entrenamiento" abre `MainActivity` en modo de sesión libre, y el enlace "Ver todo" cambia a la pestaña de Rutinas. La tarjeta "Rutina de hoy" presenta una lista fija de tres ejercicios de ejemplo definida en el propio fragmento.


## 5.3 RoutinesFragment

`RoutinesFragment` muestra mediante un `RecyclerView` y `RoutineAdapter` el catálogo de bloques de entrenamiento: Día 1 Empuje (5 ejercicios, 50 minutos), Día 2 Tirón (5 ejercicios, 45 minutos), Día 3 Pierna (6 ejercicios, 60 minutos) y Día 4 Torso Completo (5 ejercicios, 55 minutos). Cada tarjeta presenta la cantidad de ejercicios, el tiempo estimado y una vista previa de los tres primeros ejercicios.

El botón "Nueva Rutina" abre un diálogo con los campos de nombre y músculos principales, ambos obligatorios. La rutina creada se agrega a la lista con cero ejercicios y se muestra de inmediato. Al iniciar una rutina, el fragmento envía a `MainActivity` el identificador, el título y los nombres de los ejercicios mediante extras del `Intent`. Las rutinas personalizadas se conservan únicamente mientras el proceso esté activo, porque `RoutineRepository` mantiene sus datos en memoria en la Fase 1.


## 5.4 MainActivity (motor de entrenamiento)

`MainActivity` implementa la sesión de entrenamiento en vivo. Al iniciarse, arranca un `Chronometer` que mide la duración total. Si recibe una rutina, resuelve cada nombre de ejercicio contra el catálogo de `ExerciseRepository` y crea, por defecto, tres series de diez repeticiones por ejercicio. Si se entra sin rutina, la sesión comienza vacía y se muestra un estado vacío para que el usuario arme su entrenamiento.

El botón de agregar ejercicio abre un BottomSheet con un campo de búsqueda y chips de filtro por grupo muscular (Todos, Pecho, Espalda, Pierna, Hombro, Brazos y Core). Al seleccionar un ejercicio, se añade a la sesión con tres series vacías. Cada serie permite editar el peso y las repeticiones, y marcarse como completada. `WorkoutExerciseAdapter` también permite agregar series, copiando el peso y las repeticiones de la última serie, y eliminar ejercicios.

Al marcar una serie como completada se inicia automáticamente un temporizador de descanso de 90 segundos, implementado con `CountDownTimer`. El usuario puede agregar 15 segundos adicionales o saltar el descanso. Al terminar el tiempo se oculta el temporizador y se muestra un aviso. Las estadísticas de la sesión se recalculan en cada cambio: el volumen total es la suma de peso por repeticiones de las series completadas, y se muestra también el conteo de series completadas sobre el total.

Al pulsar "Finalizar", se muestra un diálogo resumen con la duración, el volumen total y las series completadas. Al confirmar, `MetricsRepository.incrementWorkouts` acredita el entrenamiento en el total, en la semana y en la racha, y la aplicación regresa a la pestaña Inicio. El temporizador de descanso se cancela en `onDestroy` para evitar fugas.


## 5.5 ProgressFragment

`ProgressFragment` implementa el registro diario. La tarjeta de peso permite ajustar el valor en pasos de 0,5 kg dentro del rango de 30 a 300 kg, o escribir el peso exacto en un diálogo con teclado numérico (aceptando coma o punto decimal). El peso en edición es un borrador que se conserva ante cambios de configuración mediante `onSaveInstanceState`, y solo se persiste al pulsar "Guardar peso de hoy" o al aplicar un valor exacto. Si aún no existe un peso de partida, los botones de ajuste rápido abren directamente el diálogo, de modo que el primer valor lo escribe el usuario.

El fragmento calcula un mensaje dinámico con la distancia al peso meta (por ejemplo, "Estás a X kg de tu meta" o "¡Alcanzaste tu peso meta!", con una tolerancia de 0,05 kg). El contador de agua suma o resta vasos sin descender de cero y usa plurales de recursos para el texto. El historial presenta los registros del más reciente al más antiguo, con la variación respecto del registro previo, coloreada en verde cuando el cambio acerca al usuario a su peso meta y en naranja cuando lo aleja.


## 5.6 ProfileFragment

`ProfileFragment` muestra el avatar con la inicial, el nombre, el correo, las tarjetas de peso, meta y racha, y el total de entrenamientos completados. Al tocar la tarjeta de meta o la fila de objetivo se abre un BottomSheet de edición de metas, que valida que el peso meta esté entre 30 y 300 kg y que se haya seleccionado un objetivo entre tres chips de selección única (Hipertrofia, Fuerza y Pérdida de Grasa). Al guardar, `AuthRepository.updateGoals` actualiza al usuario y persiste el cambio.

El botón "Cerrar sesión" abre un diálogo de confirmación. Si el usuario acepta, se invoca `AuthRepository.logout`, que elimina la sesión activa conservando los usuarios registrados, y se regresa a `LoginActivity` limpiando la pila de tareas.


# 6. Guía de Instalación, Configuración y Ejecución


## 6.1 Requisitos previos

Para compilar y ejecutar el proyecto se requiere contar con Git, una versión de Android Studio compatible con el Android Gradle Plugin 9.4.1, el SDK de Android con la plataforma API 37 instalada (necesaria porque el proyecto se compila contra esa versión) y una conexión a internet en la primera sincronización, durante la cual Gradle descarga el wrapper y las dependencias. Para el emulador en Windows se recomienda habilitar la virtualización por hardware del equipo.


## 6.2 Pasos de instalación y ejecución

1. Clonar el repositorio desde una terminal:

   ```bash
   git clone https://github.com/sebascelis03/Atlas-app.git
   cd Atlas-app
   ```

2. Abrir la carpeta del proyecto en Android Studio mediante la opción *Open*.

3. Esperar a que Gradle sincronice las dependencias. Si es necesario, ejecutar *Sync Project with Gradle Files*. En caso de que el IDE indique que falta la plataforma API 37, instalarla desde *SDK Manager*.

4. Crear el dispositivo virtual en *Device Manager* mediante la opción *Create Device*: seleccionar el perfil "Medium Phone" y la imagen de sistema "Google APIs Intel x86_64 Atom System Image" de API 34 (Android 14), descargándola si no está instalada.

5. Seleccionar el dispositivo creado (o un teléfono físico con la depuración USB activada) en la barra superior de Android Studio.

6. Pulsar el botón *Run* para instalar y abrir la aplicación.

7. En la pantalla de acceso, registrar una cuenta nueva o utilizar una cuenta de demostración, como `admin@atlas.com` con la contraseña `123456`.


## 6.3 Compilación desde la línea de comandos

La compilación de verificación utilizada durante el desarrollo se ejecuta con el Gradle Wrapper, como se muestra a continuación.

```bash
# Linux y macOS
./gradlew assembleDebug

# Windows
.\gradlew.bat assembleDebug
```

El archivo APK de depuración resultante se genera en `app/build/outputs/apk/debug/`. Para ejecutar las pruebas unitarias puede utilizarse `./gradlew test`.


## 6.4 Solución de problemas frecuentes

**Tabla 9**

*Problemas frecuentes y acciones recomendadas*

| Síntoma | Causa probable | Acción recomendada |
|---|---|---|
| Error de sincronización por plataforma faltante | No está instalada la plataforma API 37 | Instalarla desde SDK Manager |
| Emulador lento o con congelamientos | Imagen experimental o virtualización deshabilitada | Usar la imagen API 34 x86_64 y habilitar la virtualización |
| Cierre inesperado al abrir una pantalla nueva | Activity no declarada en el manifiesto | Registrarla en `AndroidManifest.xml` |
| Cambios externos no reflejados en el IDE | Archivos modificados fuera de Android Studio | Ejecutar *Sync All* (Ctrl + Alt + Y) |

*Nota.* Elaboración propia a partir de `docs/REGLAS_DE_TRABAJO.md` y de la experiencia del equipo.


# 7. Conclusiones y Trabajo Futuro (Fase 2)


## 7.1 Conclusiones

El proyecto ATLAS cumplió el objetivo de construir una aplicación Android nativa funcional que integra autenticación, navegación por pestañas, gestión de rutinas, entrenamiento en vivo, registro de progreso diario y perfil de usuario, con persistencia local que sobrevive al cierre de la aplicación.

La decisión de no conectar la aplicación directamente a PostgreSQL y de adoptar el patrón Repository con almacenamiento local resultó acertada: eliminó el riesgo de exponer credenciales en el APK, permitió ejecutar la aplicación en cualquier equipo sin infraestructura adicional y dejó definida una frontera clara entre la interfaz y los datos, lo que reduce el costo de migrar a un backend.

El desarrollo incremental por roles, apoyado en prompts detallados y en compilaciones verificadas con Gradle, permitió mantener el código en un estado compilable en cada fase. La elección de una imagen de emulador estable (API 34) contribuyó a la fiabilidad de las pruebas. Finalmente, la identidad visual de tema oscuro y el principio de arranque sin datos ficticios favorecieron una experiencia coherente y honesta con el usuario.


## 7.2 Limitaciones identificadas

El análisis del código permite señalar las siguientes limitaciones de la versión 1.0, que constituyen la base del trabajo futuro.

**Tabla 10**

*Limitaciones de la versión 1.0*

| Aspecto | Limitación | Mejora propuesta |
|---|---|---|
| Seguridad | Las contraseñas se almacenan en texto plano en `SharedPreferences`. | Autenticación en servidor con contraseñas cifradas con hash y tokens de sesión. |
| Rutinas | `RoutineRepository` es volátil y las rutinas creadas no admiten agregar ejercicios. | Persistencia en Room o en el backend y editor de ejercicios por rutina. |
| Métricas | Las métricas se guardan por dispositivo y no por usuario; la meta semanal y el contador de agua no se reinician automáticamente; el historial usa la etiqueta "Hoy" en lugar de fechas. | Asociar métricas a cada usuario, reinicios por calendario e historial con fechas reales. |
| Entrenamiento | Al finalizar solo se acreditan contadores; el detalle de series, pesos y volumen no se conserva. | Guardar el historial de sesiones y mostrar las marcas "anterior" con datos reales. |
| Inicio | La "Rutina de hoy" es una lista fija de ejemplo. | Derivar la rutina del día de la planificación del usuario. |
| Pruebas | Solo existen las pruebas de ejemplo generadas por la plantilla. | Pruebas unitarias de los repositorios y pruebas de interfaz con Espresso. |
| Copias de seguridad | `allowBackup` está activo y los datos sensibles quedarían incluidos. | Excluir datos de autenticación en las reglas de respaldo. |

*Nota.* Elaboración propia a partir del análisis del código fuente.


## 7.3 Trabajo futuro (Fase 2)

La Fase 2 propone evolucionar la aplicación hacia una arquitectura cliente-servidor. Se plantea desarrollar un backend REST o GraphQL en Node.js o Spring Boot, respaldado por una base de datos PostgreSQL, que concentre la autenticación, la validación y la persistencia. En el cliente, los repositorios existentes se reimplementarían para consumir dicha API (por ejemplo, con Retrofit), conservando su interfaz pública para no alterar las pantallas, y podrían complementarse con una base de datos local Room como caché para el uso sin conexión. La Figura 3 ilustra esta evolución.

**Figura 3**

*Evolución proyectada de la arquitectura (Fase 2)*

```
Fase 1:  UI ──> Repository ──> SharedPreferences (JSON)

Fase 2:  UI ──> Repository ──> API REST/GraphQL ──> PostgreSQL
                    │             (Node.js / Spring Boot)
                    └──> Room (caché local opcional)
```

*Nota.* Elaboración propia.

Entre las funcionalidades adicionales se contemplan la sincronización entre dispositivos, el historial y las gráficas de evolución de peso y de volumen, la edición y eliminación de rutinas, las notificaciones de descanso y recordatorio de entrenamiento, y la ampliación de las pruebas automatizadas.


# Referencias

Android Developers. (s. f.). *Guide to app architecture: Data layer*. Google. https://developer.android.com/topic/architecture/data-layer

Android Developers. (s. f.). *View binding*. Google. https://developer.android.com/topic/libraries/view-binding

Android Developers. (s. f.). *Save key-value data with SharedPreferences*. Google. https://developer.android.com/training/data-storage/shared-preferences

Material Design. (s. f.). *Material Design 3*. Google. https://m3.material.io
