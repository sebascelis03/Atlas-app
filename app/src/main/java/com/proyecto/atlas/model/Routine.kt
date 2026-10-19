package com.proyecto.atlas.model

data class Routine(
    val id: String,
    val title: String,
    val muscleGroups: String,
    val exerciseCount: Int,
    val estimatedMinutes: Int,
    val exerciseNames: List<String> = emptyList()
)
