/**
 * Pestaña 3 — Dashboard (src/screens/tabs/DashboardTab.js)
 *
 * Incluye:
 * 1. Filtros de tiempo interactivos (`7 días`, `30 días`, `90 días`).
 * 2. Métricas de progreso del periodo (Sesiones, Volumen, Tiempo entrenado y Racha).
 * 3. Gráficas en Canvas (`BarChart`): Conmutador para ver Entrenamientos por periodo
 *    o Volumen levantado (kg) por periodo.
 * 4. Evolución del peso diario (`LineChart`) + botón rápido para registrar peso.
 * 5. Calendario de actividad de las últimas 5 semanas (`ActivityCalendar`).
 * 6. Récords personales (Top 5 mejores levantamientos históricos).
 * 7. Historial detallado de sesiones (con BottomSheet de desglose completo de ejercicios y series).
 */

import {
  DailyLogService,
  DateHelper,
  WorkoutService,
} from '../../services/index.js';
import {
  drawActivityCalendar,
  drawBarChart,
  drawLineChart,
} from '../../ui/charts.js';
import { icon } from '../../ui/icons.js';
import { showBottomSheet } from '../../ui/modals.js';
import { openExactWeightDialog } from './HomeTab.js';

let selectedRangeDays = 7; // 7 | 30 | 90
let selectedBarMetric = 'sessions'; // 'sessions' | 'volume'

function formatVolume(volumeKg) {
  const v = Number(volumeKg) || 0;
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)} t`;
  }
  return `${Math.round(v)} kg`;
}

/**
 * Abre un BottomSheet con el desglose completo de una sesión del historial
 * (ejercicios realizados, series, kilos, repeticiones, duración y volumen).
 * @param {object} log
 */
function openSessionDetailSheet(log) {
  const durationText = DateHelper.formatMinutes(Math.round((log.durationSec || 0) / 60));
  const badges = [];
  if (log.isImprovised) badges.push('Improvisada');
  if (log.endedEarly) badges.push('Finalizada antes');

  const detailsHtml =
    Array.isArray(log.exerciseDetails) && log.exerciseDetails.length > 0
      ? log.exerciseDetails
          .map(
            (ex) => `
            <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span class="text-card-title">${ex.name}</span>
                <span class="text-caption" style="color:var(--primary-neon);font-weight:700;">
                  ${ex.muscleGroup || ''}
                </span>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                ${(ex.sets || [])
                  .map(
                    (s) => `
                    <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-secondary);">
                      <span>Serie ${s.setNumber}</span>
                      <span style="color:var(--text-primary);font-weight:700;">
                        ${s.weightKg} kg × ${s.reps} reps
                      </span>
                    </div>
                  `
                  )
                  .join('')}
              </div>
            </div>
          `
          )
          .join('')
      : `<p class="text-body">Registro resumido: ${log.sets} series en ${log.exercises} ejercicio(s).</p>`;

  showBottomSheet({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="text-caption">${DateHelper.short(log.dateKey)}</span>
            ${badges.map((b) => `<span class="pill pill--orange" style="padding:2px 8px;font-size:11px;">${b}</span>`).join('')}
          </div>
          <h3 class="text-screen" style="font-size:22px;margin-top:4px;">${log.title}</h3>
          <p class="text-body" style="margin-top:2px;">
            ${durationText} • ${log.sets} series • ${formatVolume(log.volumeKg)}
          </p>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;max-height:46dvh;overflow-y:auto;">
          ${detailsHtml}
        </div>

        <button type="button" id="btnCloseSessionDetail" class="btn btn-primary" style="margin-top:6px;">
          Cerrar
        </button>
      </div>
    `,
    onMount: (sheet, close) => {
      sheet.querySelector('#btnCloseSessionDetail')?.addEventListener('click', close);
    },
  });
}

/**
 * Construye los datos de barras según el rango (`7`, `30`, `90` días) y la métrica (`sessions` | `volume`).
 */
