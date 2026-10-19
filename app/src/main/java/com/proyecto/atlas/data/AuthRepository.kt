package com.proyecto.atlas.data

import com.proyecto.atlas.model.User

/**
 * Repositorio Mock de autenticación (Fase 1 del proyecto).
 *
 * Los usuarios viven en memoria mientras el proceso de la app esté activo, tal como
 * se definió en docs/DECISIONES_Y_ARQUITECTURA.md: la app no se conecta de forma
 * directa a PostgreSQL. Cuando exista backend, solo se reemplaza la implementación
 * de este object por llamadas Retrofit sin tocar las pantallas.
 */
object AuthRepository {

    private val users: MutableList<User> = mutableListOf(
        User(
            id = "1",
            name = "Administrador",
            email = "admin@atlas.com",
            password = "123456",
            weight = 82.5,
            targetWeight = 78.0,
            goal = "Fuerza"
        ),
        User(
            id = "2",
            name = "Usuario Atlas",
            email = "usuario@atlas.com",
            password = "atlas2026",
            weight = 70.0,
            targetWeight = 75.0,
            goal = "Hipertrofia"
        )
    )

    private var currentUser: User? = null

    /** Valida las credenciales mock. Devuelve true y abre sesión si coinciden. */
    fun login(email: String, password: String): Boolean {
        val found = users.firstOrNull {
            it.email.equals(email.trim(), ignoreCase = true) && it.password == password
        }
        currentUser = found
        return found != null
    }

    /** Registra un usuario nuevo. Devuelve false si el correo ya está en uso. */
    fun register(user: User): Boolean {
        val emailTaken = users.any { it.email.equals(user.email.trim(), ignoreCase = true) }
        if (emailTaken) return false

        val newUser = user.copy(
            id = if (user.id.isBlank()) (users.size + 1).toString() else user.id,
            email = user.email.trim()
        )
        users.add(newUser)
        currentUser = newUser
        return true
    }

    /** Usuario con sesión activa, o null si nadie ha iniciado sesión. */
    fun getCurrentUser(): User? = currentUser

    /** Cierra la sesión activa. */
    fun logout() {
        currentUser = null
    }

    /** Lista de solo lectura, útil para pantallas de depuración o estadísticas. */
    fun getAllUsers(): List<User> = users.toList()
}
