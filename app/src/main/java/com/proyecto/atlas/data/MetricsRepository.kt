package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.Locale

/**
 * Repositorio de métricas diarias: peso corporal e hidratación.
 * El estado se persiste en SharedPreferences, así que sobrevive al cierre de la app.
 *
 * La app arranca sin datos: el historial nace vacío y el contador de agua en cero.
 */
object MetricsRepository {

    /** Meta semanal de entrenamientos. */
    const val META_SEMANAL = 4

    /** Objetivos fitness disponibles para el perfil. */
    val GOALS = listOf("Hipertrofia", "Fuerza", "Pérdida de Grasa")

    /** Entrenamientos completados en total. */
    var totalEntrenamientos: Int = 0
        private set

    /** Días consecutivos entrenando; la comparten Inicio y Perfil. */
    var rachaDias: Int = 0
        private set

    /** Entrenamientos completados esta semana. */
    var entrenamientosSemana: Int = 0
        private set

    private var prefs: SharedPreferences? = null

    /** Último peso registrado; 0.0 significa que todavía no hay ninguno. */
    var pesoActual: Double = 0.0
        private set

    var vasosAgua: Int = 0
        private set

    private val historialPesos: MutableList<Pair<String, Double>> = mutableListOf()

    /** Fecha (yyyy-MM-dd) del último entrenamiento guardado; vacía si no hay ninguno. */
    private var ultimoEntrenamiento: String = ""

    /** Lo invoca AtlasApp al arrancar. Restaura lo guardado en la sesión anterior. */
    fun init(context: Context) {
        if (prefs != null) return

        val preferences = context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs = preferences

        vasosAgua = preferences.getInt(KEY_WATER, 0)
        pesoActual = preferences.getFloat(KEY_WEIGHT, 0f).toDouble()
        totalEntrenamientos = preferences.getInt(KEY_TOTAL_WORKOUTS, 0)
        rachaDias = preferences.getInt(KEY_STREAK, 0)
        entrenamientosSemana = preferences.getInt(KEY_WEEK_WORKOUTS, 0)
        ultimoEntrenamiento = preferences.getString(KEY_LAST_WORKOUT, "").orEmpty()

        preferences.getString(KEY_HISTORY, null)?.let { raw ->
            historialPesos.addAll(parseHistory(raw))
        }
    }

    /**
     * Registra un entrenamiento terminado: suma al total y a la semana, y actualiza
     * la racha según el calendario — varias sesiones el mismo día cuentan como un
     * solo día de racha, y un día sin entrenar la reinicia.
     */
    fun incrementWorkouts() {
        val today = todayKey()

        totalEntrenamientos++
        entrenamientosSemana++

        rachaDias = when (ultimoEntrenamiento) {
            today -> rachaDias.coerceAtLeast(1)
            yesterdayKey() -> rachaDias + 1
            else -> 1
        }
        ultimoEntrenamiento = today

        prefs?.edit()
            ?.putInt(KEY_TOTAL_WORKOUTS, totalEntrenamientos)
            ?.putInt(KEY_WEEK_WORKOUTS, entrenamientosSemana)
            ?.putInt(KEY_STREAK, rachaDias)
            ?.putString(KEY_LAST_WORKOUT, ultimoEntrenamiento)
            ?.apply()
    }

    private fun todayKey(): String = dateKey(Calendar.getInstance())

    private fun yesterdayKey(): String = dateKey(
        Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
    )

    private fun dateKey(calendar: Calendar): String = String.format(
        Locale.US,
        "%04d-%02d-%02d",
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH) + 1,
        calendar.get(Calendar.DAY_OF_MONTH)
    )

    /**
     * Peso de partida para la pantalla de Progreso: el último registrado, o el del
     * perfil del usuario autenticado si aún no ha guardado ninguno.
     */
    fun getPesoBase(): Double =
        if (pesoActual > 0.0) pesoActual else AuthRepository.getCurrentUser()?.weight ?: 0.0

    /** Registra el peso del día: actualiza el valor actual y la entrada "Hoy" del historial. */
    fun updateWeight(nuevoPeso: Double) {
        pesoActual = nuevoPeso

        val todayIndex = historialPesos.indexOfFirst { it.first == TODAY_LABEL }
        if (todayIndex >= 0) {
            historialPesos[todayIndex] = TODAY_LABEL to nuevoPeso
        } else {
            historialPesos.add(0, TODAY_LABEL to nuevoPeso)
        }

        persistWeight()
        persistHistory()
    }

    /** Suma un vaso de agua. Devuelve el total vigente. */
    fun incrementWater(): Int {
        vasosAgua++
        persistWater()
        return vasosAgua
    }

    /** Resta un vaso de agua sin bajar de cero. Devuelve el total vigente. */
    fun decrementWater(): Int {
        if (vasosAgua > 0) {
            vasosAgua--
            persistWater()
        }
        return vasosAgua
    }

    /** Historial de pesajes, del más reciente al más antiguo. */
    fun getWeightHistory(): List<Pair<String, Double>> = historialPesos.toList()

    // --- Persistencia ---

    private fun persistWater() {
        prefs?.edit()?.putInt(KEY_WATER, vasosAgua)?.apply()
    }

    private fun persistWeight() {
        prefs?.edit()?.putFloat(KEY_WEIGHT, pesoActual.toFloat())?.apply()
    }

    private fun persistHistory() {
        val array = JSONArray()
        historialPesos.forEach { (date, weightKg) ->
            array.put(
                JSONObject().apply {
                    put(FIELD_DATE, date)
                    put(FIELD_WEIGHT, weightKg)
                }
            )
        }
        prefs?.edit()?.putString(KEY_HISTORY, array.toString())?.apply()
    }

    private fun parseHistory(raw: String): List<Pair<String, Double>> = runCatching {
        val array = JSONArray(raw)
        (0 until array.length()).map { index ->
            val json = array.getJSONObject(index)
            json.getString(FIELD_DATE) to json.getDouble(FIELD_WEIGHT)
        }
    }.getOrDefault(emptyList())

    private const val TODAY_LABEL = "Hoy"

    private const val PREFS_NAME = "atlas_metrics_prefs"
    private const val KEY_WATER = "vasos_agua"
    private const val KEY_WEIGHT = "peso_actual"
    private const val KEY_HISTORY = "historial_pesos"
    private const val KEY_TOTAL_WORKOUTS = "total_entrenamientos"
    private const val KEY_WEEK_WORKOUTS = "entrenamientos_semana"
    private const val KEY_STREAK = "racha_dias"
    private const val KEY_LAST_WORKOUT = "ultimo_entrenamiento"

    private const val FIELD_DATE = "date"
    private const val FIELD_WEIGHT = "weight"
}
