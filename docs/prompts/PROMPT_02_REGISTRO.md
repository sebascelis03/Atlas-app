# Prompt 2: Pantalla de Registro de Usuario (Sign Up)

**Objetivo:** Crear la pantalla de Registro (`RegisterActivity` + `activity_register.xml`) basándose fielmente en el diseño mock del equipo (fondo oscuro, acentos en naranja `@color/accent_orange`).

---

### Instrucciones para Claude Code:

Ejecuta las siguientes tareas en el proyecto Android:

1. **Crear Layout `app/src/main/res/layout/activity_register.xml`:**
   * Fondo: `@color/bg_dark`.
   * Flecha de retroceso arriba a la izquierda (`btnBack` / `ImageView` con `ic_close` o flecha) que haga `finish()`.
   * Título principal: **"Crea tu cuenta"** (`text_primary`, 28sp, bold).
   * Subtítulo: **"Empieza a registrar tu progreso hoy."** (`text_secondary`, 14sp).
   * Campos con `TextInputLayout` estilo Material (`surface_card` / `surface_input`):
     - `tilName` / `etName`: Hint "Nombre", placeholder "Tu nombre".
     - `tilEmail` / `etEmail`: Hint "Correo electrónico", placeholder "nombre@correo.com", inputType `textEmailAddress`.
     - `tilPassword` / `etPassword`: Hint "Contraseña", placeholder "••••••••", inputType `textPassword`, con `passwordToggleEnabled="true"`.
   * Texto legal: *"Al crear una cuenta aceptas los Términos y la Política de Privacidad."* (`text_muted`, 12sp).
   * Botón de acción principal:
     - `btnRegister` ("Crear cuenta"): Fondo naranja `@color/accent_orange`, texto en negrita, esquinas redondeadas (12dp).
   * Pie de pantalla interactivo:
     - "¿Ya tienes cuenta? **Inicia sesión**" (`tvGoToLogin`) con "Inicia sesión" resaltado en `@color/accent_orange`.

2. **Crear `app/src/main/java/com/proyecto/atlas/RegisterActivity.kt`:**
   * Usar `ActivityRegisterBinding`.
   * Acciones:
     - `btnBack.setOnClickListener { finish() }`
     - `tvGoToLogin.setOnClickListener { finish() }`
     - `btnRegister.setOnClickListener`:
       - Validar que los campos no estén vacíos y que la contraseña tenga al menos 6 caracteres.
       - Guardar el usuario mediante `AuthRepository.register(...)`.
       - Mostrar `Toast.makeText(this, "¡Cuenta creada con éxito! Bienvenido", Toast.LENGTH_SHORT).show()`.
       - Navegar directamente al Home / Dashboard o volver al Login con sesión iniciada.

3. **Registrar en `AndroidManifest.xml`:**
   * Declarar `RegisterActivity` con `android:exported="false"`.

4. **Verificación:**
   * Compilar con `./gradlew assembleDebug`.
