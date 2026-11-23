package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import com.proyecto.atlas.model.Routine
import org.json.JSONArray
import org.json.JSONObject

/**
 * Repositorio de rutinas. Las 4 rutinas base se siembran la primera vez y, desde entonces,
 * todas (base y personalizadas) se pueden editar, borrar y sobreviven al cierre de la app.
 */
object RoutineRepository {

    /** Minutos estimados por ejercicio al calcular la duración de una rutina. */
    const val MINUTES_PER_EXERCISE = 10

    private var prefs: SharedPreferences? = null
    private val routines: MutableList<Routine> = mutableListOf()

    fun init(context: Context) {
        if (prefs != null) return
        val preferences = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs = preferences

        val stored = preferences.getString(KEY_ROUTINES, null)
        if (stored == null) {
            routines.addAll(defaultRoutines())
            persist()
        } else {
            routines.addAll(parse(stored))
        }
    }

    fun getRoutines(): List<Routine> = routines.toList()

    fun getRoutineById(id: String): Routine? = routines.firstOrNull { it.id == id }

    fun addRoutine(routine: Routine) {
        routines.add(routine)
        persist()
    }

    fun updateRoutine(routine: Routine) {
        val index = routines.indexOfFirst { it.id == routine.id }
        if (index >= 0) {
            routines[index] = routine
            persist()
        }
    }

    fun deleteRoutine(id: String) {
        if (routines.removeAll { it.id == id }) persist()
    }

    fun newId(): String = "r" + System.currentTimeMillis()

    /** Duración estimada a partir de la cantidad de ejercicios. */
    fun estimateMinutes(exerciseCount: Int): Int = exerciseCount * MINUTES_PER_EXERCISE

    /**
     * Rutina sugerida para hoy: la siguiente a la última que se entrenó (rotación),
     * o la primera si todavía no hay historial.
     */
    fun suggested(): Routine? {
        if (routines.isEmpty()) return null
        val last = WorkoutLogRepository.lastTitle() ?: return routines.first()
        val index = routines.indexOfFirst { it.title == last }
        return if (index < 0) routines.first() else routines[(index + 1) % routines.size]
    }

    /** Grupos musculares que trabaja una rutina, según los ejercicios del catálogo. */
    fun groupsOf(routine: Routine): List<String> {
        val counts = LinkedHashMap<String, Int>()
        routine.exerciseNames.forEach { name ->
            ExerciseRepository.defaultExercises
                .firstOrNull { it.name.equals(name, ignoreCase = true) }
                ?.let { counts[it.muscleGroup] = (counts[it.muscleGroup] ?: 0) + 1 }
        }
        return counts.entries.sortedByDescending { it.value }.map { it.key }
    }

    /** Grupo principal (el más trabajado); null si la rutina aún no tiene ejercicios. */
    fun primaryGroup(routine: Routine): String? = groupsOf(routine).firstOrNull()

    // --- Persistencia ---

    private fun persist() {
        val array = JSONArray()
        routines.forEach { routine ->
            array.put(
                JSONObject().apply {
                    put("id", routine.id)
                    put("title", routine.title)
                    put("muscles", routine.muscleGroups)
                    put("minutes", routine.estimatedMinutes)
                    put("exercises", JSONArray(routine.exerciseNames))
                }
            )
        }
        prefs?.edit()?.putString(KEY_ROUTINES, array.toString())?.apply()
    }

    private fun parse(raw: String): List<Routine> = runCatching {
        val array = JSONArray(raw)
        (0 until array.length()).map { index ->
            val json = array.getJSONObject(index)
            val namesJson = json.optJSONArray("exercises") ?: JSONArray()
            val names = (0 until namesJson.length()).map { namesJson.getString(it) }
            Routine(
                id = json.getString("id"),
                title = json.getString("title"),
                muscleGroups = json.optString("muscles"),
                exerciseCount = names.size,
                estimatedMinutes = json.optInt("minutes", estimateMinutes(names.size)),
                exerciseNames = names
            )
        }
    }.getOrDefault(defaultRoutines())

    private fun defaultRoutines(): List<Routine> = listOf(
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

    private const val PREFS_NAME = "atlas_routine_prefs"
    private const val KEY_ROUTINES = "routines"
}
