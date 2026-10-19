package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/**
 * Repositorio de métricas diarias: peso corporal e hidratación.
 * El estado se persiste en SharedPreferences, así que sobrevive al cierre de la app.
 *
 * La app arranca sin datos: el historial nace vacío y el contador de agua en cero.
 */
object MetricsRepository {

    /** Entrenamientos completados en total. Crecerá al guardar sesiones reales. */
    const val TOTAL_ENTRENAMIENTOS = 0

    /** Días consecutivos entrenando; la comparten Inicio y Perfil. */
    const val RACHA_DIAS = 0

    /** Meta semanal de entrenamientos. */
    const val META_SEMANAL = 4

    /** Entrenamientos completados esta semana. */
    const val ENTRENAMIENTOS_SEMANA = 0

    /** Objetivos fitness disponibles para el perfil. */
    val GOALS = listOf("Hipertrofia", "Fuerza", "Pérdida de Grasa")

    private var prefs: SharedPreferences? = null

    /** Último peso registrado; 0.0 significa que todavía no hay ninguno. */
    var pesoActual: Double = 0.0
        private set

    var vasosAgua: Int = 0
        private set

    private val historialPesos: MutableList<Pair<String, Double>> = mutableListOf()

    /** Lo invoca AtlasApp al arrancar. Restaura lo guardado en la sesión anterior. */
    fun init(context: Context) {
        if (prefs != null) return

        val preferences = context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs = preferences

        vasosAgua = preferences.getInt(KEY_WATER, 0)
        pesoActual = preferences.getFloat(KEY_WEIGHT, 0f).toDouble()

        preferences.getString(KEY_HISTORY, null)?.let { raw ->
            historialPesos.addAll(parseHistory(raw))
        }
    }

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

    private const val FIELD_DATE = "date"
    private const val FIELD_WEIGHT = "weight"
}
