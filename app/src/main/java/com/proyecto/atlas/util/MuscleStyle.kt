package com.proyecto.atlas.util

import androidx.annotation.ColorRes
import com.proyecto.atlas.R

/** Color de acento por grupo muscular (barra de las tarjetas de rutina). */
object MuscleStyle {
    @ColorRes
    fun colorFor(group: String?): Int = when (group) {
        "Pecho" -> R.color.group_pecho
        "Espalda" -> R.color.group_espalda
        "Pierna" -> R.color.group_pierna
        "Hombro" -> R.color.group_hombro
        "Brazos" -> R.color.group_brazos
        "Core" -> R.color.group_core
        else -> R.color.accent_orange
    }
}
