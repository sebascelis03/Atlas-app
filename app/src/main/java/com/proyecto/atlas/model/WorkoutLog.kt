package com.proyecto.atlas.model

/** Mejor peso levantado en un ejercicio durante una sesión. */
data class Lift(val name: String, val weightKg: Double)

/** Entrenamiento terminado: lo que ve la pestaña Progreso. */
data class WorkoutLog(
    val dateKey: String,
    val timestamp: Long,
    val title: String,
    val durationSec: Int,
    val volumeKg: Double,
    val sets: Int,
    val exercises: Int,
    val lifts: List<Lift> = emptyList()
)
