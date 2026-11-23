package com.proyecto.atlas.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.proyecto.atlas.HomeContainerActivity
import com.proyecto.atlas.R
import com.proyecto.atlas.data.BodyRepository
import com.proyecto.atlas.data.WorkoutLogRepository
import com.proyecto.atlas.databinding.FragmentProgressBinding
import com.proyecto.atlas.databinding.ItemRecordRowBinding
import com.proyecto.atlas.databinding.ItemSessionLogBinding
import com.proyecto.atlas.databinding.ItemStatTileBinding
import com.proyecto.atlas.ui.BarChartView
import com.proyecto.atlas.ui.LineChartView
import com.proyecto.atlas.util.DateUtils
import java.util.Calendar
import java.util.Locale

/**
 * Pestaña "Progreso": análisis de solo lectura. Entrenamientos por periodo, tendencia de peso,
 * calendario de actividad, récords personales y últimas sesiones. Registrar peso y medidas
 * se hace en la pestaña Medidas.
 */
class ProgressFragment : Fragment() {

    private var _binding: FragmentProgressBinding? = null
    private val binding get() = _binding!!

    private var rangeDays = 7

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

        rangeDays = savedInstanceState?.getInt(STATE_RANGE) ?: 7
        binding.chipGroupRange.check(
            when (rangeDays) {
                30 -> R.id.chipRange30
                90 -> R.id.chipRange90
                else -> R.id.chipRange7
            }
        )
        binding.chipGroupRange.setOnCheckedStateChangeListener { _, ids ->
            rangeDays = when (ids.firstOrNull()) {
                R.id.chipRange30 -> 30
                R.id.chipRange90 -> 90
                else -> 7
            }
            refresh()
        }
        binding.btnGoMeasures.setOnClickListener {
            (activity as? HomeContainerActivity)?.selectTab(R.id.nav_measures)
        }
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
        renderTiles()
        renderSessionsChart()
        renderWeightTrend()
        binding.calendarActivity.setTrainedDays(WorkoutLogRepository.daysTrained())
        renderRecords()
        renderSessions()
    }

    // --- Resumen ---

    private fun renderTiles() {
        val container = binding.layoutProgressTiles
        container.removeAllViews()

        val logs = WorkoutLogRepository.inLastDays(rangeDays)
        val volume = logs.sumOf { it.volumeKg }
        val minutes = logs.sumOf { it.durationSec } / 60

        addTile(container, R.drawable.ic_fitness_center, R.color.accent_orange, logs.size.toString(), getString(R.string.progress_tile_sessions))
        addTile(container, R.drawable.ic_bolt, R.color.group_core, formatVolume(volume), getString(R.string.progress_tile_volume))
        addTile(container, R.drawable.ic_timer, R.color.accent_cyan, formatMinutes(minutes), getString(R.string.progress_tile_time))
    }

    private fun addTile(container: ViewGroup, icon: Int, tint: Int, value: String, label: String) {
        val tile = ItemStatTileBinding.inflate(layoutInflater, container, false)
        tile.ivTileIcon.setImageResource(icon)
        tile.ivTileIcon.setColorFilter(ContextCompat.getColor(requireContext(), tint))
        tile.tvTileValue.text = value
        tile.tvTileLabel.text = label
        container.addView(tile.root)
    }

    // --- Entrenamientos por periodo ---

    private fun renderSessionsChart() {
        val logs = WorkoutLogRepository.all()
        val bars = mutableListOf<BarChartView.Bar>()

        if (rangeDays == 7) {
            binding.tvChartSubtitle.setText(R.string.progress_chart_by_day)
            for (offset in 6 downTo 0) {
                val day = DateUtils.daysAgo(offset)
                val key = DateUtils.key(day)
                val letterIndex = (day.get(Calendar.DAY_OF_WEEK) + 5) % 7
                bars.add(
                    BarChartView.Bar(
                        label = DateUtils.WEEK_LETTERS[letterIndex],
                        value = logs.count { it.dateKey == key }.toFloat(),
                        highlight = offset == 0
                    )
                )
            }
        } else {
            binding.tvChartSubtitle.setText(R.string.progress_chart_by_week)
            val weeks = if (rangeDays == 30) 5 else 13
            val thisMonday = DateUtils.startOfWeek()
            for (back in weeks - 1 downTo 0) {
                val start = (thisMonday.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, -7 * back) }
                val end = (start.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, 6) }
                val startKey = DateUtils.key(start)
                val endKey = DateUtils.key(end)
                val showLabel = weeks <= 5 || back % 2 == 0
                bars.add(
                    BarChartView.Bar(
                        label = if (showLabel) DateUtils.short(startKey) else "",
                        value = logs.count { it.dateKey in startKey..endKey }.toFloat(),
                        highlight = back == 0
                    )
                )
            }
        }
        binding.chartSessions.setData(bars, minTop = 4f)
    }

    // --- Tendencia de peso ---

    private fun renderWeightTrend() {
        val from = DateUtils.key(DateUtils.daysAgo(rangeDays - 1))
        val series = BodyRepository.weightSeries().filter { it.first >= from }

        binding.chartWeightTrend.setData(
            series.map { (date, value) -> LineChartView.Point(DateUtils.short(date), value) },
            "kg",
            getString(R.string.progress_weight_empty)
        )

        binding.tvWeightSummary.text = when {
            series.isEmpty() -> getString(R.string.progress_weight_none)
            series.size == 1 -> getString(R.string.progress_weight_value, fmt(series.last().second))
            else -> getString(
                R.string.progress_weight_change,
                fmt(series.last().second),
                String.format(Locale.US, "%+.1f", series.last().second - series.first().second)
            )
        }
    }

    // --- Récords y sesiones ---

    private fun renderRecords() {
        val container = binding.layoutRecords
        container.removeAllViews()

        val records = WorkoutLogRepository.records().take(MAX_RECORDS)
        binding.tvRecordsEmpty.visibility = if (records.isEmpty()) View.VISIBLE else View.GONE

        records.forEachIndexed { index, lift ->
            val row = ItemRecordRowBinding.inflate(layoutInflater, container, false)
            row.tvRecordRank.text = (index + 1).toString()
            row.tvRecordName.text = lift.name
            row.tvRecordWeight.text = getString(R.string.progress_weight_value, fmt(lift.weightKg))
            container.addView(row.root)
        }
    }

    private fun renderSessions() {
        val container = binding.layoutSessions
        container.removeAllViews()

        val logs = WorkoutLogRepository.all().take(MAX_SESSIONS)
        binding.tvSessionsEmpty.visibility = if (logs.isEmpty()) View.VISIBLE else View.GONE

        logs.forEach { log ->
            val row = ItemSessionLogBinding.inflate(layoutInflater, container, false)
            row.tvSessionTitle.text = log.title
            row.tvSessionMeta.text = getString(
                R.string.progress_session_meta,
                formatMinutes(log.durationSec / 60),
                log.sets,
                formatVolume(log.volumeKg)
            )
            row.tvSessionDate.text = DateUtils.short(log.dateKey)
            container.addView(row.root)
        }
    }

    // --- Formato ---

    private fun fmt(value: Double): String = String.format(Locale.US, "%.1f", value)

    private fun formatVolume(volumeKg: Double): String =
        if (volumeKg >= 1000) String.format(Locale.US, "%.1f t", volumeKg / 1000.0)
        else String.format(Locale.US, "%.0f kg", volumeKg)

    private fun formatMinutes(minutes: Int): String =
        if (minutes >= 60) "${minutes / 60} h ${minutes % 60} min" else "$minutes min"

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt(STATE_RANGE, rangeDays)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private companion object {
        const val STATE_RANGE = "progress_range"
        const val MAX_RECORDS = 5
        const val MAX_SESSIONS = 8
    }
}
