package com.proyecto.atlas.data

/** Identificador del usuario activo: separa los datos de cada cuenta en SharedPreferences. */
object UserScope {
    fun id(): String = AuthRepository.getCurrentUser()?.id ?: "guest"
}
