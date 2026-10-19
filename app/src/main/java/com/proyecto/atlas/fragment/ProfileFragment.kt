package com.proyecto.atlas.fragment

import android.app.Dialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.chip.Chip
import com.proyecto.atlas.LoginActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.databinding.BottomSheetEditGoalsBinding
import com.proyecto.atlas.databinding.DialogConfirmLogoutBinding
import com.proyecto.atlas.databinding.FragmentProfileBinding
import java.util.Locale

/** Pestaña "Perfil": datos del usuario activo, estadísticas, metas y cierre de sesión. */
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

        binding.cardStatTarget.setOnClickListener { showEditGoalsSheet() }
        binding.rowProfileGoal.setOnClickListener { showEditGoalsSheet() }
        binding.btnLogout.setOnClickListener { showLogoutConfirmation() }
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
        binding.tvTotalWorkouts.text = getString(
            R.string.profile_total_workouts,
            MetricsRepository.TOTAL_ENTRENAMIENTOS
        )

        binding.tvProfileGoal.text = user?.goal?.takeIf { it.isNotBlank() } ?: DEFAULT_GOAL
    }

    /** BottomSheet para ajustar el peso meta y el objetivo fitness. */
    private fun showEditGoalsSheet() {
        val user = AuthRepository.getCurrentUser()
        val sheet = BottomSheetDialog(requireContext())
        val sheetBinding = BottomSheetEditGoalsBinding.inflate(layoutInflater)
        sheet.setContentView(sheetBinding.root)

        sheetBinding.etTargetWeight.setText(
            formatWeight(user?.targetWeight ?: DEFAULT_TARGET_WEIGHT)
        )

        // Chips de objetivo: selección única, con el actual preseleccionado.
        val currentGoal = user?.goal ?: DEFAULT_GOAL
        var selectedGoal: String? = MetricsRepository.GOALS.firstOrNull { it == currentGoal }

        MetricsRepository.GOALS.forEach { goal ->
            val chip = layoutInflater.inflate(
                R.layout.item_goal_chip,
                sheetBinding.chipGroupGoals,
                false
            ) as Chip

            chip.text = goal
            chip.isChecked = goal == selectedGoal
            chip.setOnCheckedChangeListener { _, checked ->
                if (checked) {
                    selectedGoal = goal
                    sheetBinding.tvGoalsError.visibility = View.GONE
                }
            }
            sheetBinding.chipGroupGoals.addView(chip)
        }

        sheetBinding.btnSaveGoals.setOnClickListener {
            val rawTarget = sheetBinding.etTargetWeight.text?.toString()?.trim().orEmpty()

            if (rawTarget.isEmpty()) {
                sheetBinding.tilTargetWeight.error = getString(R.string.goals_error_empty_target)
                return@setOnClickListener
            }

            val target = rawTarget.replace(',', '.').toDoubleOrNull()
            if (target == null || target < MIN_WEIGHT || target > MAX_WEIGHT) {
                sheetBinding.tilTargetWeight.error = getString(R.string.goals_error_invalid_target)
                return@setOnClickListener
            }
            sheetBinding.tilTargetWeight.error = null

            val goal = selectedGoal
            if (goal == null) {
                sheetBinding.tvGoalsError.setText(R.string.goals_error_no_goal)
                sheetBinding.tvGoalsError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            AuthRepository.updateGoals(target, goal)
            bindUser()
            sheet.dismiss()
            Toast.makeText(requireContext(), R.string.goals_saved, Toast.LENGTH_SHORT).show()
        }

        sheet.show()
    }

    /** Pide confirmación antes de cerrar la sesión. */
    private fun showLogoutConfirmation() {
        val dialog = Dialog(requireContext())
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

        val dialogBinding = DialogConfirmLogoutBinding.inflate(layoutInflater)
        dialog.setContentView(dialogBinding.root)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        dialogBinding.btnCancelLogout.setOnClickListener { dialog.dismiss() }
        dialogBinding.btnConfirmLogout.setOnClickListener {
            dialog.dismiss()
            logout()
        }

        dialog.show()
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
        const val MIN_WEIGHT = 30.0
        const val MAX_WEIGHT = 300.0
    }
}
