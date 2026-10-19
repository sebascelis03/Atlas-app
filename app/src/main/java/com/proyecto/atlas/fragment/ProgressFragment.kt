package com.proyecto.atlas.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.proyecto.atlas.R
import com.proyecto.atlas.data.MetricsRepository
import com.proyecto.atlas.databinding.FragmentProgressBinding
import com.proyecto.atlas.databinding.ItemWeightLogBinding
import java.util.Locale

/** Pestaña "Progreso": registro rápido de peso corporal e hidratación del día. */
class ProgressFragment : Fragment() {

    private var _binding: FragmentProgressBinding? = null
    private val binding get() = _binding!!

    /** Peso en edición; solo se persiste al pulsar "Guardar peso de hoy". */
    private var draftWeight: Double = MetricsRepository.pesoActual

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
            ?: MetricsRepository.pesoActual

        renderWeight()
        renderWater()
        renderHistory()
        setupButtons()
    }

    private fun setupButtons() {
        binding.btnMinusWeight.setOnClickListener {
            draftWeight = (draftWeight - WEIGHT_STEP).coerceAtLeast(MIN_WEIGHT)
            renderWeight()
        }

        binding.btnPlusWeight.setOnClickListener {
            draftWeight = (draftWeight + WEIGHT_STEP).coerceAtMost(MAX_WEIGHT)
            renderWeight()
        }

        binding.btnSaveWeight.setOnClickListener {
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
            val glasses = MetricsRepository.incrementWater()
            renderWater()
            if (glasses == MetricsRepository.WATER_GOAL) {
                Toast.makeText(
                    requireContext(),
                    R.string.progress_water_goal_reached,
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun renderWeight() {
        binding.tvCurrentWeight.text =
            getString(R.string.progress_weight_value, formatWeight(draftWeight))
    }

    private fun renderWater() {
        val glasses = MetricsRepository.vasosAgua
        binding.tvWaterCount.text = getString(
            R.string.progress_water_count,
            glasses,
            MetricsRepository.WATER_GOAL
        )
        binding.progressWater.max = MetricsRepository.WATER_GOAL
        binding.progressWater.progress = glasses

        binding.btnMinusWater.isEnabled = glasses > 0
        binding.btnPlusWater.isEnabled = glasses < MetricsRepository.WATER_GOAL
    }

    /** Infla las filas del historial de pesajes dentro de la tercera tarjeta. */
    private fun renderHistory() {
        binding.layoutWeightHistory.removeAllViews()

        MetricsRepository.getWeightHistory().forEach { (date, weightKg) ->
            val rowBinding = ItemWeightLogBinding.inflate(
                layoutInflater,
                binding.layoutWeightHistory,
                false
            )
            rowBinding.tvLogDate.text = date
            rowBinding.tvLogWeight.text =
                getString(R.string.progress_weight_value, formatWeight(weightKg))
            binding.layoutWeightHistory.addView(rowBinding.root)
        }
    }

    private fun formatWeight(weightKg: Double): String =
        String.format(Locale.US, "%.1f", weightKg)

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
        const val STATE_DRAFT_WEIGHT = "draft_weight"
    }
}
