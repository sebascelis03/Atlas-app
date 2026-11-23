# 🔮 Tareas Pendientes a Futuro (Hoja de Ruta)

Estas tareas **no se tocarán** hasta completar y aprobar la tarea activa.

## 1. Hoja de ruta por planes
1. **Plan #4 — Capa de datos y almacenamiento híbrido:** adaptador común (Android-carpeta / Web-localStorage/IndexedDB), separación por usuario, utilidades de fecha y servicios de dominio (Auth, Bloques, Catálogo + ejercicios propios, Sesiones, Registro diario, Preferencias). **Resuelve H-01.**
2. **Plan #5 — Portada:** Login y Registro ampliado (Nombre, Apellido, Correo, Contraseña, Ciudad, País, Género, Año de nacimiento, Términos) y modal de primera ejecución para elegir la carpeta (solo Android).
3. **Plan #6 — Estructura de navegación:** Header con logo y menú de perfil (Configuración de cuenta, Preferencias, Cerrar sesión) y barra inferior de 3 pestañas. **Resuelve H-02** (tema claro).
4. **Plan #7 — Pestaña Inicio:** acceso rápido a bloques, "Iniciar rutina improvisada", registro de agua y de peso del día.
5. **Plan #8 — Pestaña Rutinas (Bloques) y Sesión en vivo:** CRUD de bloques, catálogo con buscador, "Crear ejercicio propio", series (kg, reps, cantidad, duración), descanso programable con alarma sutil, cambiar ejercicio, agregar y finalizar antes. **Resuelve H-03.**
6. **Plan #9 — Dashboard:** filtros de tiempo, métricas, gráficas Canvas (barras, línea, calendario), historial de sesiones y récords.
7. **Plan #10 — Exportación `.apk`:** plataforma Android de Capacitor, íconos de la app, script de compilación por terminal y prueba del instalador.

## 2. Hallazgos técnicos pendientes
| ID | Hallazgo | Detalle | Se resuelve en |
| :--- | :--- | :--- | :--- |
| **H-01** | Carpeta local en Android (SAF) | Desde Android 10 rige el *scoped storage*. Para que el usuario elija una carpeta hay que usar el Storage Access Framework (`ACTION_OPEN_DOCUMENT_TREE`), que `@capacitor/filesystem` no ofrece. Opciones: plugin comunitario o plugin nativo propio pequeño; alternativa de respaldo: carpeta privada de la app + exportación manual. | Plan #4 |
| **H-02** | Paleta para tema claro | `.docs/03_referencia_ui_android/` solo define la paleta oscura. Hay que diseñar y aprobar una paleta clara equivalente (fondos, superficies, textos, contraste AA) antes de implementar la preferencia de tema. | Plan #6 |
| **H-03** | Alarma y vibración en segundo plano | Si la app pasa a segundo plano o se bloquea la pantalla durante el descanso, los temporizadores JS pueden pausarse. Evaluar Web Audio + `navigator.vibrate` frente a `@capacitor/haptics` y `@capacitor/local-notifications` (notificación programada al terminar el descanso). | Plan #8 |
