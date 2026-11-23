package com.proyecto.atlas.model

/** Registro corporal de un día: peso opcional y las medidas (en cm) que se hayan anotado. */
data class BodyEntry(
    val dateKey: String,
    val weightKg: Double?,
    val measures: Map<String, Double>
)

/** Definición de una medida corporal. */
data class MeasureSpec(val key: String, val label: String)
