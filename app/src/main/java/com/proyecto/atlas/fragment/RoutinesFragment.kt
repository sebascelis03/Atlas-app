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
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.proyecto.atlas.MainActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.adapter.RoutineAdapter
import com.proyecto.atlas.data.RoutineRepository
import com.proyecto.atlas.databinding.DialogCreateRoutineBinding
import com.proyecto.atlas.databinding.FragmentRoutinesBinding
import com.proyecto.atlas.model.Routine

/** Pestaña "Rutinas": lista los bloques de entrenamiento y permite crear nuevos. */
class RoutinesFragment : Fragment() {

    private var _binding: FragmentRoutinesBinding? = null
    private val binding get() = _binding!!

    private lateinit var routineAdapter: RoutineAdapter

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

        setupRecyclerView()
        binding.btnCreateRoutine.setOnClickListener { showCreateRoutineDialog() }
    }

    private fun setupRecyclerView() {
        routineAdapter = RoutineAdapter(RoutineRepository.getRoutines()) { routine ->
            Toast.makeText(
                requireContext(),
                getString(R.string.routines_starting, routine.title),
                Toast.LENGTH_SHORT
            ).show()

            // MainActivity arma el entrenamiento con los datos de este bloque.
            val intent = Intent(requireContext(), MainActivity::class.java).apply {
                putExtra(MainActivity.EXTRA_ROUTINE_ID, routine.id)
                putExtra(MainActivity.EXTRA_ROUTINE_TITLE, routine.title)
                putStringArrayListExtra(
                    MainActivity.EXTRA_EXERCISES,
                    ArrayList(routine.exerciseNames)
                )
            }
            startActivity(intent)
        }

        binding.rvRoutines.layoutManager = LinearLayoutManager(requireContext())
        binding.rvRoutines.adapter = routineAdapter
    }

    /** Diálogo oscuro para registrar una rutina personalizada. */
    private fun showCreateRoutineDialog() {
        val dialog = Dialog(requireContext())
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

        val dialogBinding = DialogCreateRoutineBinding.inflate(layoutInflater)
        dialog.setContentView(dialogBinding.root)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        dialogBinding.etRoutineName.doAfterTextChanged {
            dialogBinding.tilRoutineName.error = null
        }
        dialogBinding.etRoutineMuscles.doAfterTextChanged {
            dialogBinding.tilRoutineMuscles.error = null
        }

        dialogBinding.btnCancelRoutine.setOnClickListener { dialog.dismiss() }

        dialogBinding.btnSaveRoutine.setOnClickListener {
            val name = dialogBinding.etRoutineName.text?.toString()?.trim().orEmpty()
            val muscles = dialogBinding.etRoutineMuscles.text?.toString()?.trim().orEmpty()

            var isValid = true
            if (name.isEmpty()) {
                dialogBinding.tilRoutineName.error = getString(R.string.routines_error_empty_name)
                isValid = false
            }
            if (muscles.isEmpty()) {
                dialogBinding.tilRoutineMuscles.error =
                    getString(R.string.routines_error_empty_muscles)
                isValid = false
            }
            if (!isValid) return@setOnClickListener

            saveRoutine(name, muscles)
            dialog.dismiss()
        }

        dialog.show()

        // Sin ancho explícito el Dialog se encoge al contenido y corta los textos.
        val width = (resources.displayMetrics.widthPixels * DIALOG_WIDTH_RATIO).toInt()
        dialog.window?.setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    private fun saveRoutine(name: String, muscles: String) {
        RoutineRepository.addRoutine(
            Routine(
                id = RoutineRepository.nextId(),
                title = name,
                muscleGroups = muscles,
                exerciseCount = 0,
                estimatedMinutes = 0
            )
        )

        routineAdapter.submitList(RoutineRepository.getRoutines())
        binding.rvRoutines.scrollToPosition(routineAdapter.itemCount - 1)

        Toast.makeText(
            requireContext(),
            getString(R.string.routines_created, name),
            Toast.LENGTH_SHORT
        ).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val DIALOG_WIDTH_RATIO = 0.88
    }
}