function buildBarsData(rangeDays, metric) {
  const allLogs = WorkoutService.getAllWorkouts();
  const bars = [];

  if (rangeDays === 7) {
    for (let offset = 6; offset >= 0; offset--) {
      const day = DateHelper.daysAgo(offset);
      const dKey = DateHelper.key(day);
      const letterIdx = DateHelper.weekDayIndex(day);
      const dayLogs = allLogs.filter((l) => l.dateKey === dKey);
      const value =
        metric === 'volume'
          ? dayLogs.reduce((acc, l) => acc + (Number(l.volumeKg) || 0), 0)
          : dayLogs.length;

      bars.push({
        label: DateHelper.WEEK_LETTERS[letterIdx],
        value,
        highlight: offset === 0,
      });
    }
  } else {
    const weeks = rangeDays === 30 ? 5 : 13;
    const thisMonday = DateHelper.startOfWeek();

    for (let back = weeks - 1; back >= 0; back--) {
      const start = new Date(thisMonday);
      start.setDate(thisMonday.getDate() - 7 * back);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startKey = DateHelper.key(start);
      const endKey = DateHelper.key(end);
      const showLabel = weeks <= 5 || back % 2 === 0;

      const weekLogs = allLogs.filter(
        (l) => l.dateKey >= startKey && l.dateKey <= endKey
      );
      const value =
        metric === 'volume'
          ? weekLogs.reduce((acc, l) => acc + (Number(l.volumeKg) || 0), 0)
          : weekLogs.length;

      bars.push({
        label: showLabel ? DateHelper.short(startKey) : '',
        value,
        highlight: back === 0,
      });
    }
  }

  return bars;
}

/**
 * Redibuja los 3 lienzos Canvas del Dashboard (útil al mostrar la pestaña o cambiar el tema).
 * @param {HTMLElement} container
 */
export function drawDashboardCharts(container) {
  if (!container) return;

  // 1. Gráfica de barras (Sesiones o Volumen)
  const barsCanvas = container.querySelector('#canvasSessionsVolume');
  if (barsCanvas) {
    const bars = buildBarsData(selectedRangeDays, selectedBarMetric);
    drawBarChart(barsCanvas, bars, {
      minTop: selectedBarMetric === 'volume' ? 100 : 4,
      height: 180,
      formatValue: (val) =>
        selectedBarMetric === 'volume'
          ? val >= 1000
            ? `${(val / 1000).toFixed(1)}t`
            : `${Math.round(val)}`
          : String(Math.round(val)),
    });
  }

  // 2. Gráfica de evolución de peso diario
  const weightCanvas = container.querySelector('#canvasWeightTrend');
  if (weightCanvas) {
    const series = DailyLogService.getWeightSeries(selectedRangeDays);
    const points = series.map((entry) => ({
      label: DateHelper.short(entry.dateKey),
      value: entry.weightKg,
    }));
    drawLineChart(weightCanvas, points, {
      unit: 'kg',
      emptyMessage: 'Sin pesajes registrados en este periodo',
      height: 150,
    });
  }

  // 3. Calendario de actividad (últimas 5 semanas)
  const calendarCanvas = container.querySelector('#canvasActivityCalendar');
  if (calendarCanvas) {
    drawActivityCalendar(calendarCanvas, WorkoutService.getDaysTrainedSet());
  }
}

/**
 * Renderiza la Pestaña 3 — Dashboard dentro de su contenedor.
 * @param {HTMLElement} container
 * @param {{ onWeightUpdated?: () => void }} [callbacks]
 */
