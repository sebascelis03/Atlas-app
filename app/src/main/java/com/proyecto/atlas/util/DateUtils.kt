package com.proyecto.atlas.util

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/** Utilidades de fechas. Los registros se guardan con clave `yyyy-MM-dd` (hora local). */
object DateUtils {

    private val LOCALE_ES: Locale = Locale.forLanguageTag("es-CO")

    fun key(calendar: Calendar = Calendar.getInstance()): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.time)

    fun today(): String = key()

    /** Fecha `n` días atrás (0 = hoy). */
    fun daysAgo(n: Int): Calendar =
        Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -n) }

    fun parse(key: String): Calendar? = runCatching {
        val date: Date = SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(key)!!
        Calendar.getInstance().apply { time = date }
    }.getOrNull()

    /** Lunes de la semana a la que pertenece `calendar` (la semana ATLAS va de lunes a domingo). */
    fun startOfWeek(calendar: Calendar = Calendar.getInstance()): Calendar {
        val copy = calendar.clone() as Calendar
        val offset = (copy.get(Calendar.DAY_OF_WEEK) + 5) % 7 // lunes = 0 ... domingo = 6
        copy.add(Calendar.DAY_OF_YEAR, -offset)
        return copy
    }

    /** "26 oct" */
    fun short(key: String): String {
        val calendar = parse(key) ?: return key
        val text = SimpleDateFormat("d MMM", LOCALE_ES).format(calendar.time).replace(".", "")
        return text
    }

    /** "Lunes, 26 de octubre" */
    fun longToday(): String {
        val text = SimpleDateFormat("EEEE, d 'de' MMMM", LOCALE_ES).format(Date())
        return text.replaceFirstChar { it.titlecase(LOCALE_ES) }
    }

    /** Inicial del día de la semana para las tiras y calendarios: L M X J V S D. */
    val WEEK_LETTERS = listOf("L", "M", "X", "J", "V", "S", "D")
}
