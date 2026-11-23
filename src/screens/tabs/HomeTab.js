/**
 * Pestaña 1 — Inicio (src/screens/tabs/HomeTab.js)
 *
 * Identidad 100 % Anaranjada + Pizarra Limpia (Clean Slate):
 * 1. Saludo con fecha en español, Anillo circular de Meta Semanal (76x76px) y Tira de la Semana (L-D).
 * 2. Fila de 3 mini-estadísticas en tonos naranjas (Racha, Volumen semanal, Entrenamientos).
 * 3. Tarjeta destacada con botón "Iniciar rutina improvisada" (agregar ejercicios sobre la marcha).
 * 4. Acceso rápido a bloques guardados (inicia limpio sin bloques pre-cargados; si el usuario aún
 *    no ha creado ninguno, muestra botón directo para crear su primer bloque en la pestaña Rutinas).
 * 5. Registros diarios rápidos de Peso Corporal (sin pesos inventados; inicia en "Sin registro")
 *    y Vasos de Agua (en tono naranja unificado).
 */

import {
  AuthService,
  BlockService,
  DailyLogService,
  DateHelper,
  PreferencesService,
  WorkoutService,
} from '../../services/index.js';
import { icon } from '../../ui/icons.js';
import { showDialog, showToast } from '../../ui/modals.js';

const MAX_EXERCISE_PREVIEW = 4;
let selectedQuickBlockId = null;

function formatVolume(volumeKg) {
  const v = Number(volumeKg) || 0;
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)} t`;
  }
  return `${Math.round(v)} kg`;
}

function getSuggestedBlock(blocks) {
  if (!blocks || blocks.length === 0) return null;
  const lastLog = WorkoutService.getAllWorkouts()[0];
  if (!lastLog) return blocks[0];
  const idx = blocks.findIndex((b) => b.title === lastLog.title);
  if (idx < 0) return blocks[0];
  return blocks[(idx + 1) % blocks.length];
}

/**
 * Abre el diálogo centrado al 88% para escribir el peso exacto de hoy (30 - 300 kg).
 * Si aún no hay peso registrado, el campo inicia completamente vacío.
 * @param {{ initialWeight: number | null, onSaved: () => void }} opts
 */
export function openExactWeightDialog({ initialWeight, onSaved }) {
  const initialVal =
    initialWeight !== null && initialWeight > 0 ? initialWeight.toFixed(1) : '';

  showDialog({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <h3 class="text-section" style="font-size:20px;">Peso de hoy</h3>
          <p class="text-body" style="margin-top:2px;">
            Escribe tu peso corporal exacto (entre 30 y 300 kg)
          </p>
        </div>

        <div class="field" id="dialogWeightField">
          <label class="field__label" for="etExactWeight">Peso corporal</label>
          <div class="field__box">
            <input
              id="etExactWeight"
              class="field__input"
              type="text"
              inputmode="decimal"
              placeholder="Ej. 72.5"
              value="${initialVal}"
            />
            <span class="field__suffix">kg</span>
          </div>
          <span class="field__error" id="errExactWeight" style="display:none;"></span>
        </div>

        <div style="display:flex;gap:10px;margin-top:6px;">
          <button type="button" id="btnCancelExactWeight" class="btn btn-outlined" style="flex:1;color:var(--text-secondary);">
            Cancelar
          </button>
          <button type="button" id="btnApplyExactWeight" class="btn btn-primary" style="flex:1;">
            Aplicar
          </button>
        </div>
      </div>
    `,
    onMount: (box, close) => {
      const input = box.querySelector('#etExactWeight');
      const fieldEl = box.querySelector('#dialogWeightField');
      const errEl = box.querySelector('#errExactWeight');

      input?.focus();
      if (initialVal) input?.select();

      input?.addEventListener('input', () => {
        fieldEl?.classList.remove('field--error');
        if (errEl) errEl.style.display = 'none';
      });

      box.querySelector('#btnCancelExactWeight')?.addEventListener('click', close);

      const submitWeight = () => {
        const res = DailyLogService.saveWeight(input?.value || '');
        if (!res.ok) {
          fieldEl?.classList.add('field--error');
          if (errEl) {
            errEl.textContent = res.error || 'Ingresa un peso entre 30 y 300 kg';
            errEl.style.display = 'block';
          }
          return;
        }
        close();
        showToast(`Peso registrado: ${res.entry.weightKg.toFixed(1)} kg`, {
          type: 'success',
        });
        if (typeof onSaved === 'function') onSaved();
      };

      box.querySelector('#btnApplyExactWeight')?.addEventListener('click', submitWeight);
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitWeight();
        }
      });
    },
  });
}

