package com.proyecto.atlas.data

import com.proyecto.atlas.model.Exercise

object ExerciseRepository {
    val defaultExercises: List<Exercise> = listOf(
        // Pecho
        Exercise("1", "Press de Banca Plano", "Pecho", "Barra"),
        Exercise("2", "Press Inclinado con Mancuernas", "Pecho", "Mancuerna"),
        Exercise("3", "Aperturas en Polea (Cruces)", "Pecho", "Polea"),
        Exercise("4", "Fondos en Paralelas (Dips)", "Pecho", "Peso Corporal"),
        Exercise("5", "Press en Máquina Pecho", "Pecho", "Máquina"),

        // Espalda
        Exercise("6", "Peso Muerto Convencional", "Espalda", "Barra"),
        Exercise("7", "Jalón al Pecho (Lat Pulldown)", "Espalda", "Polea"),
        Exercise("8", "Remo con Barra", "Espalda", "Barra"),
        Exercise("9", "Remo Gironda (Polea Baja)", "Espalda", "Polea"),
        Exercise("10", "Dominadas (Pull-ups)", "Espalda", "Peso Corporal"),

        // Pierna
        Exercise("11", "Sentadilla Trasera", "Pierna", "Barra"),
        Exercise("12", "Prensa de Piernas 45°", "Pierna", "Máquina"),
        Exercise("13", "Extensiones de Cuádriceps", "Pierna", "Máquina"),
        Exercise("14", "Curl Femoral Tumbado", "Pierna", "Máquina"),
        Exercise("15", "Elevación de Talones (Gemelos)", "Pierna", "Máquina"),
        Exercise("16", "Hip Thrust con Barra", "Pierna", "Barra"),

        // Hombros
        Exercise("17", "Press Militar con Barra", "Hombro", "Barra"),
        Exercise("18", "Press Militar con Mancuernas", "Hombro", "Mancuerna"),
        Exercise("19", "Elevaciones Laterales", "Hombro", "Mancuerna"),
        Exercise("20", "Pájaros (Deltoides Posterior)", "Hombro", "Mancuerna"),
        Exercise("21", "Face Pulls", "Hombro", "Polea"),

        // Brazos
        Exercise("22", "Curl de Bíceps con Barra Z", "Brazos", "Barra"),
        Exercise("23", "Curl en Banco Scott (Predicador)", "Brazos", "Máquina"),
        Exercise("24", "Curl Martillo con Mancuernas", "Brazos", "Mancuerna"),
        Exercise("25", "Extensiones de Tríceps en Polea", "Brazos", "Polea"),
        Exercise("26", "Press Francés", "Brazos", "Barra"),

        // Core
        Exercise("27", "Plancha Abdominal", "Core", "Peso Corporal"),
        Exercise("28", "Elevaciones de Piernas Colgado", "Core", "Peso Corporal"),
        Exercise("29", "Crunch en Polea Alta", "Core", "Polea")
    )

    fun getMuscleGroups(): List<String> = listOf("Todos", "Pecho", "Espalda", "Pierna", "Hombro", "Brazos", "Core")
}
