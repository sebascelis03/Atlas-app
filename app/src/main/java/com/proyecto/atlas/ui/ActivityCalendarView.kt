package com.proyecto.atlas.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.proyecto.atlas.R
import com.proyecto.atlas.util.DateUtils
import java.util.Calendar

/**
 * Calendario de actividad: las últimas semanas (lunes a domingo) con un círculo naranja
 * en cada día entrenado y un anillo en el día de hoy.
 */
class ActivityCalendarView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    private var trainedDays: Set<String> = emptySet()

    private val weeks = 5

    private val doneFill = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.accent_orange)
    }
    private val idleFill = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.surface_input)
    }
    private val todayRing = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.accent_orange)
        style = Paint.Style.STROKE
        strokeWidth = context.dp(2f)
    }
    private val letterPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.text_muted)
        textSize = context.sp(11f)
        textAlign = Paint.Align.CENTER
    }
    private val numberPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = context.sp(11f)
        textAlign = Paint.Align.CENTER
    }

    private val doneText = ContextCompat.getColor(context, R.color.bg_dark)
    private val idleText = ContextCompat.getColor(context, R.color.text_secondary)
    private val futureText = ContextCompat.getColor(context, R.color.text_muted)

    fun setTrainedDays(days: Set<String>) {
        trainedDays = days
        invalidate()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = MeasureSpec.getSize(widthMeasureSpec)
        val cell = w / 7f
        val h = (context.dp(22f) + cell * weeks).toInt()
        setMeasuredDimension(w, h)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cell = width / 7f
        val headerH = context.dp(22f)
        val radius = (cell * 0.36f).coerceAtMost(context.dp(18f))

        DateUtils.WEEK_LETTERS.forEachIndexed { column, letter ->
            canvas.drawText(letter, cell * column + cell / 2f, context.dp(12f), letterPaint)
        }

        val todayKey = DateUtils.today()
        // Primer lunes mostrado: el de hace (weeks - 1) semanas.
        val firstMonday = DateUtils.startOfWeek().apply { add(Calendar.DAY_OF_YEAR, -7 * (weeks - 1)) }

        for (row in 0 until weeks) {
            for (column in 0 until 7) {
                val day = (firstMonday.clone() as Calendar).apply {
                    add(Calendar.DAY_OF_YEAR, row * 7 + column)
                }
                val key = DateUtils.key(day)
                val cx = cell * column + cell / 2f
                val cy = headerH + cell * row + cell / 2f
                val isFuture = key > todayKey
                val done = key in trainedDays

                canvas.drawCircle(cx, cy, radius, if (done) doneFill else idleFill)
                if (key == todayKey) canvas.drawCircle(cx, cy, radius, todayRing)

                numberPaint.color = when {
                    done -> doneText
                    isFuture -> futureText
                    else -> idleText
                }
                numberPaint.isFakeBoldText = done
                canvas.drawText(
                    day.get(Calendar.DAY_OF_MONTH).toString(),
                    cx,
                    cy + context.dp(4f),
                    numberPaint
                )
            }
        }
    }
}
