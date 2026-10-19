package com.proyecto.atlas

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.Fragment
import com.proyecto.atlas.databinding.ActivityHomeContainerBinding
import com.proyecto.atlas.fragment.HomeFragment
import com.proyecto.atlas.fragment.ProfileFragment
import com.proyecto.atlas.fragment.ProgressFragment
import com.proyecto.atlas.fragment.RoutinesFragment

/**
 * Contenedor principal de la app tras autenticarse.
 * Aloja las 4 pestañas del BottomNavigationView intercambiando fragments.
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
            val fragment: Fragment = when (item.itemId) {
                R.id.nav_home -> HomeFragment()
                R.id.nav_routines -> RoutinesFragment()
                R.id.nav_progress -> ProgressFragment()
                R.id.nav_profile -> ProfileFragment()
                else -> return@setOnItemSelectedListener false
            }
            showFragment(fragment)
            true
        }
    }

    private fun showFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(binding.fragmentContainer.id, fragment)
            .commit()
    }

    /** Permite que un fragment salte a la pestaña de rutinas (ej. enlace "Ver todo"). */
    fun selectRoutinesTab() {
        binding.bottomNav.selectedItemId = R.id.nav_routines
    }
}
