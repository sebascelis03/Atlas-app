package com.proyecto.atlas.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.proyecto.atlas.R
import com.proyecto.atlas.databinding.ItemRoutineCardBinding
import com.proyecto.atlas.model.Routine

class RoutineAdapter(
    private var routines: List<Routine>,
    private val onStartRoutine: (Routine) -> Unit
) : RecyclerView.Adapter<RoutineAdapter.RoutineViewHolder>() {

    /** Reemplaza la lista completa (ej. tras crear una rutina nueva). */
    fun submitList(newRoutines: List<Routine>) {
        routines = newRoutines
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RoutineViewHolder {
        val binding = ItemRoutineCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RoutineViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RoutineViewHolder, position: Int) {
        holder.bind(routines[position])
    }

    override fun getItemCount(): Int = routines.size

    inner class RoutineViewHolder(private val binding: ItemRoutineCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(routine: Routine) {
            binding.tvRoutineTitle.text = routine.title
            binding.tvMuscleGroups.text = routine.muscleGroups
            binding.tvRoutineMetrics.text = binding.root.context.getString(
                R.string.routines_metrics,
                routine.exerciseCount,
                routine.estimatedMinutes
            )

            binding.btnStartRoutine.setOnClickListener { onStartRoutine(routine) }
            binding.root.setOnClickListener { onStartRoutine(routine) }
        }
    }
}