/**
 * Renderiza la Pestaña 1 — Inicio dentro de su contenedor.
 * @param {HTMLElement} container
 * @param {{
 *   onNavigateTab: (tabId: 'home' | 'routines' | 'dashboard') => void,
 *   onStartWorkout: (config: { isImprovised: boolean, block: object | null }) => void
 * }} callbacks
 */
export function renderHomeTab(container, { onNavigateTab, onStartWorkout }) {
  const user = AuthService.getCurrentUser();
  const prefs = PreferencesService.getPreferences();

  // 1. Meta semanal y tira de la semana (L-D)
  const completedWeek = WorkoutService.getThisWeekCount();
  const weeklyGoal = prefs.weeklyGoal || 4;
  const goalPct =
    weeklyGoal > 0 ? Math.min(100, Math.round((completedWeek * 100) / weeklyGoal)) : 0;
  const remainingGoal = Math.max(0, weeklyGoal - completedWeek);
  const goalHintText =
    completedWeek >= weeklyGoal
      ? '¡Meta semanal cumplida!'
      : remainingGoal === 1
        ? 'Te falta 1 entrenamiento'
        : `Te faltan ${remainingGoal} entrenamientos`;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (goalPct / 100) * circumference;

  const trainedSet = WorkoutService.getDaysTrainedSet();
  const todayKey = DateHelper.today();
  const monday = DateHelper.startOfWeek();

  let weekStripHtml = '';
  for (let col = 0; col < 7; col++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + col);
    const dKey = DateHelper.key(dayDate);
    const isDone = trainedSet.has(dKey);
    const isToday = dKey === todayKey;
    const dotClass = isDone
      ? 'day-dot day-dot--done'
      : isToday
        ? 'day-dot day-dot--today'
        : 'day-dot';

    weekStripHtml += `
      <div class="week-strip__col">
        <span class="text-caption">${DateHelper.WEEK_LETTERS[col]}</span>
        <span class="${dotClass}">${dayDate.getDate()}</span>
      </div>
    `;
  }

  // 2. Mini-estadísticas (100 % en tonos naranjas)
  const streak = WorkoutService.getStreakDays();
  const weekVolume = WorkoutService.getThisWeekVolume();
  const totalWorkouts = WorkoutService.getTotalWorkouts();

  // 3. Bloques guardados (inicia vacío hasta que el usuario cree sus bloques)
  const blocks = BlockService.getAllBlocks();
  const suggestedBlock = getSuggestedBlock(blocks);
  if (!selectedQuickBlockId || !blocks.some((b) => b.id === selectedQuickBlockId)) {
    selectedQuickBlockId = suggestedBlock?.id || null;
  }
  const activeBlock = blocks.find((b) => b.id === selectedQuickBlockId) || suggestedBlock;
  const trainedToday = WorkoutService.hasTrainedToday();

  const blockChipsHtml =
    blocks.length > 1
      ? `
        <div class="chip-row" style="overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;">
          ${blocks
            .map(
              (b) => `
              <button
                type="button"
                class="chip home-block-chip ${b.id === activeBlock?.id ? 'chip--active' : ''}"
                data-block-id="${b.id}"
                style="white-space:nowrap;flex-shrink:0;"
              >
                ${b.title}
              </button>
            `
            )
            .join('')}
        </div>
      `
      : '';

  let blocksSectionCardHtml = '';
  if (!activeBlock) {
    blocksSectionCardHtml = `
      <div class="card" style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <h3 class="text-section">Aún no tienes bloques creados</h3>
          <p class="text-body" style="margin-top:4px;">
            Crea tus bloques personalizados con los ejercicios del catálogo o tus propios ejercicios en la pestaña Rutinas.
          </p>
        </div>
        <button type="button" id="btnGoCreateFirstBlock" class="btn btn-tonal" style="width:100%;min-height:48px;">
          ${icon('ic_add', { size: 18 })} Ir a Rutinas para crear un bloque
        </button>
      </div>
    `;
  } else {
    let previewExercisesHtml = '';
    if (activeBlock.exerciseNames.length > 0) {
      const visibleNames = activeBlock.exerciseNames.slice(0, MAX_EXERCISE_PREVIEW);
      previewExercisesHtml = visibleNames
        .map(
          (name) => `
          <div class="home-exercise-row">
            <span class="home-exercise-row__icon">${icon('ic_fitness_center', { size: 18 })}</span>
            <div style="flex:1;">
              <div class="text-card-title">${name}</div>
              <div class="text-body" style="font-size:13px;">3 series × 10 reps</div>
            </div>
          </div>
        `
        )
        .join('');

      const extraCount = activeBlock.exerciseNames.length - MAX_EXERCISE_PREVIEW;
      if (extraCount > 0) {
        previewExercisesHtml += `
          <div class="home-exercise-row" style="padding-top:4px;padding-bottom:6px;">
            <span class="home-exercise-row__icon">${icon('ic_add', { size: 18 })}</span>
            <div class="text-body" style="font-weight:600;">+${extraCount} ejercicio(s) más</div>
          </div>
        `;
      }
    } else {
      previewExercisesHtml = `
        <p class="text-body" style="padding:10px 18px;">
          Este bloque aún no tiene ejercicios asignados. Edítalo en la pestaña Rutinas.
        </p>
      `;
    }

    blocksSectionCardHtml = `
      <div class="card" style="padding:18px 0;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0 18px;gap:10px;">
          <div>
            <h3 class="text-section">${activeBlock.title}</h3>
            <p class="text-body" style="margin-top:2px;">${activeBlock.muscleGroups}</p>
          </div>
          ${
            trainedToday
              ? `<span class="pill pill--orange" style="flex-shrink:0;">Hecho hoy</span>`
              : ''
          }
        </div>

        <div style="padding:10px 18px 4px;">
          <span class="pill">${activeBlock.exerciseCount} ejercicios • ${activeBlock.estimatedMinutes} min</span>
        </div>

        <div style="margin-top:4px;">
          ${previewExercisesHtml}
        </div>

        <div style="padding:12px 18px 0;">
          <button
            type="button"
            id="btnStartSelectedBlock"
            class="btn btn-primary"
            style="width:100%;min-height:54px;"
          >
            ${icon('ic_play', { size: 18 })} Comenzar entrenamiento
          </button>
        </div>
      </div>
    `;
  }

  // 4. Peso corporal del día y variación (en naranja)
  const latestWeight = DailyLogService.getLatestWeight();
  const weightDelta = DailyLogService.getWeightDelta();
  const targetWeight = prefs.targetWeightKg;

  let weightDeltaBadgeHtml = '';
  if (weightDelta !== null && latestWeight !== null) {
    const sign = weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1);
    weightDeltaBadgeHtml = `
      <span class="pill pill--orange">${sign} kg</span>
    `;
  }

  let weightGoalMessage = '';
  if (latestWeight !== null && targetWeight > 0) {
    const diff = targetWeight - latestWeight;
    if (Math.abs(diff) < 0.05) {
      weightGoalMessage = '¡Alcanzaste tu peso meta!';
    } else if (diff < 0) {
      weightGoalMessage = `Estás a ${Math.abs(diff).toFixed(1)} kg de tu meta (${targetWeight.toFixed(1)} kg)`;
    } else {
      weightGoalMessage = `Te faltan ${diff.toFixed(1)} kg para tu meta (${targetWeight.toFixed(1)} kg)`;
    }
  } else if (latestWeight !== null) {
    weightGoalMessage = 'Puedes definir un peso meta en Preferencias';
  } else {
    weightGoalMessage = 'Toca el valor central para registrar tu peso corporal';
  }

  // 5. Agua del día (100 % naranja)
  const waterGlasses = DailyLogService.getTodayWater();
  const waterGoal = prefs.waterGoal || 8;
  const waterPct = Math.min(100, Math.round((waterGlasses * 100) / waterGoal));

  container.innerHTML = `
    <!-- 1. Encabezado: Fecha y Saludo -->
    <div>
      <p class="text-body">${DateHelper.longToday()}</p>
      <h1 class="text-screen" style="margin-top:2px;">Hola, ${user?.name || 'Atleta'}</h1>
    </div>

    <!-- 2. Tarjeta de Meta Semanal + Tira de la Semana (L-D) -->
    <div class="card">
      <div style="display:flex;align-items:center;gap:18px;">
        <div class="goal-ring" aria-label="Progreso meta semanal ${goalPct}%">
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle
              cx="38"
              cy="38"
              r="${radius}"
              fill="none"
              stroke="var(--surface-input)"
              stroke-width="8"
            />
            <circle
              cx="38"
              cy="38"
              r="${radius}"
              fill="none"
              stroke="var(--accent-orange)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"
            />
          </svg>
          <span class="goal-ring__label">${goalPct}%</span>
        </div>

        <div style="flex:1;">
          <h2 class="text-section">Meta semanal</h2>
          <p class="text-body" style="margin-top:2px;">
            ${completedWeek} de ${weeklyGoal} entrenamientos
          </p>
          <p class="text-caption" style="margin-top:6px;">${goalHintText}</p>
        </div>
      </div>

      <div class="week-strip">
        ${weekStripHtml}
      </div>
    </div>

    <!-- 3. Fila de 3 Mini-Estadísticas (100 % Naranja) -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
      <div class="tile">
        <span style="color:var(--accent-orange);display:flex;">${icon('ic_flame', { size: 20 })}</span>
        <p class="text-value" style="margin-top:10px;">${streak} ${streak === 1 ? 'día' : 'días'}</p>
        <p class="text-caption">Racha</p>
      </div>

      <div class="tile">
        <span style="color:var(--accent-orange);display:flex;">${icon('ic_bolt', { size: 20 })}</span>
        <p class="text-value" style="margin-top:10px;">${formatVolume(weekVolume)}</p>
        <p class="text-caption">Volumen semanal</p>
      </div>

      <div class="tile">
        <span style="color:var(--accent-orange);display:flex;">${icon('ic_trophy', { size: 20 })}</span>
        <p class="text-value" style="margin-top:10px;">${totalWorkouts}</p>
        <p class="text-caption">Entrenamientos</p>
      </div>
    </div>

    <!-- 4. Botón Destacado: Iniciar Rutina Improvisada -->
    <div class="card-improvised">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <span class="pill pill--orange" style="margin-bottom:6px;">Entrenamiento Libre</span>
          <h2 class="text-section">Rutina Improvisada</h2>
          <p class="text-body" style="font-size:13px;margin-top:2px;">
            Empieza sin bloque fijo y agrega ejercicios sobre la marcha con el buscador.
          </p>
        </div>
      </div>
      <button type="button" id="btnStartImprovised" class="btn btn-primary" style="width:100%;">
        ${icon('ic_add', { size: 20 })} Iniciar rutina improvisada
      </button>
    </div>

    <!-- 5. Acceso Rápido a Bloques Guardados -->
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <h2 class="text-section">Mis Bloques</h2>
        <button
          type="button"
          id="btnSeeAllBlocks"
          style="background:none;border:none;color:var(--accent-orange);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;padding:8px 4px;"
        >
          Ver todo
        </button>
      </div>

      ${blockChipsHtml}
      ${blocksSectionCardHtml}
    </div>

    <!-- 6. Registro Rápido Diario: Peso Corporal -->
    <div class="card" style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <h2 class="text-card-title">Peso corporal</h2>
        ${weightDeltaBadgeHtml}
      </div>

      <div style="display:flex;align-items:center;gap:12px;margin-top:4px;">
        <button
          type="button"
          id="btnHomeWeightMinus"
          class="btn btn-round"
          style="width:52px;height:52px;"
          aria-label="Restar 0.5 kg"
        >
          −
        </button>

        <button
          type="button"
          id="btnHomeExactWeight"
          class="weight-click-target"
          title="Toca para escribir tu peso exacto"
        >
          <span class="text-weight-hero">
            ${latestWeight !== null ? `${latestWeight.toFixed(1)} kg` : 'Sin registro'}
          </span>
        </button>

        <button
          type="button"
          id="btnHomeWeightPlus"
          class="btn btn-round"
          style="width:52px;height:52px;"
          aria-label="Sumar 0.5 kg"
        >
          +
        </button>
      </div>

      <p style="margin:2px 0 0;text-align:center;color:var(--accent-orange);font-size:13px;font-weight:700;">
        ${weightGoalMessage}
      </p>
      <p class="text-caption" style="text-align:center;">
        Toca el valor para escribirlo exacto
      </p>
    </div>

    <!-- 7. Registro Rápido Diario: Hidratación (Vasos de Agua en Naranja) -->
    <div class="card" style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <div class="icon-tile" style="color:var(--accent-orange);">
          ${icon('ic_drop', { size: 22 })}
        </div>

        <div style="flex:1;">
          <h2 class="text-card-title">Agua de hoy</h2>
          <p class="text-body" style="margin-top:1px;">
            ${waterGlasses} / ${waterGoal} vasos
          </p>
        </div>

        <button
          type="button"
          id="btnHomeWaterMinus"
          class="btn btn-round"
          aria-label="Quitar un vaso de agua"
          ${waterGlasses <= 0 ? 'disabled' : ''}
        >
          −
        </button>

        <button
          type="button"
          id="btnHomeWaterPlus"
          class="btn btn-round"
          aria-label="Sumar un vaso de agua"
        >
          +
        </button>
      </div>

      <div class="progress-linear">
        <div class="progress-linear__bar" style="width:${waterPct}%;"></div>
      </div>
    </div>
  `;

  const rerender = () => renderHomeTab(container, { onNavigateTab, onStartWorkout });

  container.querySelectorAll('.home-block-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedQuickBlockId = chip.getAttribute('data-block-id');
      rerender();
    });
  });

  const goToRoutines = () => {
    if (typeof onNavigateTab === 'function') {
      onNavigateTab('routines');
    }
  };

  container.querySelector('#btnSeeAllBlocks')?.addEventListener('click', goToRoutines);
  container
    .querySelector('#btnGoCreateFirstBlock')
    ?.addEventListener('click', goToRoutines);

  container.querySelector('#btnStartImprovised')?.addEventListener('click', () => {
    if (typeof onStartWorkout === 'function') {
      onStartWorkout({ isImprovised: true, block: null });
    }
  });

  container.querySelector('#btnStartSelectedBlock')?.addEventListener('click', () => {
    if (activeBlock && typeof onStartWorkout === 'function') {
      onStartWorkout({ isImprovised: false, block: activeBlock });
    }
  });

  // Controles de peso corporal (sin pre-rellenar 70 kg si no hay registro previo)
  container.querySelector('#btnHomeWeightMinus')?.addEventListener('click', () => {
    if (latestWeight === null) {
      openExactWeightDialog({ initialWeight: null, onSaved: rerender });
      return;
    }
    DailyLogService.adjustWeightStep(-0.5);
    rerender();
  });

  container.querySelector('#btnHomeWeightPlus')?.addEventListener('click', () => {
    if (latestWeight === null) {
      openExactWeightDialog({ initialWeight: null, onSaved: rerender });
      return;
    }
    DailyLogService.adjustWeightStep(0.5);
    rerender();
  });

  container.querySelector('#btnHomeExactWeight')?.addEventListener('click', () => {
    openExactWeightDialog({
      initialWeight: latestWeight,
      onSaved: rerender,
    });
  });

  container.querySelector('#btnHomeWaterMinus')?.addEventListener('click', () => {
    DailyLogService.decrementWater();
    rerender();
  });

  container.querySelector('#btnHomeWaterPlus')?.addEventListener('click', () => {
    DailyLogService.incrementWater();
    rerender();
  });
}
