package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import com.proyecto.atlas.model.Lift
import com.proyecto.atlas.model.WorkoutLog
import com.proyecto.atlas.util.DateUtils
import org.json.JSONArray
import org.json.JSONObject

/**
 * Historial de entrenamientos terminados, separado por usuario. De aquí salen la racha,
 * la meta semanal, el total y todas las gráficas de Progreso: nada se reinicia a mano,
 * todo se calcula a partir de las fechas reales de cada sesión.
 */
object WorkoutLogRepository {

    private var prefs: SharedPreferences? = null
    private var loadedUser: String? = null
    private val logs: MutableList<WorkoutLog> = mutableListOf()

    fun init(context: Context) {
        if (prefs != null) return
        prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    private fun ensureLoaded() {
        val userId = UserScope.id()
        if (userId == loadedUser) return
        logs.clear()
        prefs?.getString(KEY_PREFIX + userId, null)?.let { logs.addAll(parse(it)) }
        loadedUser = userId
    }

    /** Guarda un entrenamiento terminado (el más reciente queda primero). */
    fun add(log: WorkoutLog) {
        ensureLoaded()
        logs.add(0, log)
        persist()
    }

    /** Todos los entrenamientos, del más reciente al más antiguo. */
    fun all(): List<WorkoutLog> {
        ensureLoaded()
        return logs.toList()
    }

    fun total(): Int {
        ensureLoaded()
        return logs.size
    }

    fun trainedToday(): Boolean = countOn(DateUtils.today()) > 0

    fun countOn(dateKey: String): Int {
        ensureLoaded()
        return logs.count { it.dateKey == dateKey }
    }

    /** Días distintos con al menos un entrenamiento. */
    fun daysTrained(): Set<String> {
        ensureLoaded()
        return logs.map { it.dateKey }.toSet()
    }

    /** Entrenamientos completados en la semana actual (lunes a domingo). */
    fun thisWeekCount(): Int {
        val start = DateUtils.key(DateUtils.startOfWeek())
        return all().count { it.dateKey >= start }
    }

    /** Volumen levantado (kg) en la semana actual. */
    fun thisWeekVolume(): Double {
        val start = DateUtils.key(DateUtils.startOfWeek())
        return all().filter { it.dateKey >= start }.sumOf { it.volumeKg }
    }

    /**
     * Días consecutivos entrenando. La racha sigue viva si entrenaste hoy o ayer;
     * un día completo sin entrenar la reinicia.
     */
    fun streak(): Int {
        val days = daysTrained()
        if (days.isEmpty()) return 0

        val cursor = DateUtils.daysAgo(0)
        if (DateUtils.key(cursor) !in days) {
            cursor.add(java.util.Calendar.DAY_OF_YEAR, -1)
            if (DateUtils.key(cursor) !in days) return 0
        }

        var count = 0
        while (DateUtils.key(cursor) in days) {
            count++
            cursor.add(java.util.Calendar.DAY_OF_YEAR, -1)
        }
        return count
    }

    /** Entrenamientos de los últimos `days` días (incluido hoy). */
    fun inLastDays(days: Int): List<WorkoutLog> {
        val from = DateUtils.key(DateUtils.daysAgo(days - 1))
        return all().filter { it.dateKey >= from }
    }

    /** Mejor peso histórico por ejercicio, de mayor a menor. */
    fun records(): List<Lift> {
        val best = LinkedHashMap<String, Double>()
        all().forEach { log ->
            log.lifts.forEach { lift ->
                if (lift.weightKg > (best[lift.name] ?: 0.0)) best[lift.name] = lift.weightKg
            }
        }
        return best.map { Lift(it.key, it.value) }.sortedByDescending { it.weightKg }
    }

    /** Nombre de la última rutina entrenada; sirve para sugerir la siguiente. */
    fun lastTitle(): String? = all().firstOrNull()?.title

    // --- Persistencia ---

    private fun persist() {
        val array = JSONArray()
        logs.forEach { log ->
            array.put(
                JSONObject().apply {
                    put("d", log.dateKey)
                    put("t", log.timestamp)
                    put("n", log.title)
                    put("s", log.durationSec)
                    put("v", log.volumeKg)
                    put("k", log.sets)
                    put("e", log.exercises)
                    put(
                        "l",
                        JSONArray().apply {
                            log.lifts.forEach { lift ->
                                put(JSONObject().put("n", lift.name).put("w", lift.weightKg))
                            }
                        }
                    )
                }
            )
        }
        prefs?.edit()?.putString(KEY_PREFIX + (loadedUser ?: UserScope.id()), array.toString())?.apply()
    }

    private fun parse(raw: String): List<WorkoutLog> = runCatching {
        val array = JSONArray(raw)
        (0 until array.length()).map { index ->
            val json = array.getJSONObject(index)
            val liftsJson = json.optJSONArray("l") ?: JSONArray()
            WorkoutLog(
                dateKey = json.getString("d"),
                timestamp = json.optLong("t"),
                title = json.optString("n"),
                durationSec = json.optInt("s"),
                volumeKg = json.optDouble("v", 0.0),
                sets = json.optInt("k"),
                exercises = json.optInt("e"),
                lifts = (0 until liftsJson.length()).map { i ->
                    val lift = liftsJson.getJSONObject(i)
                    Lift(lift.getString("n"), lift.getDouble("w"))
                }
            )
        }
    }.getOrDefault(emptyList())

    private const val PREFS_NAME = "atlas_workout_log_prefs"
    private const val KEY_PREFIX = "log_"
}
