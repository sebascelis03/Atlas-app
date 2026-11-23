# 🏋️‍♂️ Documento Maestro: ATLAS — Fitness & Workout Tracker (JavaScript → APK)

> **Versión de la definición:** 2 (22 nov 2026) — reemplaza la definición inicial de 5 pestañas.

---

## 1. Identidad y Estética

- Se conserva el nombre **ATLAS** y toda la identidad visual extraída del proyecto Android original en `.docs/03_referencia_ui_android/`: paleta oscura (`#0E1117`, `#161B22`, `#212631`), acentos naranja `#FF9100`, verde neón `#00E676` y cian `#00E5FF`, escala tipográfica, tarjetas, chips, botones, modales, gráficas Canvas e íconos SVG.
- Las pantallas descritas en `03_referencia_ui_android/` (5 pestañas originales) son **referencia visual** de componentes; la **estructura de navegación oficial** es la definida en este documento.
- **ATLAS funciona 100 % de manera local:** sin servidores, sin cuentas en la nube y sin conexión a internet.

---

## 2. Problema que Resuelve

El proyecto nació en Android Studio con Kotlin (versión académica, conservada en `main` y en el tag `v1.0-kotlin-academico`). Android Studio resulta demasiado pesado y lento para iterar en el equipo de desarrollo, así que ATLAS se reconstruye desde cero en un entorno limpio de JavaScript que permite:

- Desarrollar y probar al instante en el navegador.
- Generar el instalador `.apk` desde la terminal (Capacitor + Android SDK/Gradle CLI) sin abrir Android Studio.

---

## 3. Autenticación Local (Portada)

### 3.1 Inicio de sesión

- Campos: **Correo** y **Contraseña**.
- Enlace a la pantalla de **Registro**.
- Las credenciales se validan contra las cuentas guardadas localmente en el dispositivo.

### 3.2 Registro

| Campo                  | Obligatoriedad        | Tipo / Validación                                                      |
| :--------------------- | :-------------------- | :--------------------------------------------------------------------- |
| Nombre                 | **Obligatorio**       | Texto no vacío                                                         |
| Apellido               | Opcional              | Texto                                                                  |
| Correo                 | **Obligatorio**       | Formato de correo válido y no registrado previamente en el dispositivo |
| Contraseña             | **Obligatorio**       | Mínimo 6 caracteres                                                    |
| Ciudad                 | Opcional (privacidad) | Texto                                                                  |
| País                   | Opcional (privacidad) | Texto o selector                                                       |
| Género                 | **Obligatorio**       | `Hombre` · `Mujer` · `Prefiero no decirlo`                             |
| Año de nacimiento      | **Obligatorio**       | Año de 4 dígitos dentro de un rango razonable                          |
| Términos y Condiciones | **Obligatorio**       | Casilla de aceptación marcada                                          |

> La obligatoriedad de Género y Año de nacimiento se tomó de la definición funcional. Puede ajustarse en el plan de la portada si se decide lo contrario.

---

## 4. Almacenamiento Local Híbrido

| Entorno                     | Comportamiento                                                                                                                                                                                   |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Android (`.apk`)**        | En la primera ejecución aparece una ventana emergente que pide **crear o elegir la carpeta local** donde se guardarán los datos de ATLAS. La app lee y escribe sus archivos JSON en esa carpeta. |
| **Navegador web (pruebas)** | La ventana se **desactiva automáticamente** (detección de plataforma o _flag_ de entorno) y los datos se guardan en `localStorage` / `IndexedDB` para no interrumpir las pruebas.                |

- Una **capa común de almacenamiento** (adaptador) expone la misma interfaz a toda la app, sin importar el entorno.
- Los datos se separan **por cuenta de usuario**.
- Ver hallazgo técnico **H-01** (Storage Access Framework) en la bitácora.

---

## 5. Estructura de Navegación

### 5.1 Header superior (presente en las 3 pestañas)

- **Izquierda:** logo **ATLAS**.
- **Derecha:** botón de perfil (avatar con inicial) que abre un **menú desplegable**:
  1. **Configuración de cuenta:** ver y editar datos del usuario; respaldo de datos y carpeta local.
  2. **Preferencias:** tema oscuro/claro, tiempo de descanso por defecto, sonido y vibración.
  3. **Cerrar sesión** (con confirmación).

### 5.2 Barra inferior de 3 pestañas

**Inicio** · **Rutinas (Bloques)** · **Dashboard**

---

## 6. Pestaña 1 — Inicio

- **Acceso rápido** para iniciar un bloque guardado.
- Botón destacado **"Iniciar rutina improvisada":** abre una sesión en vivo vacía donde se agregan ejercicios sobre la marcha con el buscador.
- **Registros diarios rápidos:**
  - **Vasos de agua** del día (se reinicia cada día).
  - **Peso corporal** del día (un registro por fecha).

---

## 7. Pestaña 2 — Rutinas (Bloques)

### 7.1 Gestión de bloques

