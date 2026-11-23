/**
 * Motor de Gráficas Propias en HTML5 Canvas 2D (sin librerías externas).
 * Basado 1:1 en .docs/03_referencia_ui_android/03_ESPECIFICACION_GRAFICAS_E_ICONOS.md:
 * - drawBarChart (BarChartView.kt)
 * - drawLineChart (LineChartView.kt)
 * - drawActivityCalendar (ActivityCalendarView.kt)
 *
 * Soporta escalado por `window.devicePixelRatio` y lee dinámicamente los tokens CSS
 * activos para adaptarse tanto al Tema Oscuro como al Tema Claro.
 */

import { DateHelper } from '../core/date.js';

function getThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (prop, fallback) => styles.getPropertyValue(prop).trim() || fallback;
  return {
    bgDark: read('--bg-dark', '#0E1117'),
    surfaceCard: read('--surface-card', '#212631'),
    surfaceInput: read('--surface-input', '#1A1F29'),
    chartGrid: read('--chart-grid', '#2A303C'),
    accentOrange: read('--accent-orange', '#FF9100'),
    accentOrangeDim: read('--accent-orange-dim', 'rgba(255, 145, 0, 0.40)'),
    textPrimary: read('--text-primary', '#F0F3F6'),
    textSecondary: read('--text-secondary', '#A3ACB8'),
    textMuted: read('--text-muted', '#858F9C'),
    textOnAccent: read('--text-on-accent', '#0E1117'),
  };
}

/**
 * Configura el tamaño físico del canvas según devicePixelRatio y devuelve { ctx, width, height }.
 * @param {HTMLCanvasElement} canvas
 * @param {number} [explicitHeight]
 */
function prepareCanvas(canvas, explicitHeight) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(260, rect.width || canvas.parentElement?.clientWidth || 320);
  const height = explicitHeight || Math.max(120, rect.height || 160);

  canvas.style.width = '100%';
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  return { ctx, width, height };
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * 1. Gráfica de Barras (`BarChartView`)
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{ label: string, value: number, highlight?: boolean }>} bars
 * @param {{ minTop?: number, height?: number, formatValue?: (val: number) => string }} [opts]
 */
export function drawBarChart(
  canvas,
  bars = [],
  { minTop = 4, height = 180, formatValue } = {}
) {
  if (!canvas) return;
  const { ctx, width, height: h } = prepareCanvas(canvas, height);
  const colors = getThemeColors();

  if (!bars || bars.length === 0) return;

  const labelH = 22;
  const topPad = 18;
  const chartBottom = h - labelH;
  const chartH = chartBottom - topPad;
  const maxValue = Math.max(minTop, ...bars.map((b) => Number(b.value) || 0));

  // 3 Líneas guía horizontales
  ctx.strokeStyle = colors.chartGrid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 2; i++) {
    const y = topPad + (chartH * i) / 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const slot = width / bars.length;
  const barW = Math.min(slot * 0.56, 34);
  const radius = 6;

  bars.forEach((bar, index) => {
    const val = Number(bar.value) || 0;
    const cx = slot * index + slot / 2;
    const barH = val <= 0 ? 3 : chartH * (val / maxValue);

    ctx.fillStyle =
      val <= 0
        ? colors.chartGrid
        : bar.highlight
          ? colors.accentOrange
          : colors.accentOrangeDim;

    drawRoundedRect(ctx, cx - barW / 2, chartBottom - barH, barW, barH, radius);

    // Valor numérico sobre la barra
    if (val > 0 && bars.length <= 14) {
      const text =
        typeof formatValue === 'function'
          ? formatValue(val)
          : val % 1 === 0
            ? String(Math.round(val))
            : val.toFixed(1);
      ctx.fillStyle = colors.textPrimary;
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, cx, chartBottom - barH - 5);
    }

    // Etiqueta en el eje X
    if (bar.label) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = '400 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, cx, h - 6);
    }
  });
}

/**
 * 2. Gráfica de Línea con Gradiente (`LineChartView`)
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{ label: string, value: number }>} points
 * @param {{ unit?: string, emptyMessage?: string, height?: number }} [opts]
 */
