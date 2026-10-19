# Prompt 1: Modelos Base, Repositorio Mock y Pantalla de Login

**Objetivo:** Implementar el modelo de usuario, repositorio de autenticación mock, y la pantalla completa de Login con diseño Material 3 oscuro y ViewBinding.

---

### Instrucciones para Claude Code:

Ejecuta las siguientes tareas en el proyecto Android:

1. **Crear Modelo de Datos `User.kt`:**
   * Ruta: `app/src/main/java/com/proyecto/atlas/model/User.kt`
   ```kotlin
   package com.proyecto.atlas.model

   data class User(
       val id: String,
       val name: String,
       val email: String,
       val password: String,
       val weight: Double,
       val targetWeight: Double,
       val goal: String
   )
   ```

2. **Crear `AuthRepository.kt` (Repositorio Mock con SharedPreferences):**
   * Ruta: `app/src/main/java/com/proyecto/atlas/data/AuthRepository.kt`
   * Debe contener usuarios mock por defecto (ej: `admin@atlas.com` / `123456`, `user@atlas.com` / `atlas2026`).
   * Métodos:
     - `login(email, password): Boolean`
     - `register(name, email, password, weight, goal): Boolean`
     - `getCurrentUser(): User?`
     - `logout()`

3. **Crear Layout `activity_login.xml`:**
   * Ruta: `app/src/main/res/layout/activity_login.xml`
   * Diseño: Fondo `@color/bg_dark`, título estilizado "ATLAS", subtítulo "Entrena sin límites".
   * Campos Material:
     - `TextInputLayout` y `TextInputEditText` para Correo (`etEmail`).
     - `TextInputLayout` y `TextInputEditText` para Contraseña (`etPassword`) con `passwordToggleEnabled="true"`.
   * Botón de Iniciar Sesión (`btnLogin`) con color `@color/primary_neon`.
   * Texto interactivo abajo: "¿No tienes una cuenta? Regístrate aquí" (`tvGoToRegister`).

4. **Crear `LoginActivity.kt`:**
   * Ruta: `app/src/main/java/com/proyecto/atlas/LoginActivity.kt`
   * Usar `ActivityLoginBinding`.
   * Validaciones de campos vacíos y formato de correo básico.
   * Si las credenciales coinciden con `AuthRepository.login(...)`, mostrar Toast de éxito y abrir `MainActivity` con `Intent`.
   * Al hacer clic en `tvGoToRegister`, abrir `RegisterActivity` (o placeholder si aún no existe).

5. **Actualizar `AndroidManifest.xml`:**
   * Declarar `LoginActivity` como la actividad de inicio (`LAUNCHER`).
   * Mantener `MainActivity` como actividad accesible vía Intent (`exported="false"`).

6. **Verificación:**
   * Ejecutar en terminal: `./gradlew assembleDebug` para certificar que compila sin errores.
