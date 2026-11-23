package com.proyecto.atlas

import android.app.Application
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.BodyRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.data.RoutineRepository
import com.proyecto.atlas.data.WorkoutLogRepository

/**
 * Punto de arranque de la app. Entrega el Context a los repositorios para que
 * puedan leer y escribir sus SharedPreferences sin acoplarse a una Activity.
 */
class AtlasApp : Application() {

    override fun onCreate() {
        super.onCreate()
        AuthRepository.init(this)
        MetricsRepository.init(this)
        WorkoutLogRepository.init(this)
        BodyRepository.init(this)
        RoutineRepository.init(this)
    }
}
