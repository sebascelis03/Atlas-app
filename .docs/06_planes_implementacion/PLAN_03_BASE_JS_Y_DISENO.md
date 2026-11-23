# 📋 Plan de Implementación #3: Base Limpia en JavaScript + Sistema de Diseño + Íconos

* **Fecha:** 22 de noviembre de 2026
* **Estado:** ✅ Aprobado y Ejecutado
* **Rama:** `feat/atlas-js-clean`

## 1. Objetivo
Montar el esqueleto del proyecto JS en la raíz (`npm run dev` / `npm run build` funcionales) con el sistema de diseño CSS y el catálogo de íconos de `.docs/03_referencia_ui_android/`. Sin lógica de app, sin pantallas reales y sin plataforma Android todavía.

## 2. Archivos Creados
| Archivo | Propósito |
| :--- | :--- |
| `.gitignore` | Excluye `node_modules/`, `dist/`, artefactos Android, logs y `.env*` |
| `README.md` | Descripción, requisitos y comandos |
| `package.json` | Scripts `dev`, `build`, `preview`; `vite` (dev), `@capacitor/core` y `@capacitor/cli` |
| `vite.config.js` | `base: "./"`, salida `dist/`, `server.host: true` |
| `capacitor.config.json` | `appId: com.proyecto.atlas`, `appName: ATLAS`, `webDir: dist` |
| `index.html` | Shell móvil, `theme-color #0E1117`, sin fuentes remotas |
| `src/styles/atlas.css` | Tokens (tema oscuro bajo `data-theme="dark"`), tipografía, componentes y estructura |
| `src/ui/icons.js` | 21 SVG + helper `icon(name, opts)` |
| `src/main.js` | Guía de estilo temporal (se reemplaza en el Plan #5) |

## 3. Verificación
`npm install`, `npm run build` (genera `dist/`) y arranque del servidor de desarrollo.
