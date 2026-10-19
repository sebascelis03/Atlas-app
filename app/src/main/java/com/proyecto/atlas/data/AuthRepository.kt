package com.proyecto.atlas.data

import android.content.Context
import android.content.SharedPreferences
import com.proyecto.atlas.model.User
import org.json.JSONArray
import org.json.JSONObject

/**
 * Repositorio de autenticación (Fase 1).
 *
 * Los usuarios y la sesión activa se persisten en SharedPreferences, así que
 * sobreviven al cierre de la app. Tal como se definió en
 * docs/DECISIONES_Y_ARQUITECTURA.md, la app no se conecta de forma directa a
 * PostgreSQL: cuando exista backend solo se reemplaza esta implementación por
 * llamadas Retrofit sin tocar las pantallas.
 */
object AuthRepository {

    private var prefs: SharedPreferences? = null

    private val users: MutableList<User> = mutableListOf()
    private var currentUser: User? = null

    /** Lo invoca AtlasApp al arrancar. Carga lo guardado o siembra los usuarios demo. */
    fun init(context: Context) {
        if (prefs != null) return

        val preferences = context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs = preferences

        val storedUsers = preferences.getString(KEY_USERS, null)
        if (storedUsers == null) {
            users.addAll(demoUsers())
            persistUsers()
        } else {
            users.addAll(parseUsers(storedUsers))
        }

        val currentId = preferences.getString(KEY_CURRENT_USER_ID, null)
        currentUser = currentId?.let { id -> users.firstOrNull { it.id == id } }
    }

    /** Valida las credenciales. Devuelve true y abre sesión si coinciden. */
    fun login(email: String, password: String): Boolean {
        val found = users.firstOrNull {
            it.email.equals(email.trim(), ignoreCase = true) && it.password == password
        }
        currentUser = found
        persistSession()
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

        persistUsers()
        persistSession()
        return true
    }

    /** Usuario con sesión activa, o null si nadie ha iniciado sesión. */
    fun getCurrentUser(): User? = currentUser

    /**
     * Actualiza el peso meta y el objetivo fitness del usuario en sesión.
     * Devuelve false si no hay nadie autenticado.
     */
    fun updateGoals(targetWeight: Double, goal: String): Boolean {
        val user = currentUser ?: return false
        val updated = user.copy(targetWeight = targetWeight, goal = goal)

        val index = users.indexOfFirst { it.id == user.id }
        if (index >= 0) users[index] = updated
        currentUser = updated

        persistUsers()
        return true
    }

    /** Cierra la sesión activa; los usuarios registrados se conservan. */
    fun logout() {
        currentUser = null
        persistSession()
    }

    /** Lista de solo lectura, útil para pantallas de depuración o estadísticas. */
    fun getAllUsers(): List<User> = users.toList()

    // --- Persistencia ---

    private fun persistUsers() {
        val array = JSONArray()
        users.forEach { array.put(toJson(it)) }
        prefs?.edit()?.putString(KEY_USERS, array.toString())?.apply()
    }

    private fun persistSession() {
        prefs?.edit()?.putString(KEY_CURRENT_USER_ID, currentUser?.id)?.apply()
    }

    private fun toJson(user: User): JSONObject = JSONObject().apply {
        put(FIELD_ID, user.id)
        put(FIELD_NAME, user.name)
        put(FIELD_EMAIL, user.email)
        put(FIELD_PASSWORD, user.password)
        put(FIELD_WEIGHT, user.weight)
        put(FIELD_TARGET_WEIGHT, user.targetWeight)
        put(FIELD_GOAL, user.goal)
    }

    private fun parseUsers(raw: String): List<User> = runCatching {
        val array = JSONArray(raw)
        (0 until array.length()).map { index ->
            val json = array.getJSONObject(index)
            User(
                id = json.getString(FIELD_ID),
                name = json.getString(FIELD_NAME),
                email = json.getString(FIELD_EMAIL),
                password = json.getString(FIELD_PASSWORD),
                weight = json.optDouble(FIELD_WEIGHT, 0.0),
                targetWeight = json.optDouble(FIELD_TARGET_WEIGHT, 0.0),
                goal = json.optString(FIELD_GOAL)
            )
        }
    }.getOrDefault(demoUsers())

    /** Credenciales de demostración que se siembran en la primera ejecución. */
    private fun demoUsers(): List<User> = listOf(
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

    private const val PREFS_NAME = "atlas_auth_prefs"
    private const val KEY_USERS = "users"
    private const val KEY_CURRENT_USER_ID = "current_user_id"

    private const val FIELD_ID = "id"
    private const val FIELD_NAME = "name"
    private const val FIELD_EMAIL = "email"
    private const val FIELD_PASSWORD = "password"
    private const val FIELD_WEIGHT = "weight"
    private const val FIELD_TARGET_WEIGHT = "targetWeight"
    private const val FIELD_GOAL = "goal"
}
