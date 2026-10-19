package com.proyecto.atlas.adapter

import android.graphics.Color
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.proyecto.atlas.R
import com.proyecto.atlas.databinding.ItemWorkoutExerciseBinding
import com.proyecto.atlas.databinding.ItemWorkoutSetBinding
import com.proyecto.atlas.model.WorkoutExercise
import com.proyecto.atlas.model.WorkoutSet

class WorkoutExerciseAdapter(
    private val workoutExercises: MutableList<WorkoutExercise>,
    private val onStatsChanged: () -> Unit,
    private val onSetCompleted: (WorkoutSet) -> Unit,
    private val onExerciseDeleted: (Int) -> Unit
) : RecyclerView.Adapter<WorkoutExerciseAdapter.ExerciseViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ExerciseViewHolder {
        val binding = ItemWorkoutExerciseBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ExerciseViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ExerciseViewHolder, position: Int) {
        holder.bind(workoutExercises[position], position)
    }

    override fun getItemCount(): Int = workoutExercises.size

    inner class ExerciseViewHolder(private val binding: ItemWorkoutExerciseBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(workoutExercise: WorkoutExercise, position: Int) {
            val context = binding.root.context
            val exercise = workoutExercise.exercise

            binding.tvExerciseName.text = exercise.name
            binding.tvMuscleGroup.text = exercise.muscleGroup.uppercase()
            binding.tvEquipment.text = exercise.equipment

            binding.btnDeleteExercise.setOnClickListener {
                val pos = adapterPosition
                if (pos != RecyclerView.NO_POSITION) {
                    onExerciseDeleted(pos)
                }
            }

            renderSets(workoutExercise)

            binding.btnAddSet.setOnClickListener {
                val nextSetNumber = workoutExercise.sets.size + 1
                val lastSet = workoutExercise.sets.lastOrNull()
                val prevInfo = if (lastSet != null && lastSet.weightKg > 0) {
                    "${lastSet.weightKg} kg × ${lastSet.reps}"
                } else {
                    "-"
                }

                val newSet = WorkoutSet(
                    setNumber = nextSetNumber,
                    previousInfo = prevInfo,
                    weightKg = lastSet?.weightKg ?: 0.0,
                    reps = lastSet?.reps ?: 0,
                    isCompleted = false
                )

                workoutExercise.sets.add(newSet)
                renderSets(workoutExercise)
                onStatsChanged()
            }
        }

        private fun renderSets(workoutExercise: WorkoutExercise) {
            val context = binding.root.context
            val inflater = LayoutInflater.from(context)
            binding.llSetsContainer.removeAllViews()

            workoutExercise.sets.forEachIndexed { index, set ->
                set.setNumber = index + 1
                val setBinding = ItemWorkoutSetBinding.inflate(inflater, binding.llSetsContainer, false)

                setBinding.tvSetNumber.text = set.setNumber.toString()
                setBinding.tvPrevious.text = set.previousInfo

                if (set.weightKg > 0) {
                    setBinding.etWeight.setText(
                        if (set.weightKg % 1.0 == 0.0) set.weightKg.toInt().toString() else set.weightKg.toString()
                    )
                } else {
                    setBinding.etWeight.text = null
                }

                if (set.reps > 0) {
                    setBinding.etReps.setText(set.reps.toString())
                } else {
                    setBinding.etReps.text = null
                }

                setBinding.etWeight.addTextChangedListener(object : TextWatcher {
                    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                        set.weightKg = s?.toString()?.toDoubleOrNull() ?: 0.0
                        onStatsChanged()
                    }
                    override fun afterTextChanged(s: Editable?) {}
                })

                setBinding.etReps.addTextChangedListener(object : TextWatcher {
                    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                        set.reps = s?.toString()?.toIntOrNull() ?: 0
                        onStatsChanged()
                    }
                    override fun afterTextChanged(s: Editable?) {}
                })

                updateCheckState(setBinding, set)

                setBinding.btnCompleteSet.setOnClickListener {
                    set.isCompleted = !set.isCompleted
                    updateCheckState(setBinding, set)
                    if (set.isCompleted) {
                        onSetCompleted(set)
                    }
                    onStatsChanged()
                }

                binding.llSetsContainer.addView(setBinding.root)
            }
        }

        private fun updateCheckState(setBinding: ItemWorkoutSetBinding, set: WorkoutSet) {
            val context = setBinding.root.context
            setBinding.btnCompleteSet.isSelected = set.isCompleted
            if (set.isCompleted) {
                setBinding.ivCheck.setColorFilter(Color.parseColor("#0E1117"))
            } else {
                setBinding.ivCheck.setColorFilter(ContextCompat.getColor(context, R.color.text_muted))
            }
        }
    }
}