export function renderDashboardTab(container, { onWeightUpdated } = {}) {
  const logsInRange = WorkoutService.getWorkoutsInLastDays(selectedRangeDays);
  const periodVolume = logsInRange.reduce(
    (acc, l) => acc + (Number(l.volumeKg) || 0),
    0
  );
  const periodMinutes = Math.round(
    logsInRange.reduce((acc, l) => acc + (Number(l.durationSec) || 0), 0) / 60
  );
  const streak = WorkoutService.getStreakDays();

  // Evolución de peso en el rango
  const weightSeries = DailyLogService.getWeightSeries(selectedRangeDays);
  let weightSummaryText = 'Registra tu peso diario para ver la evolución';
  if (weightSeries.length === 1) {
    weightSummaryText = `${weightSeries[0].weightKg.toFixed(1)} kg`;
  } else if (weightSeries.length > 1) {
    const firstW = weightSeries[0].weightKg;
    const lastW = weightSeries[weightSeries.length - 1].weightKg;
    const diff = lastW - firstW;
    const sign = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
    weightSummaryText = `${lastW.toFixed(1)} kg · ${sign} kg en el periodo`;
  }

  // Récords personales (Top 5)
  const records = WorkoutService.getPersonalRecords().slice(0, 5);
  const recordsHtml =
    records.length > 0
      ? records
          .map(
            (rec, idx) => `
            <div class="record-row">
              <span class="record-rank">${idx + 1}</span>
              <div style="flex:1;overflow:hidden;">
                <div class="text-card-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${rec.name}
                </div>
                <div class="text-caption">${DateHelper.short(rec.dateKey)}</div>
              </div>
              <span class="text-value" style="font-size:15px;color:var(--accent-orange);">
                ${rec.weightKg.toFixed(1)} kg
              </span>
            </div>
          `
          )
          .join('')
      : `<p class="text-body" style="margin-top:6px;">Aún no hay récords. Completa series con peso para verlos aquí.</p>`;

  // Últimas sesiones (hasta 10)
  const recentSessions = WorkoutService.getAllWorkouts().slice(0, 10);
  const sessionsHtml =
    recentSessions.length > 0
      ? recentSessions
          .map((log, idx) => {
            const minsText = DateHelper.formatMinutes(
              Math.max(1, Math.round((log.durationSec || 0) / 60))
            );
            const tag = log.endedEarly
              ? ' · Finalizada antes'
              : log.isImprovised
                ? ' · Improvisada'
                : '';
            return `
              <button type="button" class="session-row" data-session-idx="${idx}">
                <div style="flex:1;overflow:hidden;">
                  <div class="text-card-title" style="font-size:14px;">
                    ${log.title}
                  </div>
                  <div class="text-caption" style="margin-top:2px;">
                    ${minsText} • ${log.sets} series • ${formatVolume(log.volumeKg)}${tag}
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="text-body" style="font-size:13px;">${DateHelper.short(log.dateKey)}</span>
                  <span style="color:var(--text-muted);display:flex;">
                    ${icon('ic_chevron_right', { size: 15 })}
                  </span>
                </div>
              </button>
            `;
          })
          .join('')
      : `<p class="text-body" style="margin-top:6px;">Todavía no has terminado ningún entrenamiento.</p>`;

  const chartSubtitle =
    selectedRangeDays === 7
      ? 'Por día · últimos 7 días'
      : 'Por semana (lunes a domingo)';

  container.innerHTML = `
    <!-- 1. Encabezado y Filtros de Tiempo (7D / 30D / 90D) -->
    <div>
      <h1 class="text-screen">Dashboard</h1>
      <p class="text-body" style="margin-top:2px;">Cómo vienes entrenando y evolucionando</p>

      <div class="chip-row" style="margin-top:14px;">
        <button
          type="button"
          class="chip dash-range-chip ${selectedRangeDays === 7 ? 'chip--active' : ''}"
          data-range="7"
        >
          7 días
        </button>
        <button
          type="button"
          class="chip dash-range-chip ${selectedRangeDays === 30 ? 'chip--active' : ''}"
          data-range="30"
        >
          30 días
        </button>
        <button
          type="button"
          class="chip dash-range-chip ${selectedRangeDays === 90 ? 'chip--active' : ''}"
          data-range="90"
        >
          90 días
        </button>
      </div>
    </div>

    <!-- 2. Resumen del Periodo (Sesiones, Volumen, Tiempo) -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
      <div class="tile">
        <span style="color:var(--accent-orange);display:flex;">${icon('ic_fitness_center', { size: 20 })}</span>
        <p class="text-value" style="margin-top:10px;">${logsInRange.length}</p>
        <p class="text-caption">Sesiones</p>
      </div>

      <div class="tile">
        <span style="color:var(--group-core);display:flex;">${icon('ic_bolt', { size: 20 })}</span>
        <p class="text-value" style="margin-top:10px;">${formatVolume(periodVolume)}</p>
        <p class="text-caption">Volumen</p>
      </div>

      <div class="tile">
        <span style="color:var(--accent-cyan);display:flex;">${icon('ic_timer', { size: 20 })}</span>
        <p class="text-value" style="margin-top:10px;">${DateHelper.formatMinutes(periodMinutes)}</p>
        <p class="text-caption">Tiempo (${streak}d racha)</p>
      </div>
    </div>

    <!-- 3. Gráfica de Barras: Entrenamientos / Volumen -->
    <div class="card" style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div>
          <h2 class="text-card-title">
            ${selectedBarMetric === 'volume' ? 'Volumen levantado (kg)' : 'Entrenamientos'}
          </h2>
          <p class="text-caption" style="margin-top:1px;">${chartSubtitle}</p>
        </div>

        <div style="display:flex;gap:6px;">
          <button
            type="button"
            class="chip dash-metric-chip ${selectedBarMetric === 'sessions' ? 'chip--active' : ''}"
            data-metric="sessions"
            style="min-height:32px;padding:0 10px;font-size:12px;"
          >
            Sesiones
          </button>
          <button
            type="button"
            class="chip dash-metric-chip ${selectedBarMetric === 'volume' ? 'chip--active' : ''}"
            data-metric="volume"
            style="min-height:32px;padding:0 10px;font-size:12px;"
          >
            Volumen
          </button>
        </div>
      </div>

      <canvas id="canvasSessionsVolume" class="chart-canvas" style="height:180px;"></canvas>
    </div>

    <!-- 4. Evolución del Peso Diario (LineChart) -->
    <div class="card" style="display:flex;flex-direction:column;gap:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div>
          <h2 class="text-card-title">Tendencia de peso</h2>
          <p class="text-caption" style="margin-top:1px;">${weightSummaryText}</p>
        </div>

        <button
          type="button"
          id="btnDashLogWeight"
          style="background:none;border:none;color:var(--accent-orange);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:6px 4px;"
        >
          + Registrar peso
        </button>
      </div>

      <canvas id="canvasWeightTrend" class="chart-canvas" style="height:150px;"></canvas>
    </div>

    <!-- 5. Calendario de Actividad (Últimas 5 Semanas) -->
    <div class="card" style="display:flex;flex-direction:column;gap:10px;">
      <div>
        <h2 class="text-card-title">Actividad</h2>
        <p class="text-caption" style="margin-top:1px;">
          Últimas 5 semanas · cada círculo naranja es un día entrenado
        </p>
      </div>

      <canvas id="canvasActivityCalendar" class="chart-canvas"></canvas>
    </div>

    <!-- 6. Récords Personales (Top 5) -->
    <div class="card" style="display:flex;flex-direction:column;gap:6px;">
      <h2 class="text-card-title">Récords personales</h2>
      <div style="display:flex;flex-direction:column;">
        ${recordsHtml}
      </div>
    </div>

    <!-- 7. Historial Detallado de Sesiones -->
    <div class="card" style="display:flex;flex-direction:column;gap:6px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <h2 class="text-card-title">Últimas sesiones</h2>
        <span class="text-caption">Toca una sesión para ver sus series</span>
      </div>
      <div style="display:flex;flex-direction:column;">
        ${sessionsHtml}
      </div>
    </div>
  `;

  // Dibujar gráficas Canvas en el siguiente frame si el panel está visible
  requestAnimationFrame(() => {
    if (!container.hidden) {
      drawDashboardCharts(container);
    }
  });

  const rerender = () =>
    renderDashboardTab(container, { onWeightUpdated });

  // Selector de rango 7D / 30D / 90D
  container.querySelectorAll('.dash-range-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedRangeDays = Number(chip.getAttribute('data-range')) || 7;
      rerender();
    });
  });

  // Selector de métrica de barras (Sesiones vs Volumen)
  container.querySelectorAll('.dash-metric-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedBarMetric =
        chip.getAttribute('data-metric') === 'volume' ? 'volume' : 'sessions';
      rerender();
    });
  });

  // Registrar peso desde el Dashboard
  container.querySelector('#btnDashLogWeight')?.addEventListener('click', () => {
    openExactWeightDialog({
      initialWeight: DailyLogService.getLatestWeight(),
      onSaved: () => {
        rerender();
        if (typeof onWeightUpdated === 'function') onWeightUpdated();
      },
    });
  });

  // Abrir detalle de sesión al tocar una fila del historial
  container.querySelectorAll('[data-session-idx]').forEach((row) => {
    row.addEventListener('click', () => {
      const idx = Number(row.getAttribute('data-session-idx'));
      const log = recentSessions[idx];
      if (log) {
        openSessionDetailSheet(log);
      }
    });
  });
}
