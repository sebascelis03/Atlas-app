# 🎯 Tarea Activa en Curso

## Plan de Implementación #6: Estructura de Navegación Principal (Header con Menú de Perfil + Barra de 3 Pestañas) y Resolución de H-02 (Tema Claro)

* **Estado:** Pendiente de aprobación del usuario.
* **Objetivo:**
  1. Resolver el hallazgo **H-02** añadiendo la paleta oficial para el **Tema Claro (`:root[data-theme="light"]`)** en `src/styles/atlas.css`, conservando los acentos de marca (`#FF9100`, `#00E676`, `#00E5FF`) con fondos claros de alto contraste AA/AAA.
  2. Construir el **Menú Superior de Perfil (`src/screens/ProfileMenuModal.js`)** desplegable desde el botón de perfil en la esquina superior derecha del Header con sus 3 opciones oficiales:
     * **Configuración de cuenta:** Editar datos del usuario (Nombre, Apellido, Ciudad, País, Género, Año de nacimiento), configurar carpeta local y exportar/importar respaldo JSON.
     * **Preferencias:** Cambio de tema **Oscuro / Claro** en tiempo real, tiempo de descanso por defecto (`30s`, `60s`, `90s`, `120s`, `180s` o personalizado), activar/desactivar sonido de alarma sutil y vibración, peso meta, meta semanal y meta de agua.
     * **Cerrar sesión:** Con diálogo de confirmación.
  3. Construir el **Contenedor Principal de Navegación (`src/screens/AppShell.js`)** con el Header superior fijo, las **3 pestañas inferiores (`Inicio` · `Rutinas` · `Dashboard`)** que preservan su estado y posición de scroll al cambiar entre ellas, y conectar `src/main.js`.
