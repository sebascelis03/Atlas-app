package com.proyecto.atlas.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.proyecto.atlas.R
import com.proyecto.atlas.data.RoutineRepository
import com.proyecto.atlas.databinding.ItemRoutineCardBinding
import com.proyecto.atlas.model.Routine
import com.proyecto.atlas.util.MuscleStyle

/**
 * Lista de rutinas. Tocar la tarjeta abre la vista previa; el botón ▶ inicia el entrenamiento
 * directamente.
 */
class RoutineAdapter(
    private val onOpenRoutine: (Routine) -> Unit,
    private val onStartRoutine: (Routine) -> Unit
) : ListAdapter<Routine, RoutineAdapter.RoutineViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RoutineViewHolder {
        val binding = ItemRoutineCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RoutineViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RoutineViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RoutineViewHolder(private val binding: ItemRoutineCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(routine: Routine) {
            val context = binding.root.context

            binding.tvRoutineTitle.text = routine.title
            binding.tvMuscleGroups.text = routine.muscleGroups
            binding.tvRoutineMetrics.text = context.getString(
                R.string.routines_metrics,
                routine.exerciseCount,
                routine.estimatedMinutes
            )
            binding.viewAccent.setBackgroundColor(
                ContextCompat.getColor(
                    context,
                    MuscleStyle.colorFor(RoutineRepository.primaryGroup(routine))
                )
            )
            bindExercisePreview(routine)

            binding.btnStartRoutine.setOnClickListener { onStartRoutine(routine) }
            binding.root.setOnClickListener { onOpenRoutine(routine) }
        }

        /** Muestra los primeros ejercicios separados por puntos, o nada si está vacía. */
        private fun bindExercisePreview(routine: Routine) {
            if (routine.exerciseNames.isEmpty()) {
                binding.tvRoutineExercises.visibility = View.GONE
                return
            }

            val preview = routine.exerciseNames.take(PREVIEW_LIMIT).joinToString(" • ")
            val hasMore = routine.exerciseNames.size > PREVIEW_LIMIT

            binding.tvRoutineExercises.visibility = View.VISIBLE
            binding.tvRoutineExercises.text = if (hasMore) "$preview…" else preview
        }
    }

    private companion object {
        const val PREVIEW_LIMIT = 3

        val DIFF = object : DiffUtil.ItemCallback<Routine>() {
            override fun areItemsTheSame(oldItem: Routine, newItem: Routine) = oldItem.id == newItem.id
            override fun areContentsTheSame(oldItem: Routine, newItem: Routine) = oldItem == newItem
        }
    }
}
