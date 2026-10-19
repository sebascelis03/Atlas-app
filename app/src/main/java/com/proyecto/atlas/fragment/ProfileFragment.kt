package com.proyecto.atlas.fragment

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.proyecto.atlas.LoginActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.databinding.FragmentProfileBinding
import java.util.Locale

/** Pestaña "Perfil": datos del usuario activo, estadísticas y cierre de sesión. */
class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        bindUser()
        binding.btnLogout.setOnClickListener { logout() }
    }

    private fun bindUser() {
        val user = AuthRepository.getCurrentUser()
        val locale = Locale.forLanguageTag("es-CO")

        val name = user?.name?.takeIf { it.isNotBlank() }
            ?: getString(R.string.home_default_user)
        binding.tvProfileName.text = name
        binding.tvProfileAvatar.text = name.first().uppercase(locale)
        binding.tvProfileEmail.text = user?.email.orEmpty()

        // El peso vive en MetricsRepository (se actualiza desde Progreso);
        // la meta y el objetivo son parte del perfil creado al registrarse.
        binding.tvStatWeight.text = getString(
            R.string.profile_stat_weight_value,
            formatWeight(MetricsRepository.pesoActual)
        )
        binding.tvStatTarget.text = getString(
            R.string.profile_stat_weight_value,
            formatWeight(user?.targetWeight ?: DEFAULT_TARGET_WEIGHT)
        )
        binding.tvStatStreak.text =
            getString(R.string.profile_stat_streak_value, MetricsRepository.RACHA_DIAS)

        binding.tvProfileGoal.text = user?.goal?.takeIf { it.isNotBlank() } ?: DEFAULT_GOAL
    }

    private fun logout() {
        AuthRepository.logout()
        Toast.makeText(requireContext(), R.string.profile_logout_done, Toast.LENGTH_SHORT).show()

        val intent = Intent(requireContext(), LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        activity?.finish()
    }

    private fun formatWeight(weightKg: Double): String =
        String.format(Locale.US, "%.1f", weightKg)

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val DEFAULT_TARGET_WEIGHT = 80.0
        const val DEFAULT_GOAL = "Hipertrofia"
    }
}
