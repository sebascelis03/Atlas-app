# 🏋️‍♂️ ATLAS - Fitness & Workout Tracker

<p align="center">
  <b>Aplicación móvil nativa en Android (Kotlin) para seguimiento de entrenamientos, control de métricas corporales y creación de rutinas.</b>
</p>

---

## 📱 Capturas y Pantallas Principales

1. **🔐 Autenticación:** Inicio de sesión y registro de usuario con validaciones en tiempo real y persistencia local.
2. **🏠 Inicio (Dashboard):** Saludo personalizado, cálculo de meta semanal, racha de días activos y acceso directo a la rutina del día.
3. **📋 Rutinas:** Catálogo de bloques de entrenamiento (*Empuje, Tirón, Pierna, Torso*) con estimación de tiempo, previsualización de ejercicios y creador de nuevas rutinas personalizadas.
4. **⏱️ Entrenamiento en Vivo:** Cronómetro de sesión, temporizador automático de descanso entre series (con +30s y saltar), registro de kilos y repeticiones por serie, y diálogo resumen al finalizar.
5. **📊 Progreso Diario (Registro Rápido):** Ajuste de peso corporal con guardado en un solo toque, contador interactivo de vasos de agua e historial de evolución.
6. **👤 Perfil de Usuario:** Métricas del atleta (*Peso, Meta, Racha, Entrenamientos totales*), editor interactivo de metas y objetivo fitness (*Hipertrofia, Fuerza, Pérdida de Grasa*) y cierre de sesión seguro.

---

## 🛠️ Stack Tecnológico

* **Lenguaje:** Kotlin
* **Arquitectura:** Single Activity con navegación modular (`HomeContainerActivity` + Fragments) y ViewBinding.
* **Diseño UI:** Material Design Components 3, paleta oscura personalizada (`#0E1117`), acentos en naranja neón (`#FF9100`) y verde neón (`#00E676`).
* **Persistencia:** `SharedPreferences` con serialización JSON (`org.json`) gestionado por `AtlasApp` (`Application`).
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
