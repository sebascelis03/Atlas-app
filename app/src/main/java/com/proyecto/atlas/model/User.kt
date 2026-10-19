package com.proyecto.atlas.model

data class User(
    val id: String,
    val name: String,
    val email: String,
    val password: String,
    val weight: Double,
    val targetWeight: Double,
    val goal: String // Hipertrofia, Fuerza, Pérdida de peso
)
