package com.proyecto.atlas.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.proyecto.atlas.MainActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.adapter.RoutineAdapter
import com.proyecto.atlas.data.ExerciseRepository
import com.proyecto.atlas.data.RoutineRepository
import com.proyecto.atlas.databinding.BottomSheetRoutinePreviewBinding
import com.proyecto.atlas.databinding.DialogCreateRoutineBinding
import com.proyecto.atlas.databinding.FragmentRoutinesBinding
import com.proyecto.atlas.model.Routine

/** Pestaña "Rutinas": biblioteca filtrable con vista previa, edición y creación. */
class RoutinesFragment : Fragment() {

    private var _binding: FragmentRoutinesBinding? = null
    private val binding get() = _binding!!

    private lateinit var routineAdapter: RoutineAdapter
    private var selectedGroup = ALL

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRoutinesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupFilters()
        setupList()
        binding.btnCreateRoutine.setOnClickListener { showEditor(null) }
        refresh()
    }

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden) refresh()
    }

    private fun setupFilters() {
        val group = binding.chipGroupFilter
        val idToGroup = HashMap<Int, String>()

        ExerciseRepository.getMuscleGroups().forEach { name ->
            val chip = layoutInflater.inflate(R.layout.item_goal_chip, group, false) as Chip
            chip.id = View.generateViewId()
            chip.text = name
            chip.isChecked = name == selectedGroup
            idToGroup[chip.id] = name
            group.addView(chip)
        }

        group.setOnCheckedStateChangeListener { _, checkedIds ->
            val id = checkedIds.firstOrNull() ?: return@setOnCheckedStateChangeListener
            selectedGroup = idToGroup[id] ?: ALL
            refresh()
        }
    }

    private fun setupList() {
        routineAdapter = RoutineAdapter(
            onOpenRoutine = { routine -> showPreview(routine) },
            onStartRoutine = { routine -> startRoutine(routine) }
        )
        binding.rvRoutines.layoutManager = LinearLayoutManager(requireContext())
        binding.rvRoutines.adapter = routineAdapter
    }

    private fun refresh() {
        if (_binding == null) return

        val all = RoutineRepository.getRoutines()
        val visible = if (selectedGroup == ALL) {
            all
        } else {
            all.filter { selectedGroup in RoutineRepository.groupsOf(it) }
        }

        routineAdapter.submitList(visible)
        binding.tvRoutinesCount.text =
            resources.getQuantityString(R.plurals.routines_count, all.size, all.size)
        binding.tvRoutinesEmpty.visibility = if (visible.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun startRoutine(routine: Routine) {
        startActivity(MainActivity.intentFor(requireContext(), routine))
    }

    // --- Vista previa ---

    private fun showPreview(routine: Routine) {
        val sheet = BottomSheetDialog(requireContext())
        val sheetBinding = BottomSheetRoutinePreviewBinding.inflate(layoutInflater)
        sheet.setContentView(sheetBinding.root)

        sheetBinding.tvPreviewTitle.text = routine.title
        sheetBinding.tvPreviewMuscles.text = routine.muscleGroups
        sheetBinding.tvPreviewMeta.text =
            getString(R.string.routines_metrics, routine.exerciseCount, routine.estimatedMinutes)

        sheetBinding.tvPreviewEmpty.visibility =
            if (routine.exerciseNames.isEmpty()) View.VISIBLE else View.GONE

        routine.exerciseNames.forEachIndexed { index, name ->
            val row = TextView(requireContext()).apply {
                text = getString(R.string.routines_preview_row, index + 1, name)
                setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                textSize = 15f
                setPadding(0, px(10), 0, px(10))
            }
            sheetBinding.layoutPreviewExercises.addView(row)
        }

        sheetBinding.btnPreviewStart.setOnClickListener {
            sheet.dismiss()
            startRoutine(routine)
        }
        sheetBinding.btnPreviewEdit.setOnClickListener {
            sheet.dismiss()
            showEditor(routine)
        }

        // Borrar pide un segundo toque para evitar accidentes.
        var armed = false
        sheetBinding.btnPreviewDelete.setOnClickListener {
            if (!armed) {
                armed = true
                sheetBinding.btnPreviewDelete.setText(R.string.routines_preview_delete_confirm)
            } else {
                RoutineRepository.deleteRoutine(routine.id)
                sheet.dismiss()
                refresh()
                Toast.makeText(
                    requireContext(),
                    getString(R.string.routines_deleted, routine.title),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }

        sheet.show()
    }

    // --- Crear / editar ---

    /** Hoja con nombre, músculos y ejercicios del catálogo. `existing == null` crea una rutina. */
    private fun showEditor(existing: Routine?) {
        val sheet = BottomSheetDialog(requireContext())
        val sheetBinding = DialogCreateRoutineBinding.inflate(layoutInflater)
        sheet.setContentView(sheetBinding.root)
        // Con teclado abierto la hoja debe poder desplazarse completa.
        sheet.behavior.skipCollapsed = true

        sheetBinding.tvEditorTitle.setText(
            if (existing == null) R.string.routines_dialog_title else R.string.routines_dialog_title_edit
        )
        existing?.let {
            sheetBinding.etRoutineName.setText(it.title)
            sheetBinding.etRoutineMuscles.setText(it.muscleGroups)
        }

        sheetBinding.etRoutineName.doAfterTextChanged { sheetBinding.tilRoutineName.error = null }
        sheetBinding.etRoutineMuscles.doAfterTextChanged { sheetBinding.tilRoutineMuscles.error = null }

        // Chips de ejercicios agrupados por músculo.
        val chipToExercise = LinkedHashMap<Chip, String>()
        val preselected = existing?.exerciseNames.orEmpty().map { it.lowercase() }.toSet()

        fun updateCount() {
            val count = chipToExercise.keys.count { it.isChecked }
            sheetBinding.tvExercisesCount.text =
                resources.getQuantityString(R.plurals.routines_selected, count, count)
        }

        ExerciseRepository.getMuscleGroups().filter { it != ALL }.forEach { muscle ->
            val header = TextView(requireContext()).apply {
                text = muscle
                setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
                textSize = 12f
                setPadding(0, px(18), 0, px(6))
            }
            sheetBinding.layoutExerciseGroups.addView(header)

            val chips = ChipGroup(requireContext()).apply {
                isSingleSelection = false
                chipSpacingHorizontal = px(8)
                chipSpacingVertical = px(0)
            }
            ExerciseRepository.defaultExercises.filter { it.muscleGroup == muscle }.forEach { exercise ->
                val chip = layoutInflater.inflate(R.layout.item_goal_chip, chips, false) as Chip
                chip.text = exercise.name
                chip.isChecked = exercise.name.lowercase() in preselected
                chip.setOnCheckedChangeListener { _, _ -> updateCount() }
                chipToExercise[chip] = exercise.name
                chips.addView(chip)
            }
            sheetBinding.layoutExerciseGroups.addView(chips)
        }
        updateCount()

        sheetBinding.btnCancelRoutine.setOnClickListener { sheet.dismiss() }
        sheetBinding.btnSaveRoutine.setOnClickListener {
            val name = sheetBinding.etRoutineName.text?.toString()?.trim().orEmpty()
            val muscles = sheetBinding.etRoutineMuscles.text?.toString()?.trim().orEmpty()

            var isValid = true
            if (name.isEmpty()) {
                sheetBinding.tilRoutineName.error = getString(R.string.routines_error_empty_name)
                isValid = false
            }
            if (muscles.isEmpty()) {
                sheetBinding.tilRoutineMuscles.error = getString(R.string.routines_error_empty_muscles)
                isValid = false
            }
            if (!isValid) return@setOnClickListener

            val exercises = chipToExercise.filter { it.key.isChecked }.values.toList()
            val routine = Routine(
                id = existing?.id ?: RoutineRepository.newId(),
                title = name,
                muscleGroups = muscles,
                exerciseCount = exercises.size,
                estimatedMinutes = RoutineRepository.estimateMinutes(exercises.size),
                exerciseNames = exercises
            )

            if (existing == null) RoutineRepository.addRoutine(routine)
            else RoutineRepository.updateRoutine(routine)

            sheet.dismiss()
            refresh()
            Toast.makeText(
                requireContext(),
                getString(
                    if (existing == null) R.string.routines_created else R.string.routines_updated,
                    name
                ),
                Toast.LENGTH_SHORT
            ).show()
        }

        sheet.show()
    }

    private fun px(dp: Int): Int = (dp * resources.displayMetrics.density).toInt()

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val ALL = "Todos"
    }
}
