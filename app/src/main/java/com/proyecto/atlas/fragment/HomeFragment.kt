package com.proyecto.atlas.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.proyecto.atlas.HomeContainerActivity
import com.proyecto.atlas.MainActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.data.RoutineRepository
import com.proyecto.atlas.data.WorkoutLogRepository
import com.proyecto.atlas.databinding.FragmentHomeBinding
import com.proyecto.atlas.databinding.ItemHomeExerciseBinding
import com.proyecto.atlas.databinding.ItemStatTileBinding
import com.proyecto.atlas.databinding.ItemWeekDayBinding
import com.proyecto.atlas.model.Routine
import com.proyecto.atlas.util.DateUtils
import java.util.Calendar
import java.util.Locale

/** Pestaña "Inicio": qué toca hoy, cómo va la semana y el agua del día. */
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private var suggested: Routine? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        bindHeader()
        setupButtons()
        refresh()
    }

    /** Las estadísticas se releen al volver (ej. tras terminar un entrenamiento). */
    override fun onResume() {
        super.onResume()
        refresh()
    }

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden) refresh()
    }

    private fun refresh() {
        if (_binding == null) return
        bindHeader()
        bindWeeklyGoal()
        bindWeekStrip()
        bindQuickStats()
        bindToday()
        bindWater()
    }

    private fun bindHeader() {
        val locale = Locale.forLanguageTag("es-CO")
        binding.tvDate.text = DateUtils.longToday()

        val name = AuthRepository.getCurrentUser()?.name?.takeIf { it.isNotBlank() }
            ?: getString(R.string.home_default_user)
        binding.tvGreeting.text = getString(R.string.home_greeting, name)
        binding.tvAvatarInitial.text = name.first().uppercase(locale)
    }

    /** Anillo con el avance hacia la meta semanal. */
    private fun bindWeeklyGoal() {
        val completed = MetricsRepository.entrenamientosSemana
        val goal = MetricsRepository.metaSemanal
        val percent = if (goal > 0) (completed * 100 / goal).coerceAtMost(100) else 0

        binding.progressWeeklyGoal.progress = percent
        binding.tvWeeklyGoalPercent.text = getString(R.string.home_weekly_goal_percent, percent)
        binding.tvWeeklyGoalDetail.text =
            getString(R.string.home_weekly_goal_detail, completed, goal)
        binding.tvWeeklyGoalHint.text = when {
            completed >= goal -> getString(R.string.home_goal_reached)
            else -> resources.getQuantityString(
                R.plurals.home_goal_remaining,
                goal - completed,
                goal - completed
            )
        }
    }

    /** Lunes a domingo: día entrenado en naranja, hoy con anillo. */
    private fun bindWeekStrip() {
        val strip = binding.layoutWeekStrip
        strip.removeAllViews()

        val trained = WorkoutLogRepository.daysTrained()
        val today = DateUtils.today()
        val monday = DateUtils.startOfWeek()

        for (column in 0 until 7) {
            val day = (monday.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, column) }
            val key = DateUtils.key(day)
            val item = ItemWeekDayBinding.inflate(layoutInflater, strip, false)

            item.tvDayLetter.text = DateUtils.WEEK_LETTERS[column]
            item.tvDayDot.text = day.get(Calendar.DAY_OF_MONTH).toString()

            val done = key in trained
            item.tvDayDot.setBackgroundResource(
                when {
                    done -> R.drawable.bg_day_done
                    key == today -> R.drawable.bg_day_today
                    else -> R.drawable.bg_day_idle
                }
            )
            item.tvDayDot.setTextColor(
                ContextCompat.getColor(
                    requireContext(),
                    when {
                        done -> R.color.bg_dark
                        key == today -> R.color.text_primary
                        else -> R.color.text_muted
                    }
                )
            )
            strip.addView(item.root)
        }
    }

    /** Racha, volumen de la semana y total de entrenamientos. */
    private fun bindQuickStats() {
        val container = binding.layoutQuickStats
        container.removeAllViews()

        val volume = WorkoutLogRepository.thisWeekVolume()
        addTile(
            container, R.drawable.ic_flame, R.color.accent_orange,
            resources.getQuantityString(R.plurals.home_days, MetricsRepository.rachaDias, MetricsRepository.rachaDias),
            getString(R.string.home_tile_streak)
        )
        addTile(
            container, R.drawable.ic_bolt, R.color.group_core,
            formatVolume(volume), getString(R.string.home_tile_volume)
        )
        addTile(
            container, R.drawable.ic_trophy, R.color.primary_neon,
            MetricsRepository.totalEntrenamientos.toString(), getString(R.string.home_tile_total)
        )
    }

    private fun addTile(container: ViewGroup, icon: Int, tint: Int, value: String, label: String) {
        val tile = ItemStatTileBinding.inflate(layoutInflater, container, false)
        tile.ivTileIcon.setImageResource(icon)
        tile.ivTileIcon.setColorFilter(ContextCompat.getColor(requireContext(), tint))
        tile.tvTileValue.text = value
        tile.tvTileLabel.text = label
        container.addView(tile.root)
    }

    /** Rutina sugerida (rotación) con sus ejercicios reales. */
    private fun bindToday() {
        val routine = RoutineRepository.suggested().also { suggested = it }
        val rows = binding.layoutTodayExercises
        rows.removeAllViews()

        binding.tvTodayDone.visibility =
            if (WorkoutLogRepository.trainedToday()) View.VISIBLE else View.GONE

        if (routine == null) {
            binding.tvTodayTitle.setText(R.string.home_free_workout)
            binding.tvTodayMuscles.text = ""
            binding.tvTodayMeta.visibility = View.GONE
            binding.tvTodayEmpty.visibility = View.VISIBLE
            return
        }

        binding.tvTodayEmpty.visibility = View.GONE
        binding.tvTodayTitle.text = routine.title
        binding.tvTodayMuscles.text = routine.muscleGroups
        binding.tvTodayMeta.visibility = View.VISIBLE
        binding.tvTodayMeta.text =
            getString(R.string.routines_metrics, routine.exerciseCount, routine.estimatedMinutes)

        routine.exerciseNames.take(MAX_PREVIEW).forEach { name ->
            val row = ItemHomeExerciseBinding.inflate(layoutInflater, rows, false)
            row.tvExerciseName.text = name
            row.tvExerciseSets.text = getString(R.string.home_sets_reps, DEFAULT_SETS, DEFAULT_REPS)
            row.ivExerciseDone.visibility = View.GONE
            rows.addView(row.root)
        }

        val extra = routine.exerciseNames.size - MAX_PREVIEW
        if (extra > 0) {
            val row = ItemHomeExerciseBinding.inflate(layoutInflater, rows, false)
            row.tvExerciseName.text = getString(R.string.home_more_exercises, extra)
            row.tvExerciseSets.visibility = View.GONE
            row.ivExerciseDone.visibility = View.GONE
            rows.addView(row.root)
        }
    }

    private fun bindWater() {
        val glasses = MetricsRepository.vasosAgua
        val goal = MetricsRepository.WATER_GOAL
        binding.tvWaterCount.text = getString(R.string.home_water_progress, glasses, goal)
        binding.progressWater.progress = (glasses * 100 / goal).coerceAtMost(100)
        binding.btnMinusWater.isEnabled = glasses > 0
    }

    private fun setupButtons() {
        binding.btnStartWorkout.setOnClickListener {
            startActivity(MainActivity.intentFor(requireContext(), suggested))
        }

        binding.tvSeeAll.setOnClickListener {
            (activity as? HomeContainerActivity)?.selectTab(R.id.nav_routines)
        }

        binding.btnMinusWater.setOnClickListener {
            MetricsRepository.decrementWater()
            bindWater()
        }
        binding.btnPlusWater.setOnClickListener {
            MetricsRepository.incrementWater()
            bindWater()
        }
    }

    private fun formatVolume(volumeKg: Double): String =
        if (volumeKg >= 1000) {
            String.format(Locale.US, "%.1f t", volumeKg / 1000.0)
        } else {
            String.format(Locale.US, "%.0f kg", volumeKg)
        }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val MAX_PREVIEW = 4
        const val DEFAULT_SETS = 3
        const val DEFAULT_REPS = 10
    }
}
