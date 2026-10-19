package com.proyecto.atlas.model

data class Exercise(
    val id: String,
    val name: String,
    val muscleGroup: String, // Pecho, Espalda, Pierna, Hombro, Brazos, Core
    val equipment: String    // Barra, Mancuerna, Máquina, Polea, Peso Corporal
)

data class WorkoutSet(
    var setNumber: Int,
    var previousInfo: String = "-",
    var weightKg: Double = 0.0,
    var reps: Int = 0,
    var isCompleted: Boolean = false
)

data class WorkoutExercise(
    val exercise: Exercise,
    val sets: MutableList<WorkoutSet> = mutableListOf()
)

data class ActiveWorkout(
    var title: String = "Entrenamiento de Hoy",
    var startTime: Long = System.currentTimeMillis(),
    val workoutExercises: MutableList<WorkoutExercise> = mutableListOf()
)
