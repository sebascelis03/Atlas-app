# 📱 Plan de Implementación de Pantallas y Modelos Mock

A continuación se detalla la hoja de ruta para construir las 5 pantallas del proyecto **ATLAS**:

---

## 🏗️ Modelos de Datos Requeridos

### 1. `User` (Usuario)
```kotlin
data class User(
    val id: String,
    val name: String,
    val email: String,
    val password: String,
    val initialWeight: Double,
    val targetWeight: Double,
    val fitnessGoal: String // "Hipertrofia", "Fuerza", "Perdida de peso"
)
```

### 2. `DailyLog` (Registro Rápido Diario)
```kotlin
data class DailyLog(
    val date: String,
    val weightKg: Double,
    val waterGlasses: Int,
    val mood: String, // "Excelente", "Bien", "Cansado"
    val notes: String
)
```

### 3. `Routine` (Rutina Configurable)
```kotlin
data class Routine(
    val id: String,
    val title: String,
    val description: String,
    val muscleGroup: String,
    val exerciseCount: Int,
    val estimatedMinutes: Int
)
```

---

## 🚀 Estado de Avance y Prompts Listos para Claude Code

Los prompts de construcción están organizados en `docs/prompts/` y han sido completados al 100%:

| Fase | Pantalla / Módulo | Archivo de Prompt | Estado |
|---|---|---|---|
| **1** | **Login & Autenticación Mock** | [`PROMPT_01_AUTH_Y_LOGIN.md`](file:///c:/Users/HP%20INC/Desktop/ATLAS2/docs/prompts/PROMPT_01_AUTH_Y_LOGIN.md) | ✅ Completado (`BUILD SUCCESSFUL`) |
| **2** | **Registro de Usuario** | [`PROMPT_02_REGISTRO.md`](file:///c:/Users/HP%20INC/Desktop/ATLAS2/docs/prompts/PROMPT_02_REGISTRO.md) | ✅ Completado (`BUILD SUCCESSFUL`) |
| **3** | **BottomNavigation + Dashboard Inicio** | [`PROMPT_03_NAV_Y_HOME.md`](file:///c:/Users/HP%20INC/Desktop/ATLAS2/docs/prompts/PROMPT_03_NAV_Y_HOME.md) | ✅ Completado (`BUILD SUCCESSFUL`) |
| **4** | **Bloques de Rutinas** | [`PROMPT_04_RUTINAS.md`](file:///c:/Users/HP%20INC/Desktop/ATLAS2/docs/prompts/PROMPT_04_RUTINAS.md) | ✅ Completado (`BUILD SUCCESSFUL`) |
| **5** | **Registro Rápido (Progreso) & Perfil** | [`PROMPT_05_REGISTRO_RAPIDO_Y_PERFIL.md`](file:///c:/Users/HP%20INC/Desktop/ATLAS2/docs/prompts/PROMPT_05_REGISTRO_RAPIDO_Y_PERFIL.md) | ✅ Completado (`BUILD SUCCESSFUL`) |
| **Extra** | **Entrenamiento Activo en Vivo** | [MainActivity.kt](file:///c:/Users/HP%20INC/Desktop/ATLAS2/app/src/main/java/com/proyecto/atlas/MainActivity.kt) | ✅ Conectado con cronómetro y series |


