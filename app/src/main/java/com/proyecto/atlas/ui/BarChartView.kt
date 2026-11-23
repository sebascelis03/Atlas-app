package com.proyecto.atlas.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.proyecto.atlas.R
import kotlin.math.max

/** Gráfica de barras sin dependencias: una barra por periodo con su etiqueta debajo. */
class BarChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    data class Bar(val label: String, val value: Float, val highlight: Boolean = false)

    private var bars: List<Bar> = emptyList()
    private var minimumTop = 4f

    private val barPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.chart_grid)
        strokeWidth = context.dp(1f)
    }
    private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.text_muted)
        textSize = context.sp(11f)
        textAlign = Paint.Align.CENTER
    }
    private val valuePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.text_primary)
        textSize = context.sp(11f)
        textAlign = Paint.Align.CENTER
        isFakeBoldText = true
    }
    private val emptyPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.text_muted)
        textSize = context.sp(13f)
        textAlign = Paint.Align.CENTER
    }

    private val colorNormal = ContextCompat.getColor(context, R.color.accent_orange_dim)
    private val colorHighlight = ContextCompat.getColor(context, R.color.accent_orange)
    private val rect = RectF()

    /** `minTop` evita que una sola barra ocupe todo el alto cuando los valores son pequeños. */
    fun setData(newBars: List<Bar>, minTop: Float = 4f) {
        bars = newBars
        minimumTop = minTop
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (bars.isEmpty() || w <= 0f || h <= 0f) return

        val labelH = context.dp(22f)
        val topPad = context.dp(18f)
        val chartBottom = h - labelH
        val chartH = chartBottom - topPad
        val maxValue = max(minimumTop, bars.maxOf { it.value })

        // Líneas guía
        for (i in 0..2) {
            val y = topPad + chartH * i / 2f
            canvas.drawLine(0f, y, w, y, gridPaint)
        }

        val slot = w / bars.size
        val barW = (slot * 0.56f).coerceAtMost(context.dp(34f))
        val radius = context.dp(6f)

        bars.forEachIndexed { index, bar ->
            val cx = slot * index + slot / 2f
            val barH = if (bar.value <= 0f) context.dp(3f) else chartH * (bar.value / maxValue)
            rect.set(cx - barW / 2f, chartBottom - barH, cx + barW / 2f, chartBottom)
            barPaint.color = if (bar.highlight) colorHighlight else colorNormal
            if (bar.value <= 0f) barPaint.color = ContextCompat.getColor(context, R.color.chart_grid)
            canvas.drawRoundRect(rect, radius, radius, barPaint)

            if (bar.value > 0f && bars.size <= 14) {
                val text = if (bar.value % 1f == 0f) bar.value.toInt().toString() else "%.1f".format(bar.value)
                canvas.drawText(text, cx, rect.top - context.dp(5f), valuePaint)
            }
            if (bar.label.isNotEmpty()) {
                canvas.drawText(bar.label, cx, h - context.dp(6f), labelPaint)
            }
        }
    }
}
