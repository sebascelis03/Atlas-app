package com.proyecto.atlas

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.annotation.IdRes
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentTransaction
import com.proyecto.atlas.databinding.ActivityHomeContainerBinding
import com.proyecto.atlas.fragment.HomeFragment
import com.proyecto.atlas.fragment.MeasuresFragment
import com.proyecto.atlas.fragment.ProfileFragment
import com.proyecto.atlas.fragment.ProgressFragment
import com.proyecto.atlas.fragment.RoutinesFragment

/**
 * Contenedor principal de la app tras autenticarse.
 * Aloja las 5 pestañas del BottomNavigationView. Los fragments se conservan (show/hide)
 * para no perder el scroll ni el estado al cambiar de pestaña.
 */
class HomeContainerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeContainerBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityHomeContainerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.homeContainerRoot) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        setupBottomNavigation()

        // Solo en el primer arranque: al rotar, el FragmentManager restaura la pestaña.
        if (savedInstanceState == null) {
            binding.bottomNav.selectedItemId = R.id.nav_home
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> showTab(TAG_HOME) { HomeFragment() }
                R.id.nav_routines -> showTab(TAG_ROUTINES) { RoutinesFragment() }
                R.id.nav_progress -> showTab(TAG_PROGRESS) { ProgressFragment() }
                R.id.nav_measures -> showTab(TAG_MEASURES) { MeasuresFragment() }
                R.id.nav_profile -> showTab(TAG_PROFILE) { ProfileFragment() }
                else -> return@setOnItemSelectedListener false
            }
            true
        }
    }

    /** Muestra la pestaña `tag` (creándola la primera vez) y oculta las demás. */
    private fun showTab(tag: String, factory: () -> Fragment) {
        val manager = supportFragmentManager
        val transaction = manager.beginTransaction().setReorderingAllowed(true)

        manager.fragments.forEach { fragment ->
            if (fragment.tag != tag) transaction.hide(fragment)
        }

        val existing = manager.findFragmentByTag(tag)
        if (existing == null) {
            transaction.add(binding.fragmentContainer.id, factory(), tag)
        } else {
            transaction.show(existing)
        }

        transaction.setTransition(FragmentTransaction.TRANSIT_FRAGMENT_FADE).commit()
    }

    /** Permite que un fragment salte a otra pestaña (ej. "Ver todo" o "Ir a Medidas"). */
    fun selectTab(@IdRes itemId: Int) {
        binding.bottomNav.selectedItemId = itemId
    }

    /** MainActivity vuelve aquí al terminar un entrenamiento, pidiendo la pestaña Inicio. */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)

        if (intent.getBooleanExtra(EXTRA_SHOW_HOME, false)) {
            binding.bottomNav.selectedItemId = R.id.nav_home
        }
    }

    companion object {
        /** Pide abrir directamente la pestaña Inicio. */
        const val EXTRA_SHOW_HOME = "extra_show_home"

        private const val TAG_HOME = "tab_home"
        private const val TAG_ROUTINES = "tab_routines"
        private const val TAG_PROGRESS = "tab_progress"
        private const val TAG_MEASURES = "tab_measures"
        private const val TAG_PROFILE = "tab_profile"
    }
}
