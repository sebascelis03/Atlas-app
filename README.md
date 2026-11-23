# 🏋️ ATLAS — Fitness & Workout Tracker (JavaScript → APK)

Aplicación móvil de entrenamiento de fuerza, gestión de bloques de rutinas, control de hidratación, peso corporal y análisis de progreso, 100 % local, construida con **JavaScript (ES Modules), Vite, HTML5 Canvas 2D y Capacitor** para exportar un instalador **`.apk`** ágilmente sin abrir Android Studio.

> La versión académica original en Kotlin / Android Studio se conserva intacta en la rama `main` y en el tag `v1.0-kotlin-academico`.

---

## 📂 Documentación (`.docs/` — Fuente Única de Verdad)
Toda la arquitectura, reglas, referencia estética, bitácora de decisiones, tareas y planes numerados viven en [`.docs/`](.docs/):
* [`.docs/01_reglas/`](.docs/01_reglas/REGLAS_OPERATIVAS.md): Reglas operativas estrictas.
* [`.docs/02_idea_general/`](.docs/02_idea_general/DOCUMENTO_MAESTRO_ATLAS_JS.md): Definición funcional definitiva (Portada ampliada, almacenamiento híbrido, Header con menú de perfil y 3 pestañas: Inicio, Rutinas y Dashboard).
* [`.docs/03_referencia_ui_android/`](.docs/03_referencia_ui_android/01_SISTEMA_DISENO_Y_COLORES.md): Paleta de colores, tipografía, gráficas Canvas e íconos SVG extraídos del diseño original.
* [`.docs/04_toma_de_decisiones/`](.docs/04_toma_de_decisiones/BITACORA_DECISIONES.md): Bitácora cronológica de iteraciones y ADRs.
* [`.docs/05_tareas_pendientes/`](.docs/05_tareas_pendientes/01_TAREAS_REALIZADAS.md): Registro de avances.
* [`.docs/06_planes_implementacion/`](.docs/06_planes_implementacion/): Planes de implementación #1 al #10.

---

## 🚀 Comandos de Desarrollo y Exportación de `.apk`

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar entorno de pruebas instantáneo en navegador (http://localhost:5173)
npm run dev

# 3. Compilar bundle web de producción en dist/
npm run build

# 4. Sincronizar bundle web con el proyecto Android de Capacitor
npm run sync:android

# 5. Compilar y exportar directamente el instalador ATLAS-debug.apk en la raíz
npm run build:apk
```
