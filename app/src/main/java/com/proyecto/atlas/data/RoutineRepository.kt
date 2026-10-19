package com.proyecto.atlas.data

import com.proyecto.atlas.model.Routine

/**
 * Repositorio Mock de rutinas (Fase 1). Las rutinas viven en memoria mientras el
 * proceso de la app esté activo; las personalizadas que agregue el usuario se suman
 * a las predeterminadas durante la sesión.
 */
object RoutineRepository {

    private val routines: MutableList<Routine> = mutableListOf(
        Routine(
            id = "1",
            title = "Día 1: Empuje (Push)",
            muscleGroups = "Pecho, Hombro y Tríceps",
            exerciseCount = 5,
            estimatedMinutes = 50,
            exerciseNames = listOf(
                "Press de Banca Plano",
                "Press Inclinado con Mancuernas",
                "Press Militar con Barra",
                "Elevaciones Laterales",
                "Extensiones de Tríceps en Polea"
            )
        ),
        Routine(
            id = "2",
            title = "Día 2: Tirón (Pull)",
            muscleGroups = "Espalda y Bíceps",
            exerciseCount = 5,
            estimatedMinutes = 45,
            exerciseNames = listOf(
                "Dominadas (Pull-ups)",
                "Remo con Barra",
                "Jalón al Pecho (Lat Pulldown)",
                "Curl de Bíceps con Barra Z",
                "Curl Martillo con Mancuernas"
            )
        ),
        Routine(
            id = "3",
            title = "Día 3: Pierna (Legs)",
            muscleGroups = "Cuádriceps, Femorales y Gemelos",
            exerciseCount = 6,
            estimatedMinutes = 60,
            exerciseNames = listOf(
                "Sentadilla Trasera",
                "Prensa de Piernas 45°",
                "Extensiones de Cuádriceps",
                "Curl Femoral Tumbado",
                "Hip Thrust con Barra",
                "Elevación de Talones (Gemelos)"
            )
        ),
        Routine(
            id = "4",
            title = "Día 4: Torso Completo",
            muscleGroups = "Pectoral, Dorsales y Deltoides",
            exerciseCount = 5,
            estimatedMinutes = 55,
            exerciseNames = listOf(
                "Press de Banca Plano",
                "Remo Gironda (Polea Baja)",
                "Press Militar con Mancuernas",
                "Aperturas en Polea (Cruces)",
                "Face Pulls"
            )
        )
    )

    /** Lista de solo lectura con las rutinas disponibles. */
    fun getRoutines(): List<Routine> = routines.toList()

    /** Agrega una rutina personalizada al final de la lista. */
    fun addRoutine(routine: Routine) {
        routines.add(routine)
    }

    /** Siguiente id disponible para rutinas creadas por el usuario. */
    fun nextId(): String = (routines.size + 1).toString()
}