- Bloques con **nombre libre** definido por el usuario y **sin días fijos** asociados.
- Crear, editar y eliminar bloques.
- Agregar ejercicios a un bloque:
  - Desde el **catálogo base** con buscador (y filtro por grupo muscular).
  - Con **"Crear ejercicio propio"** (nombre personalizado guardado en el catálogo del usuario).

### 7.2 Sesión en vivo (al iniciar un bloque o una rutina improvisada)

- Registro por ejercicio de **series** con **kg** y **reps**, cantidad de series y **duración** de la sesión (cronómetro).
- **Temporizador de descanso programable** (valor por defecto desde Preferencias) con **alarma sutil** al terminar.
- **Cambiar un ejercicio** por otro sobre la marcha.
- **Agregar** nuevos ejercicios durante la sesión.
- **Finalizar antes** guardando todo lo registrado hasta ese momento.
- Al finalizar se muestra un resumen (tiempo, volumen, series) y la sesión pasa al historial.

---

## 8. Pestaña 3 — Dashboard

- **Filtros de tiempo** (ej. 7, 30 y 90 días).
- **Métricas de progreso:** sesiones, volumen total, tiempo entrenado, racha.
- **Gráficas** de volumen y de entrenamientos por periodo.
- **Evolución del peso diario** (gráfica de línea).
- **Calendario de actividad.**
- **Historial detallado de sesiones** y **récords personales** por ejercicio.

---

## 9. Arquitectura Limpia en JavaScript

### 9.1 Pila tecnológica

- JavaScript moderno (ES Modules) + HTML5 + CSS3 con variables (_design tokens_ de `.docs/03_referencia_ui_android/`).
- **Vite** como servidor de desarrollo y empaquetador.
- **HTML5 Canvas 2D** para las gráficas (sin librerías externas de gráficos).
- **Capacitor** (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`) para generar el `.apk` con `appId: com.proyecto.atlas`.

### 9.2 Capas

```text
┌────────────────────────────────────────────────────────────────────┐
│ 1. PRESENTACIÓN                                                    │
│    Portada (Login / Registro) · Modal de carpeta (solo Android)    │
│    Header + menú de perfil · 3 pestañas · Sesión en vivo           │
│    Modales (BottomSheets, diálogos, toasts) · Gráficas Canvas      │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ consume
┌──────────────────────────────▼─────────────────────────────────────┐
│ 2. SERVICIOS DE DOMINIO                                            │
│    Auth (cuentas locales, sesión) · Bloques (CRUD)                 │
│    Catálogo (base + ejercicios propios) · Sesiones (historial,     │
│    racha, récords) · Registro diario (agua, peso) · Preferencias   │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ persiste por usuario
┌──────────────────────────────▼─────────────────────────────────────┐
│ 3. ALMACENAMIENTO HÍBRIDO                                          │
│    Adaptador Android (carpeta elegida, archivos JSON)              │
│    Adaptador Web (localStorage / IndexedDB) · Utilidades de fecha  │
└────────────────────────────────────────────────────────────────────┘
```

### 9.3 Principios

1. **Fidelidad estética** a `.docs/03_referencia_ui_android/`.
2. **Pizarra limpia:** ningún dato ficticio precargado; los indicadores se calculan a partir de fechas reales (`yyyy-MM-dd`).
3. **Local-first:** todo el estado vive en el dispositivo.

---

## 10. Actualización de Identidad y Datos Iniciales (Iteración #11 — 23 nov 2026)

1. **Paleta 100 % Anaranjada sobre Tema Oscuro Predeterminado:**
   * El tema oscuro (`dark`) viene activo por defecto al iniciar la aplicación.
   * Todos los acentos interactivos, botones primarios, barras de progreso (meta semanal, agua), checks de serie completada, bordes de foco, íconos y franjas de grupos musculares utilizan exclusivamente la familia anaranjada (`#FF9100`, `#FFA726`, `#FB8C00`, `rgba(255, 145, 0, 0.20)`), eliminando el verde neón y el cian.
2. **Cero Bloques Pre-cargados:**
   * La aplicación inicia con `0` bloques creados (`[]`). El usuario crea sus propios bloques con nombre libre desde cero.
3. **Catálogo Base de 50 Ejercicios Fundamentales Reales + Creación Personalizada:**
   * Incluye 50 ejercicios reales clasificados en los 6 grupos musculares con sus variantes específicas (*Press de banca en banco plano*, *Press plano con mancuernas*, *Press militar con mancuernas*, *Press militar en máquina*, *Jalón dorsal con agarre ancho*, *Jalón dorsal unilateral*, *Jalón dorsal*, etc.), además del botón permanente **"+ Crear ejercicio propio"**.
4. **Cero Datos Pre-rellenados / Sin Datos Demo:**
   * Sin usuarios demo pre-cargados, sin botones de autocompletado ficticio y sin pesos ni metas pre-rellenadas.
5. **Lista Desplegable (`<select>`) de Género con 40 Opciones:**
   * Tanto en Registro como en Configuración de Cuenta, el campo Género utiliza un `<select>` estilizado con las 40 opciones oficiales en orden.
