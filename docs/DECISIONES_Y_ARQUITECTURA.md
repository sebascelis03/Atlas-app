# 🏋️‍♂️ Proyecto ATLAS - Fitness & Workout Tracker

Bienvenido a la documentación oficial del proyecto **ATLAS**, una aplicación móvil Android nativa desarrollada en Kotlin para el seguimiento de rutinas de entrenamiento, registro de métricas corporales y control de progreso físico.

---

## 📌 Decisiones Arquitectónicas y Técnicas (ADR)

### 1. ¿Por qué Datos Mock en lugar de PostgreSQL directo?
* **Seguridad y buenas prácticas en Android:** En el desarrollo de aplicaciones móviles modernas, **nunca** se conecta una app de forma directa a una base de datos relacional (como PostgreSQL, MySQL o SQL Server). Conectar por JDBC expondría las credenciales de la base de datos dentro del archivo APK y requeriría abrir puertos inseguros hacia internet.
* **Flujo estándar en la industria:** Las apps móviles se comunican con una **API REST o GraphQL** intermedia (creada en Node.js, Spring Boot, FastAPI, etc.), y es dicha API la que interactúa con PostgreSQL.
* **Estrategia para el proyecto escolar:**
  * **Fase 1 (Actual):** Uso de **Repositorios Mock** (datos en memoria y `SharedPreferences` para persistencia ligera). Esto garantiza que la app funcione de inmediato en cualquier computadora o emulador sin depender de servidores encendidos ni configuraciones de red.
  * **Fase 2 (Opcional):** Si en el futuro se requiere base de datos persistente local, se integrará **Room Database (SQLite)**. Si se requiere persistencia en la nube, se consumirá un backend con **Retrofit**.

### 2. Stack Tecnológico Elegido
* **Lenguaje:** Kotlin.
* **Arquitectura de Interfaz:** Vistas XML tradicionales + **ViewBinding** (evita el uso obsoleto de `findViewById` y asegura tipado estático en vistas).
* **Componentes UI:** Material Design Components 3 (`com.google.android.material`), `RecyclerView` para listas dinámicas, `BottomSheetDialog` para selección rápida de ejercicios y `ConstraintLayout` para layouts responsivos.
* **Target SDK:** Android 14+ (SDK 34-37) con retrocompatibilidad hasta Android 7.0 (minSdk 24).

---

## 🗺️ Mapa de Pantallas del Proyecto (5 Pantallas Principales)

1. **`LoginActivity` (Inicio de Sesión):**
   * Validación de credenciales mock.
   * Enlace a registro y recuperación de contraseña simulada.
2. **`RegisterActivity` (Registro de Usuario):**
   * Creación de perfil inicial: nombre, correo, contraseña, peso inicial y objetivo fitness (Hipertrofia, Fuerza, Pérdida de peso).
3. **`QuickLogActivity` (Registro Rápido de Métricas):**
   * Registro diario de peso corporal (kg), vasos de agua consumidos y notas de energía/descanso del día.
4. **`RoutinesActivity` (Configuración de Rutinas):**
   * Lista de rutinas predefinidas y personalizadas (ej. Empuje, Tirón, Pierna).
   * Botón para iniciar la sesión de entrenamiento activo.
5. **`ProfileActivity` (Perfil y Estadísticas):**
   * Resumen del usuario, racha de entrenamientos, gráfica/historial de peso y botón de cerrar sesión.
6. **`MainActivity` (Entrenamiento en Vivo - Ya existente):**
   * Cronómetro de entrenamiento y descanso entre series, registro de series, pesos y repeticiones en tiempo real.
