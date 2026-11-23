package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import com.proyecto.atlas.util.DateUtils

/**
 * Fachada de métricas para las pantallas. Todo lo que depende de fechas (racha, meta semanal,
 * total, agua de hoy) se calcula en el momento, así que se "reinicia" solo al cambiar de día
 * o de semana. Los datos están separados por usuario.
 */
object MetricsRepository {

    /** Meta semanal de entrenamientos por defecto (editable desde Perfil). */
    const val DEFAULT_WEEKLY_GOAL = 4

    /** Vasos de agua diarios recomendados. */
    const val WATER_GOAL = 8

    /** Objetivos fitness disponibles para el perfil. */
    val GOALS = listOf("Hipertrofia", "Fuerza", "Pérdida de Grasa")

    private var prefs: SharedPreferences? = null

    fun init(context: Context) {
        if (prefs != null) return
        prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    // --- Entrenamientos (derivados del historial) ---

    val totalEntrenamientos: Int get() = WorkoutLogRepository.total()
    val rachaDias: Int get() = WorkoutLogRepository.streak()
    val entrenamientosSemana: Int get() = WorkoutLogRepository.thisWeekCount()

    var metaSemanal: Int
        get() = prefs?.getInt(KEY_WEEKLY_GOAL + UserScope.id(), DEFAULT_WEEKLY_GOAL)
            ?: DEFAULT_WEEKLY_GOAL
        set(value) {
            prefs?.edit()?.putInt(KEY_WEEKLY_GOAL + UserScope.id(), value.coerceIn(1, 7))?.apply()
        }

    // --- Agua (solo cuenta el día de hoy) ---

    val vasosAgua: Int
        get() {
            val raw = prefs?.getString(KEY_WATER + UserScope.id(), null) ?: return 0
            val parts = raw.split("|")
            return if (parts.size == 2 && parts[0] == DateUtils.today()) {
                parts[1].toIntOrNull() ?: 0
            } else {
                0
            }
        }

    fun incrementWater(): Int = setWater(vasosAgua + 1)

    fun decrementWater(): Int = setWater((vasosAgua - 1).coerceAtLeast(0))

    private fun setWater(glasses: Int): Int {
        prefs?.edit()?.putString(KEY_WATER + UserScope.id(), "${DateUtils.today()}|$glasses")?.apply()
        return glasses
    }

    // --- Peso ---

    /** Último peso registrado o, si no hay, el peso con el que se creó la cuenta. */
    fun getPesoBase(): Double =
        BodyRepository.latestWeight() ?: AuthRepository.getCurrentUser()?.weight ?: 0.0

    // --- Nivel del atleta ---

    data class LevelInfo(
        val name: String,
        val workoutsInLevel: Int,
        val workoutsForNext: Int?,
        val nextName: String?
    )

    /** Nivel calculado con los entrenamientos totales. */
    fun level(): LevelInfo {
        val total = totalEntrenamientos
        val tiers = listOf(0 to "Principiante", 10 to "Intermedio", 30 to "Avanzado", 75 to "Élite")
        val currentIndex = tiers.indexOfLast { total >= it.first }
        val next = tiers.getOrNull(currentIndex + 1)
        return LevelInfo(
            name = tiers[currentIndex].second,
            workoutsInLevel = total - tiers[currentIndex].first,
            workoutsForNext = next?.let { it.first - tiers[currentIndex].first },
            nextName = next?.second
        )
    }

    private const val PREFS_NAME = "atlas_metrics_v2_prefs"
    private const val KEY_WEEKLY_GOAL = "weekly_goal_"
    private const val KEY_WATER = "water_"
}
