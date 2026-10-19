package com.proyecto.atlas.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.proyecto.atlas.databinding.ItemExercisePickerBinding
import com.proyecto.atlas.model.Exercise

class ExercisePickerAdapter(
    private var allExercises: List<Exercise>,
    private val onExerciseSelected: (Exercise) -> Unit
) : RecyclerView.Adapter<ExercisePickerAdapter.ExerciseViewHolder>() {

    private var filteredList: List<Exercise> = allExercises

    fun filter(query: String, muscleGroup: String) {
        filteredList = allExercises.filter { exercise ->
            val matchesQuery = query.isBlank() || exercise.name.contains(query, ignoreCase = true)
            val matchesMuscle = muscleGroup == "Todos" || exercise.muscleGroup.equals(muscleGroup, ignoreCase = true)
            matchesQuery && matchesMuscle
        }
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ExerciseViewHolder {
        val binding = ItemExercisePickerBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ExerciseViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ExerciseViewHolder, position: Int) {
        holder.bind(filteredList[position])
    }

    override fun getItemCount(): Int = filteredList.size

    inner class ExerciseViewHolder(private val binding: ItemExercisePickerBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(exercise: Exercise) {
            binding.tvPickerExerciseName.text = exercise.name
            binding.tvPickerCategory.text = "${exercise.muscleGroup} • ${exercise.equipment}"
            binding.root.setOnClickListener {
                onExerciseSelected(exercise)
            }
        }
    }
}
