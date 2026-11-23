package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import com.proyecto.atlas.model.BodyEntry
import com.proyecto.atlas.model.MeasureSpec
import com.proyecto.atlas.util.DateUtils
import org.json.JSONArray
import org.json.JSONObject

/**
 * Registros corporales con fecha real (peso + medidas en cm), separados por usuario.
 * Hay a lo sumo un registro por día: guardar otra vez el mismo día lo actualiza.
 */
object BodyRepository {

    /** Medidas disponibles, en el orden en que aparecen en la pestaña Medidas. */
    val MEASURES = listOf(
        MeasureSpec("cuello", "Cuello"),
        MeasureSpec("hombros", "Hombros"),
        MeasureSpec("pecho", "Pecho"),
        MeasureSpec("brazo", "Brazo"),
        MeasureSpec("cintura", "Cintura"),
        MeasureSpec("cadera", "Cadera"),
        MeasureSpec("muslo", "Muslo"),
        MeasureSpec("pantorrilla", "Pantorrilla")
    )

    private var prefs: SharedPreferences? = null
    private var legacyPrefs: SharedPreferences? = null
    private var loadedUser: String? = null

    /** Más reciente primero. */
    private val entries: MutableList<BodyEntry> = mutableListOf()

    fun init(context: Context) {
        if (prefs != null) return
        val app = context.applicationContext
        prefs = app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        legacyPrefs = app.getSharedPreferences(LEGACY_PREFS, Context.MODE_PRIVATE)
    }

    private fun ensureLoaded() {
        val userId = UserScope.id()
        if (userId == loadedUser) return
        entries.clear()

        val stored = prefs?.getString(KEY_ENTRIES + userId, null)
        if (stored != null) {
            entries.addAll(parse(stored))
        } else {
            migrateLegacyWeight()
        }
        loadedUser = userId
    }

    /** Versiones anteriores guardaban solo "peso_actual": se conserva como registro de hoy. */
    private fun migrateLegacyWeight() {
        val legacy = legacyPrefs ?: return
        if (legacy.getBoolean(LEGACY_MIGRATED, false)) return
        val weight = legacy.getFloat(LEGACY_WEIGHT, 0f).toDouble()
        legacy.edit().putBoolean(LEGACY_MIGRATED, true).apply()
        if (weight > 0.0) {
            entries.add(BodyEntry(DateUtils.today(), weight, emptyMap()))
            persist(UserScope.id())
        }
    }

    // --- Peso ---

    fun saveWeight(weightKg: Double) {
        ensureLoaded()
        upsertToday { it.copy(weightKg = weightKg) }
    }

    /** Último peso registrado, o null si aún no hay ninguno. */
    fun latestWeight(): Double? {
        ensureLoaded()
        return entries.firstOrNull { it.weightKg != null }?.weightKg
    }

    /** Peso previo al más reciente (para mostrar la variación). */
    fun previousWeight(): Double? {
        ensureLoaded()
        return entries.filter { it.weightKg != null }.getOrNull(1)?.weightKg
    }

    /** Serie de pesos en orden cronológico (antiguo → reciente). */
    fun weightSeries(): List<Pair<String, Double>> {
        ensureLoaded()
        return entries.filter { it.weightKg != null }
            .map { it.dateKey to it.weightKg!! }
            .reversed()
    }

    // --- Medidas ---

    fun saveMeasure(key: String, cm: Double) {
        ensureLoaded()
        upsertToday { it.copy(measures = it.measures + (key to cm)) }
    }

    /** Valor más reciente de una medida y el anterior (para el delta). */
    fun measureLatestAndPrevious(key: String): Pair<Double?, Double?> {
        ensureLoaded()
        val values = entries.mapNotNull { it.measures[key] }
        return values.getOrNull(0) to values.getOrNull(1)
    }

    /** Cuántas medidas tiene anotadas el registro más reciente de cada una. */
    fun trackedMeasuresCount(): Int = MEASURES.count { measureLatestAndPrevious(it.key).first != null }

    // --- Estatura (para el IMC) ---

    fun getHeightCm(): Double? {
        val value = prefs?.getFloat(KEY_HEIGHT + UserScope.id(), 0f)?.toDouble() ?: 0.0
        return value.takeIf { it > 0.0 }
    }

    fun setHeightCm(cm: Double) {
        prefs?.edit()?.putFloat(KEY_HEIGHT + UserScope.id(), cm.toFloat())?.apply()
    }

    // --- Historial ---

    fun history(): List<BodyEntry> {
        ensureLoaded()
        return entries.toList()
    }

    private fun upsertToday(transform: (BodyEntry) -> BodyEntry) {
        val today = DateUtils.today()
        val index = entries.indexOfFirst { it.dateKey == today }
        if (index >= 0) {
            entries[index] = transform(entries[index])
        } else {
            entries.add(0, transform(BodyEntry(today, null, emptyMap())))
        }
        persist(UserScope.id())
    }

    // --- Persistencia ---

    private fun persist(userId: String) {
        val array = JSONArray()
        entries.forEach { entry ->
            array.put(
                JSONObject().apply {
                    put("d", entry.dateKey)
                    entry.weightKg?.let { put("w", it) }
                    put("m", JSONObject().apply { entry.measures.forEach { (k, v) -> put(k, v) } })
                }
            )
        }
        prefs?.edit()?.putString(KEY_ENTRIES + userId, array.toString())?.apply()
    }

    private fun parse(raw: String): List<BodyEntry> = runCatching {
        val array = JSONArray(raw)
        (0 until array.length()).map { index ->
            val json = array.getJSONObject(index)
            val measuresJson = json.optJSONObject("m") ?: JSONObject()
            val measures = measuresJson.keys().asSequence()
                .associateWith { measuresJson.getDouble(it) }
            BodyEntry(
                dateKey = json.getString("d"),
                weightKg = if (json.has("w")) json.getDouble("w") else null,
                measures = measures
            )
        }.sortedByDescending { it.dateKey }
    }.getOrDefault(emptyList())

    private const val PREFS_NAME = "atlas_body_prefs"
    private const val KEY_ENTRIES = "entries_"
    private const val KEY_HEIGHT = "height_"

    private const val LEGACY_PREFS = "atlas_metrics_prefs"
    private const val LEGACY_WEIGHT = "peso_actual"
    private const val LEGACY_MIGRATED = "peso_migrado"
}