export function drawLineChart(
  canvas,
  points = [],
  { unit = 'kg', emptyMessage = 'Sin registros en este periodo', height = 150 } = {}
) {
  if (!canvas) return;
  const { ctx, width: w, height: h } = prepareCanvas(canvas, height);
  const colors = getThemeColors();

  if (!points || points.length === 0) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = '400 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(emptyMessage, w / 2, h / 2);
    return;
  }

  const leftPad = 40;
  const rightPad = 10;
  const topPad = 12;
  const bottomPad = 24;
  const chartW = w - leftPad - rightPad;
  const chartH = h - topPad - bottomPad;

  const values = points.map((p) => Number(p.value) || 0);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(1.0, rawMax - rawMin);
  const minV = rawMin - span * 0.15;
  const maxV = rawMax + span * 0.15;

  // Líneas guía + valores del eje Y
  ctx.strokeStyle = colors.chartGrid;
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.textMuted;
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.textAlign = 'left';

  for (let i = 0; i <= 2; i++) {
    const y = topPad + (chartH * i) / 2;
    ctx.beginPath();
    ctx.moveTo(leftPad, y);
    ctx.lineTo(w - rightPad, y);
    ctx.stroke();

    const axisVal = maxV - ((maxV - minV) * i) / 2;
    ctx.fillText(axisVal.toFixed(0), 0, y + 4);
  }

  const xAt = (index) =>
    points.length === 1
      ? leftPad + chartW / 2
      : leftPad + (chartW * index) / (points.length - 1);

  const yAt = (val) => topPad + chartH * ((maxV - val) / (maxV - minV));

  if (points.length > 1) {
    // Relleno con gradiente bajo la curva
    const grad = ctx.createLinearGradient(0, topPad, 0, topPad + chartH);
    grad.addColorStop(0, 'rgba(255, 145, 0, 0.33)');
    grad.addColorStop(1, 'rgba(255, 145, 0, 0.0)');

    ctx.beginPath();
    points.forEach((pt, idx) => {
      const x = xAt(idx);
      const y = yAt(pt.value);
      if (idx === 0) {
        ctx.moveTo(x, topPad + chartH);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(xAt(points.length - 1), topPad + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Línea principal
    ctx.beginPath();
    points.forEach((pt, idx) => {
      const x = xAt(idx);
      const y = yAt(pt.value);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = colors.accentOrange;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // Puntos (dots)
  const showAllDots = points.length <= 12;
  points.forEach((pt, idx) => {
    if (showAllDots || idx === points.length - 1) {
      const cx = xAt(idx);
      const cy = yAt(pt.value);

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.accentOrange;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.surfaceCard;
      ctx.fill();
    }
  });

  // Etiquetas X: primera y última
  ctx.fillStyle = colors.textMuted;
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(points[0].label, leftPad, h - 5);

  if (points.length > 1) {
    ctx.textAlign = 'right';
    ctx.fillText(points[points.length - 1].label, w - rightPad, h - 5);
  }
}

/**
 * 3. Calendario de Actividad de 5 Semanas (`ActivityCalendarView`)
 * @param {HTMLCanvasElement} canvas
 * @param {Set<string>} trainedDaysSet Conjunto de claves `yyyy-MM-dd` entrenadas
 */
export function drawActivityCalendar(canvas, trainedDaysSet = new Set()) {
  if (!canvas) return;
  const weeks = 5;
  const rect = canvas.getBoundingClientRect();
  const approxWidth = Math.max(260, rect.width || canvas.parentElement?.clientWidth || 320);
  const cell = approxWidth / 7;
  const headerH = 22;
  const totalHeight = Math.round(headerH + cell * weeks);

  const { ctx, width } = prepareCanvas(canvas, totalHeight);
  const colors = getThemeColors();
  const actualCell = width / 7;
  const radius = Math.min(actualCell * 0.36, 18);

  // Cabecera L M X J V S D
  ctx.fillStyle = colors.textMuted;
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  DateHelper.WEEK_LETTERS.forEach((letter, col) => {
    ctx.fillText(letter, actualCell * col + actualCell / 2, 12);
  });

  const todayKey = DateHelper.today();
  const firstMonday = DateHelper.startOfWeek();
  firstMonday.setDate(firstMonday.getDate() - 7 * (weeks - 1));

  for (let row = 0; row < weeks; row++) {
    for (let col = 0; col < 7; col++) {
      const day = new Date(firstMonday);
      day.setDate(firstMonday.getDate() + row * 7 + col);
      const dKey = DateHelper.key(day);

      const cx = actualCell * col + actualCell / 2;
      const cy = headerH + actualCell * row + actualCell / 2;
      const isFuture = dKey > todayKey;
      const isDone = trainedDaysSet.has(dKey);

      // Relleno del círculo
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = isDone ? colors.accentOrange : colors.surfaceInput;
      ctx.fill();

      // Anillo del día de hoy
      if (dKey === todayKey) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = colors.accentOrange;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Número del día del mes
      ctx.fillStyle = isDone
        ? colors.textOnAccent
        : isFuture
          ? colors.textMuted
          : colors.textSecondary;
      ctx.font = `${isDone ? '700' : '400'} 11px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(String(day.getDate()), cx, cy + 4);
    }
  }
}
