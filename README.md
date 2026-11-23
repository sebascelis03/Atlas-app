# 🏋️‍♂️ ATLAS - Fitness & Workout Tracker

<p align="center">
  <b>Aplicación móvil nativa en Android (Kotlin) para seguimiento de entrenamientos, control de métricas corporales y creación de rutinas.</b>
</p>

---

## 📱 Pantallas Principales

1. **🔐 Autenticación:** Inicio de sesión y registro de usuario con validaciones en tiempo real y persistencia local.
2. **🏠 Inicio:** Saludo, anillo de meta semanal con tira de la semana (L–D), mini-estadísticas (racha, volumen semanal, total), la **rutina sugerida del día** (rotación real sobre tus rutinas) y registro rápido de agua.
3. **📋 Rutinas:** Biblioteca con filtros por grupo muscular, vista previa de cada rutina, creación/edición/borrado con ejercicios del catálogo y persistencia entre sesiones.
4. **📊 Progreso:** Solo análisis: entrenamientos por día/semana (7, 30 o 90 días), volumen y tiempo, tendencia de peso, calendario de actividad, récords personales y últimas sesiones.
5. **📏 Medidas (nueva):** Peso corporal con gráfica y variación, IMC, 8 medidas de cinta (cuello, hombros, pecho, brazo, cintura, cadera, muslo, pantorrilla) con delta frente al registro anterior e historial con fechas reales.
6. **👤 Perfil:** Nivel calculado por entrenamientos, peso/meta/racha, plan (objetivo, peso meta y meta semanal editables) y cierre de sesión seguro.
7. **⏱️ Entrenamiento en vivo:** Cronómetro, descanso automático, series con kilos y reps; al terminar se guarda en el historial (duración, volumen, series y mejores pesos).

---

## 🛠️ Stack Tecnológico

* **Lenguaje:** Kotlin
* **Arquitectura:** Single Activity con navegación modular (`HomeContainerActivity` + Fragments) y ViewBinding.
* **Diseño UI:** Material Design Components 3, paleta oscura personalizada (`#0E1117`), acentos en naranja neón (`#FF9100`) y verde neón (`#00E676`).
* **Persistencia:** `SharedPreferences` + JSON (`org.json`), con datos separados por usuario: `WorkoutLogRepository` (historial), `BodyRepository` (peso y medidas), `MetricsRepository` (agua, meta semanal, nivel) y `RoutineRepository`.
* **Gráficas:** vistas propias en Canvas (`BarChartView`, `LineChartView`, `ActivityCalendarView`), sin librerías externas.
* **Navegación:** 5 pestañas (Inicio · Rutinas · Progreso · Medidas · Perfil) con fragments que se conservan (show/hide).
* **SDK:** Min SDK 24 (Android 7.0) — Target SDK 34/37.

---

## 🚀 Cómo ejecutar el proyecto

1. Clona el repositorio:
   ```bash
   git clone https://github.com/sebascelis03/Atlas-app.git
   ```
2. Abre la carpeta del proyecto en **Android Studio**.
3. Deja que Gradle sincronice las dependencias automáticamente (`Sync Project with Gradle Files`).
4. Selecciona un emulador (recomendado **Android 14 / API 34**) o conecta tu teléfono físico con depuración USB activada.
5. Haz clic en **Run (▶️)**.

---

## 📂 Documentación del Proyecto

El proyecto cuenta con especificaciones de arquitectura y registro de decisiones en la carpeta [`docs/`](docs/):
* [`DECISIONES_Y_ARQUITECTURA.md`](docs/DECISIONES_Y_ARQUITECTURA.md): Explicación del modelo de datos y decisiones técnicas.
* [`REGLAS_DE_TRABAJO.md`](docs/REGLAS_DE_TRABAJO.md): Buenas prácticas y control de versiones.
* [`PLAN_PANTALLAS.md`](docs/PLAN_PANTALLAS.md): Mapa completo de las pantallas implementadas.
