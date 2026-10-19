package com.proyecto.atlas.data

/**
 * Repositorio Mock de métricas diarias (Fase 1): peso corporal e hidratación.
 * El estado vive en memoria mientras el proceso de la app esté activo.
 */
object MetricsRepository {

    const val WATER_GOAL = 8

    /** Racha mock de días consecutivos entrenando; la comparten Inicio y Perfil. */
    const val RACHA_DIAS = 6

    /** Entrenamientos completados en total (mock). */
    const val TOTAL_ENTRENAMIENTOS = 14

    /** Objetivos fitness disponibles para el perfil. */
    val GOALS = listOf("Hipertrofia", "Fuerza", "Pérdida de Grasa")

    var pesoActual: Double = 74.8
        private set

    var vasosAgua: Int = 6
        private set

    private val historialPesos: MutableList<Pair<String, Double>> = mutableListOf(
        "Hoy" to 74.8,
        "Ayer" to 75.0,
        "15 Oct" to 75.3
    )

    /** Registra el peso del día: actualiza el valor actual y la entrada "Hoy" del historial. */
    fun updateWeight(nuevoPeso: Double) {
        pesoActual = nuevoPeso

        val todayIndex = historialPesos.indexOfFirst { it.first == TODAY_LABEL }
        if (todayIndex >= 0) {
            historialPesos[todayIndex] = TODAY_LABEL to nuevoPeso
        } else {
            historialPesos.add(0, TODAY_LABEL to nuevoPeso)
        }
    }

    /** Suma un vaso de agua sin pasarse de la meta. Devuelve el total vigente. */
    fun incrementWater(): Int {
        if (vasosAgua < WATER_GOAL) vasosAgua++
        return vasosAgua
    }

    /** Resta un vaso de agua sin bajar de cero. Devuelve el total vigente. */
    fun decrementWater(): Int {
        if (vasosAgua > 0) vasosAgua--
        return vasosAgua
    }

    /** Historial de pesajes, del más reciente al más antiguo. */
    fun getWeightHistory(): List<Pair<String, Double>> = historialPesos.toList()

    private const val TODAY_LABEL = "Hoy"
}
