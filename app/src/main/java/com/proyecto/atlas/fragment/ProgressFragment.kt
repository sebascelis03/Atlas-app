package com.proyecto.atlas.fragment

import android.app.Dialog
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
import com.proyecto.atlas.R
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.databinding.DialogEditWeightBinding
import com.proyecto.atlas.databinding.FragmentProgressBinding
import com.proyecto.atlas.databinding.ItemWeightLogBinding
import java.util.Locale
import kotlin.math.absoluteValue

/** Pestaña "Progreso": registro rápido de peso corporal e hidratación del día. */
class ProgressFragment : Fragment() {

    private var _binding: FragmentProgressBinding? = null
    private val binding get() = _binding!!

    /** Peso en edición; solo se persiste al pulsar "Guardar peso de hoy". */
    private var draftWeight: Double = 0.0

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProgressBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        draftWeight = savedInstanceState?.getDouble(STATE_DRAFT_WEIGHT)
            ?: MetricsRepository.getPesoBase()

        renderWeight()
        renderWater()
        renderHistory()
        setupButtons()
    }

    private fun setupButtons() {
        // Sin un peso de partida los ajustes rápidos no tienen sentido:
        // el primer valor se escribe en el diálogo.
        binding.btnMinusWeight.setOnClickListener {
            if (!hasWeight()) return@setOnClickListener showExactWeightDialog()
            draftWeight = (draftWeight - WEIGHT_STEP).coerceAtLeast(MIN_WEIGHT)
            renderWeight()
        }

        binding.btnPlusWeight.setOnClickListener {
            if (!hasWeight()) return@setOnClickListener showExactWeightDialog()
            draftWeight = (draftWeight + WEIGHT_STEP).coerceAtMost(MAX_WEIGHT)
            renderWeight()
        }

        binding.tvCurrentWeight.setOnClickListener { showExactWeightDialog() }

        binding.btnSaveWeight.setOnClickListener {
            if (!hasWeight()) return@setOnClickListener showExactWeightDialog()

            MetricsRepository.updateWeight(draftWeight)
            renderHistory()
            Toast.makeText(
                requireContext(),
                getString(R.string.progress_weight_saved, formatWeight(draftWeight)),
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.btnMinusWater.setOnClickListener {
            MetricsRepository.decrementWater()
            renderWater()
        }

        binding.btnPlusWater.setOnClickListener {
            MetricsRepository.incrementWater()
            renderWater()
        }
    }

    private fun hasWeight(): Boolean = draftWeight > 0.0

    /** Diálogo con teclado numérico para escribir el peso exacto. */
    private fun showExactWeightDialog() {
        val dialog = Dialog(requireContext())
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

        val dialogBinding = DialogEditWeightBinding.inflate(layoutInflater)
        dialog.setContentView(dialogBinding.root)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        if (hasWeight()) {
            dialogBinding.etExactWeight.setText(formatWeight(draftWeight))
            dialogBinding.etExactWeight.setSelection(
                dialogBinding.etExactWeight.text?.length ?: 0
            )
        }

        dialogBinding.btnCancelExactWeight.setOnClickListener { dialog.dismiss() }

        dialogBinding.btnApplyExactWeight.setOnClickListener {
            val raw = dialogBinding.etExactWeight.text?.toString()?.trim().orEmpty()
            val value = raw.replace(',', '.').toDoubleOrNull()

            if (value == null || value < MIN_WEIGHT || value > MAX_WEIGHT) {
                dialogBinding.tilExactWeight.error =
                    getString(R.string.goals_error_invalid_target)
                return@setOnClickListener
            }

            draftWeight = value
            renderWeight()
            dialog.dismiss()
        }

        dialog.show()

        // Sin ancho explícito el Dialog se encoge al contenido y corta los textos.
        val width = (resources.displayMetrics.widthPixels * DIALOG_WIDTH_RATIO).toInt()
        dialog.window?.setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    private fun renderWeight() {
        binding.tvCurrentWeight.text = if (draftWeight > 0.0) {
            getString(R.string.progress_weight_value, formatWeight(draftWeight))
        } else {
            getString(R.string.progress_weight_unset)
        }
        renderDistanceToGoal()
    }

    /** Mensaje dinámico con la distancia al peso meta del usuario. */
    private fun renderDistanceToGoal() {
        val targetWeight = AuthRepository.getCurrentUser()?.targetWeight

        if (draftWeight <= 0.0) {
            binding.tvWeightToGoal.text = ""
            return
        }

        if (targetWeight == null || targetWeight <= 0.0) {
            binding.tvWeightToGoal.setText(R.string.progress_no_goal)
            return
        }

        val difference = targetWeight - draftWeight
        binding.tvWeightToGoal.text = when {
            difference.absoluteValue < GOAL_TOLERANCE ->
                getString(R.string.progress_goal_reached)

            difference < 0 ->
                getString(R.string.progress_to_goal_lose, formatWeight(difference.absoluteValue))

            else ->
                getString(R.string.progress_to_goal_gain, formatWeight(difference))
        }
    }

    private fun renderWater() {
        val glasses = MetricsRepository.vasosAgua
        binding.tvWaterCount.text = resources.getQuantityString(
            R.plurals.progress_water_glasses,
            glasses,
            glasses
        )
        binding.btnMinusWater.isEnabled = glasses > 0
    }

    /**
     * Infla las filas del historial. El listado va del más reciente al más antiguo,
     * así que cada fila se compara con la siguiente para mostrar su variación.
     */
    private fun renderHistory() {
        binding.layoutWeightHistory.removeAllViews()

        val history = MetricsRepository.getWeightHistory()
        val targetWeight = AuthRepository.getCurrentUser()?.targetWeight

        binding.tvHistoryEmpty.visibility = if (history.isEmpty()) View.VISIBLE else View.GONE

        history.forEachIndexed { index, (date, weightKg) ->
            val rowBinding = ItemWeightLogBinding.inflate(
                layoutInflater,
                binding.layoutWeightHistory,
                false
            )
            rowBinding.tvLogDate.text = date
            rowBinding.tvLogWeight.text =
                getString(R.string.progress_weight_value, formatWeight(weightKg))

            val previousWeight = history.getOrNull(index + 1)?.second
            if (previousWeight == null) {
                rowBinding.tvLogDelta.visibility = View.GONE
            } else {
                val delta = weightKg - previousWeight
                rowBinding.tvLogDelta.visibility = View.VISIBLE
                rowBinding.tvLogDelta.text =
                    getString(R.string.progress_delta, formatSignedWeight(delta))
                rowBinding.tvLogDelta.setTextColor(deltaColor(delta, previousWeight, targetWeight))
            }

            binding.layoutWeightHistory.addView(rowBinding.root)
        }
    }

    /**
     * Verde si el cambio acerca al peso meta y naranja si lo aleja: bajar de peso no
     * siempre es la dirección deseada (depende del objetivo del usuario).
     */
    private fun deltaColor(delta: Double, previousWeight: Double, targetWeight: Double?): Int {
        val colorRes = when {
            targetWeight == null || delta == 0.0 -> R.color.text_secondary

            (targetWeight - previousWeight).absoluteValue >
                (targetWeight - (previousWeight + delta)).absoluteValue -> R.color.primary_neon

            else -> R.color.accent_orange
        }
        return ContextCompat.getColor(requireContext(), colorRes)
    }

    private fun formatWeight(weightKg: Double): String =
        String.format(Locale.US, "%.1f", weightKg)

    private fun formatSignedWeight(delta: Double): String =
        String.format(Locale.US, "%+.1f", delta)

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putDouble(STATE_DRAFT_WEIGHT, draftWeight)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val WEIGHT_STEP = 0.5
        const val MIN_WEIGHT = 30.0
        const val MAX_WEIGHT = 300.0
        const val GOAL_TOLERANCE = 0.05
        const val STATE_DRAFT_WEIGHT = "draft_weight"
        const val DIALOG_WIDTH_RATIO = 0.88
    }
}
