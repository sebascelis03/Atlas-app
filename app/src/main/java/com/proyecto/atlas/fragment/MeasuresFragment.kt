package com.proyecto.atlas.fragment

import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.LinearLayout
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.proyecto.atlas.R
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.data.BodyRepository
import com.proyecto.atlas.databinding.DialogEditWeightBinding
import com.proyecto.atlas.databinding.FragmentMeasuresBinding
import com.proyecto.atlas.databinding.ItemMeasureTileBinding
import com.proyecto.atlas.databinding.ItemWeightLogBinding
import com.proyecto.atlas.model.MeasureSpec
import com.proyecto.atlas.ui.LineChartView
import com.proyecto.atlas.util.DateUtils
import java.util.Locale
import kotlin.math.absoluteValue

/** Pestaña "Medidas": peso corporal, IMC y medidas de cinta con fecha e historial. */
class MeasuresFragment : Fragment() {

    private var _binding: FragmentMeasuresBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMeasuresBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupButtons()
        refresh()
    }

    override fun onResume() {
        super.onResume()
        refresh()
    }

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden) refresh()
    }

    private fun refresh() {
        if (_binding == null) return
        renderWeight()
        renderBmi()
        renderMeasures()
        renderHistory()
    }

    private fun setupButtons() {
        // Los ajustes ±0.5 se guardan al instante (un solo registro por día).
        binding.btnMinusWeight.setOnClickListener { adjustWeight(-WEIGHT_STEP) }
        binding.btnPlusWeight.setOnClickListener { adjustWeight(WEIGHT_STEP) }
        binding.tvCurrentWeight.setOnClickListener { showWeightDialog() }
        binding.btnHeight.setOnClickListener { showHeightDialog() }
    }

    // --- Peso ---

    private fun currentWeight(): Double? =
        BodyRepository.latestWeight()
            ?: AuthRepository.getCurrentUser()?.weight?.takeIf { it > 0.0 }

    private fun adjustWeight(step: Double) {
        val base = currentWeight() ?: return showWeightDialog()
        saveWeight((base + step).coerceIn(MIN_WEIGHT, MAX_WEIGHT))
    }

    private fun saveWeight(weightKg: Double) {
        BodyRepository.saveWeight(weightKg)
        refresh()
    }

    private fun renderWeight() {
        val weight = currentWeight()
        binding.tvCurrentWeight.text = if (weight != null) {
            getString(R.string.progress_weight_value, fmt(weight))
        } else {
            getString(R.string.progress_weight_unset)
        }

        renderDelta(weight)
        renderDistanceToGoal(weight)

        val points = BodyRepository.weightSeries().takeLast(MAX_CHART_POINTS)
            .map { (date, value) -> LineChartView.Point(DateUtils.short(date), value) }
        binding.chartWeight.setData(points, "kg", getString(R.string.measures_chart_empty))
    }

    /** Variación frente al pesaje anterior: verde si acerca a la meta, naranja si aleja. */
    private fun renderDelta(weight: Double?) {
        val previous = BodyRepository.previousWeight()
        val latest = BodyRepository.latestWeight()
        if (weight == null || previous == null || latest == null) {
            binding.tvWeightDelta.visibility = View.GONE
            return
        }
        val delta = latest - previous
        binding.tvWeightDelta.visibility = View.VISIBLE
        binding.tvWeightDelta.text = getString(R.string.progress_delta, signed(delta))
        binding.tvWeightDelta.setTextColor(
            ContextCompat.getColor(
                requireContext(),
                weightDeltaColor(delta, previous, AuthRepository.getCurrentUser()?.targetWeight)
            )
        )
    }

    private fun weightDeltaColor(delta: Double, previous: Double, target: Double?): Int = when {
        target == null || target <= 0.0 || delta == 0.0 -> R.color.text_secondary
        (target - previous).absoluteValue > (target - (previous + delta)).absoluteValue -> R.color.primary_neon
        else -> R.color.accent_orange
    }

    private fun renderDistanceToGoal(weight: Double?) {
        val target = AuthRepository.getCurrentUser()?.targetWeight

        if (weight == null) {
            binding.tvWeightToGoal.text = ""
            return
        }
        if (target == null || target <= 0.0) {
            binding.tvWeightToGoal.setText(R.string.progress_no_goal)
            return
        }

        val difference = target - weight
        binding.tvWeightToGoal.text = when {
            difference.absoluteValue < GOAL_TOLERANCE -> getString(R.string.progress_goal_reached)
            difference < 0 -> getString(R.string.progress_to_goal_lose, fmt(difference.absoluteValue))
            else -> getString(R.string.progress_to_goal_gain, fmt(difference))
        }
    }

    // --- IMC ---

    private fun renderBmi() {
        val height = BodyRepository.getHeightCm()
        val weight = currentWeight()

        binding.btnHeight.text = if (height != null) {
            getString(R.string.measures_height_value, fmtInt(height))
        } else {
            getString(R.string.measures_height_add)
        }

        if (height == null || weight == null) {
            binding.tvBmiValue.text = "—"
            binding.tvBmiLabel.setText(
                if (height == null) R.string.measures_bmi_need_height else R.string.measures_bmi_need_weight
            )
            return
        }

        val meters = height / 100.0
        val bmi = weight / (meters * meters)
        binding.tvBmiValue.text = String.format(Locale.US, "%.1f", bmi)
        binding.tvBmiLabel.setText(
            when {
                bmi < 18.5 -> R.string.measures_bmi_low
                bmi < 25.0 -> R.string.measures_bmi_normal
                bmi < 30.0 -> R.string.measures_bmi_over
                else -> R.string.measures_bmi_high
            }
        )
    }

    // --- Medidas de cinta ---

    private fun renderMeasures() {
        val container = binding.layoutMeasures
        container.removeAllViews()

        BodyRepository.MEASURES.chunked(2).forEach { pair ->
            val row = LinearLayout(requireContext()).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEach { spec -> row.addView(buildMeasureTile(spec, row)) }
            container.addView(row)
        }
    }

    private fun buildMeasureTile(spec: MeasureSpec, parent: ViewGroup): View {
        val tile = ItemMeasureTileBinding.inflate(layoutInflater, parent, false)
        val (latest, previous) = BodyRepository.measureLatestAndPrevious(spec.key)

        tile.tvMeasureLabel.text = spec.label
        tile.tvMeasureValue.text = if (latest != null) {
            getString(R.string.measures_cm_value, fmt(latest))
        } else {
            "—"
        }

        if (latest != null && previous != null) {
            val delta = latest - previous
            tile.tvMeasureDelta.visibility = View.VISIBLE
            tile.tvMeasureDelta.text = getString(R.string.measures_cm_delta, signed(delta))
            tile.tvMeasureDelta.setTextColor(
                ContextCompat.getColor(requireContext(), measureDeltaColor(spec.key, delta))
            )
        } else {
            tile.tvMeasureDelta.visibility = View.VISIBLE
            tile.tvMeasureDelta.setText(
                if (latest == null) R.string.measures_tap_to_add else R.string.measures_first_record
            )
            tile.tvMeasureDelta.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_muted))
        }

        tile.root.setOnClickListener { showMeasureDialog(spec, latest) }
        return tile.root
    }

    /** Cintura y cadera bajando es bueno; el resto sube con hipertrofia/fuerza y baja con pérdida de grasa. */
    private fun measureDeltaColor(key: String, delta: Double): Int {
        if (delta == 0.0) return R.color.text_secondary
        val goal = AuthRepository.getCurrentUser()?.goal.orEmpty()
        val lowerIsBetter = key == "cintura" || key == "cadera" || goal.startsWith("Pérdida")
        val good = if (lowerIsBetter) delta < 0 else delta > 0
        return if (good) R.color.primary_neon else R.color.accent_orange
    }

    // --- Historial ---

    private fun renderHistory() {
        val container = binding.layoutBodyHistory
        container.removeAllViews()

        val history = BodyRepository.history()
        binding.tvHistoryEmpty.visibility = if (history.isEmpty()) View.VISIBLE else View.GONE

        // Variación de peso de cada fecha frente al pesaje anterior.
        val deltas = HashMap<String, Double>()
        var last: Double? = null
        BodyRepository.weightSeries().forEach { (date, value) ->
            last?.let { deltas[date] = value - it }
            last = value
        }

        history.take(MAX_HISTORY_ROWS).forEach { entry ->
            val row = ItemWeightLogBinding.inflate(layoutInflater, container, false)
            row.tvLogDate.text = if (entry.dateKey == DateUtils.today()) {
                getString(R.string.measures_today)
            } else {
                DateUtils.short(entry.dateKey)
            }

            row.tvLogInfo.text = if (entry.measures.isEmpty()) {
                getString(R.string.measures_only_weight)
            } else {
                resources.getQuantityString(R.plurals.measures_count, entry.measures.size, entry.measures.size)
            }

            row.tvLogWeight.text = entry.weightKg?.let {
                getString(R.string.progress_weight_value, fmt(it))
            } ?: "—"

            val delta = deltas[entry.dateKey]
            if (delta == null) {
                row.tvLogDelta.visibility = View.GONE
            } else {
                row.tvLogDelta.visibility = View.VISIBLE
                row.tvLogDelta.text = getString(R.string.progress_delta, signed(delta))
                row.tvLogDelta.setTextColor(
                    ContextCompat.getColor(requireContext(), R.color.text_secondary)
                )
            }
            container.addView(row.root)
        }
    }

    // --- Diálogos numéricos ---

    private fun showWeightDialog() = showNumberDialog(
        title = getString(R.string.progress_edit_weight_title),
        subtitle = "",
        suffix = "kg",
        initial = currentWeight(),
        min = MIN_WEIGHT,
        max = MAX_WEIGHT,
        errorRes = R.string.goals_error_invalid_target
    ) { saveWeight(it) }

    private fun showHeightDialog() = showNumberDialog(
        title = getString(R.string.measures_height_title),
        subtitle = getString(R.string.measures_height_subtitle),
        suffix = "cm",
        initial = BodyRepository.getHeightCm(),
        min = MIN_HEIGHT,
        max = MAX_HEIGHT,
        errorRes = R.string.measures_error_height
    ) {
        BodyRepository.setHeightCm(it)
        refresh()
    }

    private fun showMeasureDialog(spec: MeasureSpec, current: Double?) = showNumberDialog(
        title = spec.label,
        subtitle = getString(R.string.measures_dialog_subtitle),
        suffix = "cm",
        initial = current,
        min = MIN_MEASURE,
        max = MAX_MEASURE,
        errorRes = R.string.measures_error_measure
    ) {
        BodyRepository.saveMeasure(spec.key, it)
        Toast.makeText(
            requireContext(),
            getString(R.string.measures_saved, spec.label, fmt(it)),
            Toast.LENGTH_SHORT
        ).show()
        refresh()
    }

    /** Diálogo con teclado numérico; valida el rango y entrega el valor al guardar. */
    private fun showNumberDialog(
        title: String,
        subtitle: String,
        suffix: String,
        initial: Double?,
        min: Double,
        max: Double,
        errorRes: Int,
        onSave: (Double) -> Unit
    ) {
        val dialog = Dialog(requireContext())
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

        val dialogBinding = DialogEditWeightBinding.inflate(layoutInflater)
        dialog.setContentView(dialogBinding.root)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        dialogBinding.tvNumberTitle.text = title
        dialogBinding.tvNumberSubtitle.text = subtitle
        dialogBinding.tvNumberSubtitle.visibility = if (subtitle.isEmpty()) View.GONE else View.VISIBLE
        dialogBinding.tilExactWeight.suffixText = suffix

        if (initial != null) {
            dialogBinding.etExactWeight.setText(fmt(initial))
            dialogBinding.etExactWeight.setSelection(dialogBinding.etExactWeight.text?.length ?: 0)
        }

        dialogBinding.btnCancelExactWeight.setOnClickListener { dialog.dismiss() }
        dialogBinding.btnApplyExactWeight.setOnClickListener {
            val raw = dialogBinding.etExactWeight.text?.toString()?.trim().orEmpty()
            val value = raw.replace(',', '.').toDoubleOrNull()

            if (value == null || value < min || value > max) {
                dialogBinding.tilExactWeight.error = getString(errorRes)
                return@setOnClickListener
            }
            dialog.dismiss()
            onSave(value)
        }

        dialog.show()

        // Sin ancho explícito el Dialog se encoge al contenido y corta los textos.
        val width = (resources.displayMetrics.widthPixels * DIALOG_WIDTH_RATIO).toInt()
        dialog.window?.setLayout(width, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    // --- Formato ---

    private fun fmt(value: Double): String = String.format(Locale.US, "%.1f", value)
    private fun fmtInt(value: Double): String = String.format(Locale.US, "%.0f", value)
    private fun signed(value: Double): String = String.format(Locale.US, "%+.1f", value)

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val WEIGHT_STEP = 0.5
        const val MIN_WEIGHT = 30.0
        const val MAX_WEIGHT = 300.0
        const val MIN_HEIGHT = 100.0
        const val MAX_HEIGHT = 250.0
        const val MIN_MEASURE = 5.0
        const val MAX_MEASURE = 250.0
        const val GOAL_TOLERANCE = 0.05
        const val MAX_CHART_POINTS = 30
        const val MAX_HISTORY_ROWS = 8
        const val DIALOG_WIDTH_RATIO = 0.88
    }
}
