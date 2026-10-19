package com.proyecto.atlas.fragment

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.proyecto.atlas.HomeContainerActivity
import com.proyecto.atlas.MainActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.databinding.FragmentHomeBinding
import com.proyecto.atlas.databinding.ItemHomeExerciseBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

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
        bindWeeklyGoal()
        bindTodayExercises()
        setupButtons()
    }

    /** Fecha del día, saludo con el usuario autenticado y avatar con su inicial. */
    private fun bindHeader() {
        val locale = Locale.forLanguageTag("es-CO")
        val formattedDate = SimpleDateFormat("EEEE, d 'de' MMMM", locale).format(Date())
        binding.tvDate.text = formattedDate.replaceFirstChar { it.titlecase(locale) }

        val name = AuthRepository.getCurrentUser()?.name?.takeIf { it.isNotBlank() }
            ?: getString(R.string.home_default_user)
        binding.tvGreeting.text = getString(R.string.home_greeting, name)
        binding.tvAvatarInitial.text = name.first().uppercase(locale)
    }

    /** Meta semanal y racha, calculadas a partir de las métricas registradas. */
    private fun bindWeeklyGoal() {
        val completed = MetricsRepository.ENTRENAMIENTOS_SEMANA
        val goal = MetricsRepository.META_SEMANAL
        val percent = if (goal > 0) completed * 100 / goal else 0

        binding.progressWeeklyGoal.progress = percent
        binding.tvWeeklyGoalPercent.text = getString(R.string.home_weekly_goal_percent, percent)
        binding.tvWeeklyGoalDetail.text =
            getString(R.string.home_weekly_goal_detail, completed, goal)
        binding.tvStreak.text = getString(R.string.home_streak, MetricsRepository.RACHA_DIAS)
    }

    /** Infla las filas de la rutina de hoy dentro de la tarjeta. */
    private fun bindTodayExercises() {
        binding.layoutTodayExercises.removeAllViews()

        todayExercises.forEach { item ->
            val rowBinding = ItemHomeExerciseBinding.inflate(
                layoutInflater,
                binding.layoutTodayExercises,
                false
            )
            rowBinding.tvExerciseName.text = item.name
            rowBinding.tvExerciseSets.text = getString(R.string.home_sets_reps, item.sets, item.reps)
            rowBinding.ivExerciseDone.visibility = if (item.isDone) View.VISIBLE else View.GONE
            binding.layoutTodayExercises.addView(rowBinding.root)
        }
    }

    private fun setupButtons() {
        binding.btnStartWorkout.setOnClickListener {
            startActivity(Intent(requireContext(), MainActivity::class.java))
        }

        binding.tvSeeAll.setOnClickListener {
            // El listado completo de rutinas llega con el Prompt 4; por ahora salta a la pestaña.
            (activity as? HomeContainerActivity)?.selectRoutinesTab()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    /** Fila de la rutina del día tal como aparece en el mockup del equipo. */
    private data class TodayExercise(
        val name: String,
        val sets: Int,
        val reps: Int,
        val isDone: Boolean = false
    )

    private companion object {
        val todayExercises = listOf(
            TodayExercise("Press de banca", sets = 4, reps = 8),
            TodayExercise("Press militar", sets = 3, reps = 10, isDone = true),
            TodayExercise("Fondos en paralelas", sets = 3, reps = 12)
        )
    }
}
