package com.proyecto.atlas.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.proyecto.atlas.R
import java.util.Locale

/** Gráfica de línea sin dependencias (tendencia de peso). */
class LineChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    data class Point(val label: String, val value: Double)

    private var points: List<Point> = emptyList()
    private var unit = "kg"
    private var emptyMessage = ""

    private val accent = ContextCompat.getColor(context, R.color.accent_orange)

    private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = accent
        style = Paint.Style.STROKE
        strokeWidth = context.dp(3f)
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = accent }
    private val dotCorePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.surface_card)
    }
    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.chart_grid)
        strokeWidth = context.dp(1f)
    }
    private val axisPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.text_muted)
        textSize = context.sp(11f)
    }
    private val emptyPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.text_muted)
        textSize = context.sp(13f)
        textAlign = Paint.Align.CENTER
    }

    private val linePath = Path()
    private val fillPath = Path()

    fun setData(newPoints: List<Point>, unit: String = "kg", emptyMessage: String = "") {
        points = newPoints
        this.unit = unit
        this.emptyMessage = emptyMessage
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0f || h <= 0f) return

        if (points.isEmpty()) {
            canvas.drawText(emptyMessage, w / 2f, h / 2f, emptyPaint)
            return
        }

        val leftPad = context.dp(40f)
        val rightPad = context.dp(10f)
        val topPad = context.dp(12f)
        val bottomPad = context.dp(24f)
        val chartW = w - leftPad - rightPad
        val chartH = h - topPad - bottomPad

        val rawMin = points.minOf { it.value }
        val rawMax = points.maxOf { it.value }
        val span = (rawMax - rawMin).coerceAtLeast(1.0)
        val minV = rawMin - span * 0.15
        val maxV = rawMax + span * 0.15

        // Líneas guía + valores del eje
        for (i in 0..2) {
            val y = topPad + chartH * i / 2f
            canvas.drawLine(leftPad, y, w - rightPad, y, gridPaint)
            val value = maxV - (maxV - minV) * i / 2.0
            canvas.drawText(String.format(Locale.US, "%.0f", value), 0f, y + context.dp(4f), axisPaint)
        }

        fun xAt(index: Int): Float =
            if (points.size == 1) leftPad + chartW / 2f
            else leftPad + chartW * index / (points.size - 1).toFloat()

        fun yAt(value: Double): Float =
            topPad + chartH * ((maxV - value) / (maxV - minV)).toFloat()

        linePath.reset()
        fillPath.reset()
        points.forEachIndexed { index, point ->
            val x = xAt(index)
            val y = yAt(point.value)
            if (index == 0) {
                linePath.moveTo(x, y)
                fillPath.moveTo(x, topPad + chartH)
                fillPath.lineTo(x, y)
            } else {
                linePath.lineTo(x, y)
                fillPath.lineTo(x, y)
            }
        }
        fillPath.lineTo(xAt(points.size - 1), topPad + chartH)
        fillPath.close()

        fillPaint.shader = LinearGradient(
            0f, topPad, 0f, topPad + chartH,
            (accent and 0x00FFFFFF) or 0x55000000,
            accent and 0x00FFFFFF,
            Shader.TileMode.CLAMP
        )
        if (points.size > 1) {
            canvas.drawPath(fillPath, fillPaint)
            canvas.drawPath(linePath, linePaint)
        }

        // Puntos (si hay muchos, solo el último para no saturar)
        val showAllDots = points.size <= 12
        points.forEachIndexed { index, point ->
            if (showAllDots || index == points.size - 1) {
                canvas.drawCircle(xAt(index), yAt(point.value), context.dp(5f), dotPaint)
                canvas.drawCircle(xAt(index), yAt(point.value), context.dp(2.5f), dotCorePaint)
            }
        }

        // Etiquetas X: primera y última
        axisPaint.textAlign = Paint.Align.LEFT
        canvas.drawText(points.first().label, leftPad, h - context.dp(5f), axisPaint)
        if (points.size > 1) {
            axisPaint.textAlign = Paint.Align.RIGHT
            canvas.drawText(points.last().label, w - rightPad, h - context.dp(5f), axisPaint)
        }
        axisPaint.textAlign = Paint.Align.LEFT
    }
}
