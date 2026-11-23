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
import androidx.core.content.ContextCompat
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
import com.proyecto.atlas.databinding.ItemSettingRowBinding
import com.proyecto.atlas.databinding.ItemStatTileBinding
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

        binding.btnLogout.setOnClickListener { showLogoutConfirmation() }
    }

    /** Los datos se releen al volver (ej. tras terminar un entrenamiento). */
    override fun onResume() {
        super.onResume()
        bindUser()
    }

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden && _binding != null) bindUser()
    }

    private fun bindUser() {
        val user = AuthRepository.getCurrentUser()
        val locale = Locale.forLanguageTag("es-CO")

        val name = user?.name?.takeIf { it.isNotBlank() }
            ?: getString(R.string.home_default_user)
        binding.tvProfileName.text = name
        binding.tvProfileAvatar.text = name.first().uppercase(locale)
        binding.tvProfileEmail.text = user?.email.orEmpty()

        bindLevel()
        bindStats(user?.targetWeight ?: 0.0)
        bindPlan(user?.goal?.takeIf { it.isNotBlank() } ?: DEFAULT_GOAL, user?.targetWeight ?: 0.0)
        bindAccount(user?.email.orEmpty())
    }

    /** Nivel calculado con los entrenamientos totales y progreso hacia el siguiente. */
    private fun bindLevel() {
        val level = MetricsRepository.level()
        binding.tvProfileLevel.text = level.name

        val needed = level.workoutsForNext
        if (needed == null) {
            binding.progressLevel.progress = 100
            binding.tvLevelDetail.setText(R.string.profile_level_max)
        } else {
            binding.progressLevel.progress = (level.workoutsInLevel * 100 / needed).coerceIn(0, 100)
            binding.tvLevelDetail.text = getString(
                R.string.profile_level_detail,
                level.workoutsInLevel,
                needed,
                level.nextName
            )
        }
    }

    /** Peso, meta (editable) y racha. */
    private fun bindStats(target: Double) {
        val container = binding.layoutProfileStats
        container.removeAllViews()

        val weight = MetricsRepository.getPesoBase()
        addStatTile(
            container, R.drawable.ic_ruler, R.color.accent_cyan,
            if (weight > 0.0) getString(R.string.profile_stat_weight_value, formatWeight(weight))
            else getString(R.string.progress_weight_unset),
            getString(R.string.profile_stat_weight)
        )
        addStatTile(
            container, R.drawable.ic_trophy, R.color.primary_neon,
            if (target > 0.0) getString(R.string.profile_stat_weight_value, formatWeight(target))
            else getString(R.string.progress_weight_unset),
            getString(R.string.profile_stat_target)
        ).setOnClickListener { showEditGoalsSheet() }
        addStatTile(
            container, R.drawable.ic_flame, R.color.accent_orange,
            resources.getQuantityString(
                R.plurals.home_days,
                MetricsRepository.rachaDias,
                MetricsRepository.rachaDias
            ),
            getString(R.string.profile_stat_streak)
        )
    }

    private fun addStatTile(container: ViewGroup, icon: Int, tint: Int, value: String, label: String): View {
        val tile = ItemStatTileBinding.inflate(layoutInflater, container, false)
        tile.ivTileIcon.setImageResource(icon)
        tile.ivTileIcon.setColorFilter(ContextCompat.getColor(requireContext(), tint))
        tile.tvTileValue.text = value
        tile.tvTileLabel.text = label
        container.addView(tile.root)
        return tile.root
    }

    /** Objetivo, peso meta y meta semanal: tocar cualquiera abre el editor de metas. */
    private fun bindPlan(goal: String, target: Double) {
        val container = binding.layoutPlanRows
        container.removeAllViews()

        val rows = listOf(
            getString(R.string.profile_goal_label) to goal,
            getString(R.string.profile_stat_target) to
                if (target > 0.0) getString(R.string.profile_stat_weight_value, formatWeight(target))
                else getString(R.string.progress_weight_unset),
            getString(R.string.profile_weekly_label) to resources.getQuantityString(
                R.plurals.profile_per_week,
                MetricsRepository.metaSemanal,
                MetricsRepository.metaSemanal
            )
        )
        rows.forEachIndexed { index, (title, value) ->
            addSettingRow(container, title, value, editable = true, isLast = index == rows.lastIndex)
        }
    }

    private fun bindAccount(email: String) {
        val container = binding.layoutAccountRows
        container.removeAllViews()

        addSettingRow(container, getString(R.string.profile_email_label), email.ifBlank { "—" }, editable = false, isLast = false)
        addSettingRow(
            container,
            getString(R.string.profile_total_label),
            MetricsRepository.totalEntrenamientos.toString(),
            editable = false,
            isLast = true
        )
    }

    private fun addSettingRow(
        container: ViewGroup,
        title: String,
        value: String,
        editable: Boolean,
        isLast: Boolean
    ) {
        val row = ItemSettingRowBinding.inflate(layoutInflater, container, false)
        row.tvSettingTitle.text = title
        row.tvSettingValue.text = value
        row.ivSettingChevron.visibility = if (editable) View.VISIBLE else View.GONE
        row.viewDivider.visibility = if (isLast) View.GONE else View.VISIBLE
        if (editable) {
            row.rowSetting.setOnClickListener { showEditGoalsSheet() }
        } else {
            row.rowSetting.isClickable = false
            row.rowSetting.background = null
        }
        container.addView(row.root)
    }

    /** BottomSheet para ajustar el peso meta y el objetivo fitness. */
    private fun showEditGoalsSheet() {
        val user = AuthRepository.getCurrentUser()
        val sheet = BottomSheetDialog(requireContext())
        val sheetBinding = BottomSheetEditGoalsBinding.inflate(layoutInflater)
        sheet.setContentView(sheetBinding.root)

        user?.targetWeight?.takeIf { it > 0.0 }?.let { target ->
            sheetBinding.etTargetWeight.setText(formatWeight(target))
        }

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

        // Meta semanal: de 1 a 7 entrenamientos.
        var selectedWeekly = MetricsRepository.metaSemanal
        (1..7).forEach { days ->
            val chip = layoutInflater.inflate(
                R.layout.item_goal_chip,
                sheetBinding.chipGroupWeekly,
                false
            ) as Chip
            chip.text = days.toString()
            chip.isChecked = days == selectedWeekly
            chip.setOnCheckedChangeListener { _, checked -> if (checked) selectedWeekly = days }
            sheetBinding.chipGroupWeekly.addView(chip)
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
            MetricsRepository.metaSemanal = selectedWeekly
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

        // Sin ancho explícito el Dialog se encoge al contenido y corta los textos.
        val width = (resources.displayMetrics.widthPixels * DIALOG_WIDTH_RATIO).toInt()
        dialog.window?.setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT)
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
        const val DEFAULT_GOAL = "Hipertrofia"
        const val MIN_WEIGHT = 30.0
        const val MAX_WEIGHT = 300.0
        const val DIALOG_WIDTH_RATIO = 0.88
    }
}
