package com.proyecto.atlas

import android.app.Dialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.os.CountDownTimer
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.chip.Chip
import com.proyecto.atlas.adapter.ExercisePickerAdapter
import com.proyecto.atlas.adapter.WorkoutExerciseAdapter
import com.proyecto.atlas.data.ExerciseRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.data.RoutineRepository
import com.proyecto.atlas.databinding.ActivityMainBinding
import com.proyecto.atlas.databinding.BottomSheetExercisePickerBinding
import com.proyecto.atlas.databinding.DialogWorkoutSummaryBinding
import com.proyecto.atlas.model.ActiveWorkout
import com.proyecto.atlas.model.Exercise
import com.proyecto.atlas.model.WorkoutExercise
import com.proyecto.atlas.model.WorkoutSet
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val activeWorkout = ActiveWorkout()
    private lateinit var workoutAdapter: WorkoutExerciseAdapter

    // Rest Timer
    private var restCountDownTimer: CountDownTimer? = null
    private var restTimeRemainingMillis: Long = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        setupWorkoutTimer()
        setupWorkoutRecyclerView()
        setupRestTimerControls()
        setupButtons()
        loadSelectedRoutine()
        updateStats()
    }

    /**
     * Carga la rutina elegida en la pestaña Rutinas. Si se entra sin rutina
     * (ej. "Comenzar entrenamiento" desde Inicio) la sesión arranca vacía y el
     * usuario arma su entrenamiento libremente.
     */
    private fun loadSelectedRoutine() {
        val routineId = intent.getStringExtra(EXTRA_ROUTINE_ID)
        val routine = routineId?.let { RoutineRepository.getRoutineById(it) }

        // El título viaja en el Intent; si falta, se recupera del repositorio.
        val title = intent.getStringExtra(EXTRA_ROUTINE_TITLE) ?: routine?.title
        if (title != null) {
            activeWorkout.title = title
            binding.tvWorkoutTitle.text = title
        }

        // Igual con los ejercicios: el Intent manda, el repositorio es respaldo.
        val exerciseNames = intent.getStringArrayListExtra(EXTRA_EXERCISES)
            ?.takeIf { it.isNotEmpty() }
            ?: routine?.exerciseNames
            ?: return

        // Los nombres se resuelven contra el catálogo de ejercicios.
        exerciseNames.forEach { exerciseName ->
            val exercise = ExerciseRepository.defaultExercises
                .firstOrNull { it.name.equals(exerciseName, ignoreCase = true) }
                ?: return@forEach

            activeWorkout.workoutExercises.add(
                WorkoutExercise(
                    exercise = exercise,
                    sets = MutableList(DEFAULT_SETS_PER_EXERCISE) { index ->
                        WorkoutSet(index + 1, "-", 0.0, DEFAULT_REPS_PER_SET, false)
                    }
                )
            )
        }

        workoutAdapter.notifyDataSetChanged()
    }

    private fun setupWorkoutTimer() {
        binding.chronoWorkoutTime.base = SystemClock.elapsedRealtime()
        binding.chronoWorkoutTime.start()
    }

    private fun setupWorkoutRecyclerView() {
        workoutAdapter = WorkoutExerciseAdapter(
            workoutExercises = activeWorkout.workoutExercises,
            onStatsChanged = { updateStats() },
            onSetCompleted = { set -> startRestTimer(90) },
            onExerciseDeleted = { position ->
                if (position in activeWorkout.workoutExercises.indices) {
                    activeWorkout.workoutExercises.removeAt(position)
                    workoutAdapter.notifyItemRemoved(position)
                    updateStats()
                }
            }
        )

        binding.rvWorkoutExercises.layoutManager = LinearLayoutManager(this)
        binding.rvWorkoutExercises.adapter = workoutAdapter
    }

    private fun setupButtons() {
        binding.btnAddExercise.setOnClickListener {
            showExercisePickerDialog()
        }

        binding.btnFinishWorkout.setOnClickListener {
            showWorkoutSummaryDialog()
        }
    }

    private fun updateStats() {
        var totalVolume = 0.0
        var totalSets = 0
        var completedSets = 0

        for (workoutExercise in activeWorkout.workoutExercises) {
            for (set in workoutExercise.sets) {
                totalSets++
                if (set.isCompleted) {
                    completedSets++
                    totalVolume += (set.weightKg * set.reps)
                }
            }
        }

        binding.tvTotalVolume.text = String.format(Locale.getDefault(), "%,.0f kg", totalVolume)
        binding.tvCompletedSetsCount.text = "$completedSets de $totalSets"

        binding.layoutEmptyState.visibility = if (activeWorkout.workoutExercises.isEmpty()) {
            View.VISIBLE
        } else {
            View.GONE
        }
    }

    // --- Rest Timer ---

    private fun startRestTimer(seconds: Int) {
        restCountDownTimer?.cancel()
        restTimeRemainingMillis = seconds * 1000L
        binding.layoutRestTimer.visibility = View.VISIBLE
        runCountDown()
    }

    private fun runCountDown() {
        restCountDownTimer?.cancel()
        restCountDownTimer = object : CountDownTimer(restTimeRemainingMillis, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                restTimeRemainingMillis = millisUntilFinished
                val totalSeconds = millisUntilFinished / 1000
                val minutes = totalSeconds / 60
                val secs = totalSeconds % 60
                binding.tvRestTimerSeconds.text = String.format(Locale.getDefault(), "%02d:%02d", minutes, secs)
            }

            override fun onFinish() {
                binding.layoutRestTimer.visibility = View.GONE
                Toast.makeText(this@MainActivity, "¡Tiempo de descanso terminado! 💪", Toast.LENGTH_SHORT).show()
            }
        }.start()
    }

    private fun setupRestTimerControls() {
        binding.btnAdd15s.setOnClickListener {
            restTimeRemainingMillis += 15000L
            runCountDown()
        }

        binding.btnSkipTimer.setOnClickListener {
            restCountDownTimer?.cancel()
            binding.layoutRestTimer.visibility = View.GONE
        }
    }

    // --- Exercise Picker Bottom Sheet ---

    private fun showExercisePickerDialog() {
        val sheetDialog = BottomSheetDialog(this)
        val sheetBinding = BottomSheetExercisePickerBinding.inflate(layoutInflater)
        sheetDialog.setContentView(sheetBinding.root)

        var selectedMuscle = "Todos"
        var currentQuery = ""

        val pickerAdapter = ExercisePickerAdapter(ExerciseRepository.defaultExercises) { exercise ->
            // Add exercise to active workout
            val newWorkoutExercise = WorkoutExercise(
                exercise = exercise,
                sets = mutableListOf(
                    WorkoutSet(1, "-", 0.0, 0, false),
                    WorkoutSet(2, "-", 0.0, 0, false),
                    WorkoutSet(3, "-", 0.0, 0, false)
                )
            )
            activeWorkout.workoutExercises.add(newWorkoutExercise)
            workoutAdapter.notifyItemInserted(activeWorkout.workoutExercises.size - 1)
            binding.rvWorkoutExercises.smoothScrollToPosition(activeWorkout.workoutExercises.size - 1)
            updateStats()
            sheetDialog.dismiss()
        }

        sheetBinding.rvPickerExercises.layoutManager = LinearLayoutManager(this)
        sheetBinding.rvPickerExercises.adapter = pickerAdapter

        // Populate Muscle Filter Chips
        ExerciseRepository.getMuscleGroups().forEach { muscle ->
            val chip = Chip(this).apply {
                text = muscle
                isCheckable = true
                isChecked = muscle == "Todos"
                setTextColor(Color.WHITE)
                setChipBackgroundColorResource(R.color.surface_card)
                setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        selectedMuscle = muscle
                        pickerAdapter.filter(currentQuery, selectedMuscle)
                    }
                }
            }
            sheetBinding.chipGroupMuscles.addView(chip)
        }

        sheetBinding.etSearchExercise.doAfterTextChanged { text ->
            currentQuery = text?.toString() ?: ""
            pickerAdapter.filter(currentQuery, selectedMuscle)
        }

        sheetBinding.btnCloseSheet.setOnClickListener {
            sheetDialog.dismiss()
        }

        sheetDialog.show()
    }

    // --- Workout Summary Dialog ---

    private fun showWorkoutSummaryDialog() {
        var totalVolume = 0.0
        var completedSets = 0

        for (workoutExercise in activeWorkout.workoutExercises) {
            for (set in workoutExercise.sets) {
                if (set.isCompleted) {
                    completedSets++
                    totalVolume += (set.weightKg * set.reps)
                }
            }
        }

        val elapsedMillis = SystemClock.elapsedRealtime() - binding.chronoWorkoutTime.base
        val totalMinutes = (elapsedMillis / 1000) / 60
        val totalSeconds = (elapsedMillis / 1000) % 60
        val durationFormatted = "${totalMinutes}m ${totalSeconds}s"

        val dialog = Dialog(this)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        val dialogBinding = DialogWorkoutSummaryBinding.inflate(layoutInflater)
        dialog.setContentView(dialogBinding.root)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        dialogBinding.tvSummaryDuration.text = durationFormatted
        dialogBinding.tvSummaryVolume.text = String.format(Locale.getDefault(), "%,.0f kg", totalVolume)
        dialogBinding.tvSummarySets.text = completedSets.toString()

        dialogBinding.btnDoneSummary.setOnClickListener {
            dialog.dismiss()
            finishWorkout()
        }

        dialog.show()

        // Sin ancho explícito el Dialog se encoge al contenido y corta los textos.
        val width = (resources.displayMetrics.widthPixels * DIALOG_WIDTH_RATIO).toInt()
        dialog.window?.setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    /** Acredita el entrenamiento en las estadísticas y regresa a la pestaña Inicio. */
    private fun finishWorkout() {
        MetricsRepository.incrementWorkouts()
        Toast.makeText(this, "¡Entrenamiento guardado con éxito!", Toast.LENGTH_SHORT).show()

        val intent = Intent(this, HomeContainerActivity::class.java)
        intent.putExtra(HomeContainerActivity.EXTRA_SHOW_HOME, true)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        restCountDownTimer?.cancel()
    }

    companion object {
        /** Datos de la rutina a entrenar. Todos opcionales: sin ellos la sesión es libre. */
        const val EXTRA_ROUTINE_ID = "EXTRA_ROUTINE_ID"
        const val EXTRA_ROUTINE_TITLE = "EXTRA_ROUTINE_TITLE"
        const val EXTRA_EXERCISES = "EXTRA_EXERCISES"

        private const val DEFAULT_SETS_PER_EXERCISE = 3
        private const val DEFAULT_REPS_PER_SET = 10
        private const val DIALOG_WIDTH_RATIO = 0.88
    }
}