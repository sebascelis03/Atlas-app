/**
 * Motor de Sesión de Entrenamiento en Vivo (src/screens/WorkoutLiveScreen.js)
 * Basado en activity_main.xml + funcionalidades definitivas de ATLAS:
 *
 * 1. Soporta tanto iniciar desde un Bloque guardado como desde "Iniciar rutina improvisada".
 * 2. Cronómetro de sesión en vivo basado en timestamp real (`Date.now()`).
 * 3. Registro de series (`SERIE`, `ANTERIOR` con marca histórica real, `KG`, `REPS`, check `✓`).
 * 4. Temporizador de descanso programable (con valor inicial desde Preferencias, selector rápido
 *    de duración, `+15s`, `Saltar` y alarma sonora sutil + vibración al llegar a 00:00).
 * 5. Cambiar un ejercicio por otro sobre la marcha, agregar nuevos ejercicios (desde el catálogo
 *    con buscador o mediante "+ Crear ejercicio propio") y eliminar ejercicios.
 * 6. Finalizar normalmente o "Finalizar antes" guardando todo lo registrado hasta ese momento.
 */

import { playSubtleRestAlarm, unlockAudioContext } from '../core/alarm.js';
import {
  ExerciseCatalog,
  PreferencesService,
  WorkoutService,
} from '../services/index.js';
import { icon } from '../ui/icons.js';
import {
  showBottomSheet,
  showDialog,
  showToast,
} from '../ui/modals.js';
import { openCreateCustomExerciseDialog } from './tabs/RoutinesTab.js';

const DEFAULT_SETS_COUNT = 3;
const DEFAULT_REPS_COUNT = 10;

let sessionTimerId = null;
let restTimerId = null;

function stopAllTimers() {
  if (sessionTimerId) {
    clearInterval(sessionTimerId);
    sessionTimerId = null;
  }
  if (restTimerId) {
    clearInterval(restTimerId);
    restTimerId = null;
  }
}

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Construye las series iniciales de un ejercicio consultando la marca ANTERIOR real.
 * @param {string} exerciseName
 * @param {number} [defaultReps]
 */
function buildInitialSets(exerciseName, defaultReps = DEFAULT_REPS_COUNT) {
  const sets = [];
  for (let i = 1; i <= DEFAULT_SETS_COUNT; i++) {
    sets.push({
      setNumber: i,
      previousInfo: WorkoutService.getPreviousSetInfo(exerciseName, i),
      weightKg: 0,
      reps: defaultReps,
      isCompleted: false,
    });
  }
  return sets;
}

/**
 * Abre el BottomSheet Selector de Ejercicios (para Añadir un ejercicio nuevo o Cambiar uno existente).
 * Incluye buscador en tiempo real, filtros por grupo muscular y botón "+ Crear ejercicio propio".
 * @param {{
 *   modeTitle?: string,
 *   onSelectExercise: (exercise: object) => void
 * }} opts
 */
function openExercisePickerSheet({
  modeTitle = 'Seleccionar Ejercicio',
  onSelectExercise,
}) {
  let selectedMuscle = 'Todos';
  let currentQuery = '';

  const muscleChipsHtml = ExerciseCatalog.MUSCLE_GROUPS.map(
    (m) => `
      <button
        type="button"
        class="chip picker-muscle-chip ${m === selectedMuscle ? 'chip--active' : ''}"
        data-muscle="${m}"
        style="white-space:nowrap;flex-shrink:0;"
      >
        ${m}
      </button>
    `
  ).join('');

  showBottomSheet({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="text-section" style="font-size:18px;">${modeTitle}</h3>
          <button
            type="button"
            id="btnPickerCreateCustom"
            class="btn btn-tonal"
            style="min-height:34px;padding:0 12px;font-size:12px;"
          >
            ${icon('ic_add', { size: 15 })} Ejercicio propio
          </button>
        </div>

        <!-- Buscador -->
        <div class="picker-search-box">
          <span style="color:var(--text-muted);display:flex;">${icon('ic_search', { size: 20 })}</span>
          <input
            id="etPickerSearch"
            type="text"
            placeholder="Buscar ejercicio (ej. Banca, Sentadilla)..."
          />
        </div>

        <!-- Chips de grupo muscular -->
        <div class="chip-row" style="overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;">
          ${muscleChipsHtml}
        </div>

        <!-- Lista de resultados -->
        <div
          id="pickerExercisesList"
          style="display:flex;flex-direction:column;max-height:46dvh;overflow-y:auto;"
        ></div>
      </div>
    `,
    onMount: (sheet, close) => {
      const searchInput = sheet.querySelector('#etPickerSearch');
      const listContainer = sheet.querySelector('#pickerExercisesList');

      function renderList() {
        if (!listContainer) return;
        const results = ExerciseCatalog.searchExercises({
          query: currentQuery,
          muscleGroup: selectedMuscle,
        });

        if (results.length === 0) {
          listContainer.innerHTML = `
            <div style="padding:20px 8px;text-align:center;">
              <p class="text-body">No se encontró "${currentQuery}".</p>
              <button
                type="button"
                id="btnEmptyCreateCustom"
                class="btn btn-tonal"
                style="margin-top:10px;"
              >
                ${icon('ic_add', { size: 16 })} Crear "${currentQuery || 'ejercicio propio'}"
              </button>
            </div>
          `;
          listContainer
            .querySelector('#btnEmptyCreateCustom')
            ?.addEventListener('click', () => {
              close();
              openCreateCustomExerciseDialog({
                defaultName: currentQuery,
                onCreated: (newEx) => onSelectExercise(newEx),
              });
            });
          return;
        }

        listContainer.innerHTML = results
          .map(
            (ex) => `
            <button type="button" class="picker-item" data-pick-name="${ex.name}">
              <div class="icon-tile" style="color:var(--primary-neon);">
                ${icon('ic_fitness_center', { size: 22 })}
              </div>
              <div style="flex:1;">
                <div class="text-card-title">
                  ${ex.name}${ex.isCustom ? ' <span class="text-caption" style="color:var(--accent-orange);">★ Propio</span>' : ''}
                </div>
                <div class="text-caption" style="color:var(--text-secondary);margin-top:2px;">
                  ${ex.muscleGroup} • ${ex.equipment}
                </div>
              </div>
              <span style="color:var(--primary-neon);display:flex;">
                ${icon('ic_add', { size: 22 })}
              </span>
            </button>
          `
          )
          .join('');

        listContainer.querySelectorAll('[data-pick-name]').forEach((item) => {
          item.addEventListener('click', () => {
            const name = item.getAttribute('data-pick-name');
            if (!name) return;
            const ex = ExerciseCatalog.getExerciseByName(name);
            close();
            onSelectExercise(ex);
          });
        });
      }

      renderList();

      searchInput?.addEventListener('input', () => {
        currentQuery = searchInput.value || '';
        renderList();
      });

      sheet.querySelectorAll('.picker-muscle-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          selectedMuscle = chip.getAttribute('data-muscle') || 'Todos';
          sheet.querySelectorAll('.picker-muscle-chip').forEach((c) => {
            c.classList.toggle('chip--active', c === chip);
          });
          renderList();
        });
      });

      sheet.querySelector('#btnPickerCreateCustom')?.addEventListener('click', () => {
        close();
        openCreateCustomExerciseDialog({
          defaultName: currentQuery,
          onCreated: (newEx) => onSelectExercise(newEx),
        });
      });
    },
  });
}

/**
 * Renderiza la pantalla completa de Sesión de Entrenamiento en Vivo.
 * @param {HTMLElement} container
 * @param {{
 *   isImprovised: boolean,
 *   block: object | null,
 *   onFinished: () => void
 * }} config
 */
export function renderWorkoutLiveScreen(
  container,
  { isImprovised = false, block = null, onFinished }
) {
  stopAllTimers();

  const prefs = PreferencesService.getPreferences();
  const startTimeMs = Date.now();
  let programmedRestSec = prefs.defaultRestSeconds || 90;
  let restEndTimeMs = 0;
  let isRestRunning = false;

  const activeWorkout = {
    title: isImprovised
      ? 'Rutina Improvisada'
      : block?.title || 'Entrenamiento de Hoy',
    isImprovised,
    workoutExercises: [],
  };

  // Si viene de un bloque guardado, precargar sus ejercicios con 3 series x 10 reps
  if (!isImprovised && block && Array.isArray(block.exerciseNames)) {
    for (const exName of block.exerciseNames) {
      const exercise = ExerciseCatalog.getExerciseByName(exName);
      activeWorkout.workoutExercises.push({
        exercise,
        sets: buildInitialSets(exercise.name, DEFAULT_REPS_COUNT),
      });
    }
  }

  function getElapsedSeconds() {
    return Math.max(1, Math.floor((Date.now() - startTimeMs) / 1000));
  }

  function computeLiveStats() {
    let totalVolume = 0;
    let totalSets = 0;
    let completedSets = 0;
    let recordedSetsWithValues = 0;

    for (const item of activeWorkout.workoutExercises) {
      for (const s of item.sets) {
        totalSets++;
        const w = Number(s.weightKg) || 0;
        const r = Number(s.reps) || 0;
        if (s.isCompleted) {
          completedSets++;
          totalVolume += w * r;
        }
        if (s.isCompleted || w > 0 || r > 0) {
          recordedSetsWithValues++;
        }
      }
    }
    return { totalVolume, totalSets, completedSets, recordedSetsWithValues };
  }

  function startRestCountdown(seconds = programmedRestSec) {
    unlockAudioContext();
    isRestRunning = true;
    restEndTimeMs = Date.now() + seconds * 1000;
    updateRestBarUI();

    if (restTimerId) clearInterval(restTimerId);
    restTimerId = setInterval(() => {
      const remainingSec = Math.ceil((restEndTimeMs - Date.now()) / 1000);
      if (remainingSec <= 0) {
        clearInterval(restTimerId);
        restTimerId = null;
        isRestRunning = false;
        updateRestBarUI();
        playSubtleRestAlarm();
        showToast('¡Tiempo de descanso terminado! 💪', { type: 'success' });
      } else {
        const timerEl = container.querySelector('#tvRestTimerSeconds');
        if (timerEl) timerEl.textContent = formatClock(remainingSec);
      }
    }, 250);
  }

  function updateRestBarUI() {
    const restBar = container.querySelector('#layoutRestTimer');
    const timerEl = container.querySelector('#tvRestTimerSeconds');
    if (!restBar) return;

    if (!isRestRunning) {
      restBar.style.display = 'none';
      return;
    }

    restBar.style.display = 'flex';
    const remainingSec = Math.max(0, Math.ceil((restEndTimeMs - Date.now()) / 1000));
    if (timerEl) timerEl.textContent = formatClock(remainingSec);
  }

  function updateSummaryNumbersUI() {
    const { totalVolume, totalSets, completedSets } = computeLiveStats();
    const volEl = container.querySelector('#tvTotalVolume');
    const setsEl = container.querySelector('#tvCompletedSetsCount');
    if (volEl) {
      volEl.textContent = `${Math.round(totalVolume).toLocaleString('es-CO')} kg`;
    }
    if (setsEl) {
      setsEl.textContent = `${completedSets} de ${totalSets}`;
    }
  }

  /**
   * Abre un diálogo rápido para cambiar los segundos del temporizador de descanso durante la sesión.
   */
  function openRestConfigDialog() {
    const presets = [30, 60, 90, 120, 180];
    showDialog({
      contentHtml: `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <h3 class="text-section" style="font-size:19px;">Temporizador de Descanso</h3>
          <p class="text-body">
            Elige el tiempo de descanso automático al completar cada serie:
          </p>
          <div class="chip-row">
            ${presets
              .map(
                (sec) => `
                <button
                  type="button"
                  class="chip live-rest-preset ${sec === programmedRestSec ? 'chip--active' : ''}"
                  data-sec="${sec}"
                >
                  ${sec}s
                </button>
              `
              )
              .join('')}
          </div>
          <div class="field">
            <label class="field__label" for="etLiveRestCustom">Segundos personalizados</label>
            <div class="field__box">
              <input
                id="etLiveRestCustom"
                class="field__input"
                type="number"
                min="10"
                max="600"
                value="${programmedRestSec}"
              />
              <span class="field__suffix">seg</span>
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:4px;">
            <button type="button" id="btnCancelRestCfg" class="btn btn-outlined" style="flex:1;">
              Cancelar
            </button>
            <button type="button" id="btnApplyRestCfg" class="btn btn-primary" style="flex:1.2;">
              Aplicar y descansar
            </button>
          </div>
        </div>
      `,
      onMount: (box, close) => {
        const input = box.querySelector('#etLiveRestCustom');
        box.querySelectorAll('.live-rest-preset').forEach((chip) => {
          chip.addEventListener('click', () => {
            const val = Number(chip.getAttribute('data-sec')) || 90;
            if (input) input.value = String(val);
            box.querySelectorAll('.live-rest-preset').forEach((c) => {
              c.classList.toggle('chip--active', c === chip);
            });
          });
        });

        box.querySelector('#btnCancelRestCfg')?.addEventListener('click', close);
        box.querySelector('#btnApplyRestCfg')?.addEventListener('click', () => {
          const val = Math.max(10, Math.min(600, Number(input?.value) || 90));
          programmedRestSec = val;
          PreferencesService.updatePreferences({ defaultRestSeconds: val });
          close();
          const btnCfg = container.querySelector('#btnRestPresetLabel');
          if (btnCfg) btnCfg.textContent = `⏱ ${programmedRestSec}s`;
          startRestCountdown(programmedRestSec);
        });
      },
    });
  }

  /**
   * Muestra el Diálogo Resumen de Entrenamiento (`dialog_workout_summary.xml`),
   * permitiendo Guardar sesión normal, "Finalizar antes" guardando lo registrado o Descartar.
   */
  function openFinishSummaryDialog() {
    const { totalVolume, totalSets, completedSets, recordedSetsWithValues } =
      computeLiveStats();
    const elapsedSec = getElapsedSeconds();
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const durationText = `${mins}m ${secs}s`;
    const isEndingEarly = completedSets < totalSets;

    showDialog({
      contentHtml: `
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;">
          <span style="color:var(--primary-neon);display:flex;">
            ${icon('ic_check', { size: 54 })}
          </span>
          <h3 class="text-value" style="font-size:20px;">
            ${isEndingEarly ? '¿Finalizar entrenamiento?' : '¡Entrenamiento Completado!'}
          </h3>
          <p class="text-body" style="font-size:13px;">
            ${
              isEndingEarly
                ? 'Puedes finalizar antes y guardar todo tu avance registrado hasta este momento.'
                : 'Excelente trabajo, sigue construyendo tu fuerza.'
            }
          </p>

          <!-- Grilla de 3 Estadísticas (TIEMPO | VOLUMEN | SERIES) -->
          <div
            style="width:100%;display:flex;align-items:center;background:var(--surface-input);border:1px solid var(--surface-card-stroke);border-radius:12px;padding:14px 8px;margin-top:6px;"
          >
            <div style="flex:1;">
              <div class="text-caption" style="font-size:10px;font-weight:700;">TIEMPO</div>
              <div class="text-card-title" style="font-size:16px;margin-top:2px;">${durationText}</div>
            </div>
            <div style="width:1px;height:32px;background:var(--surface-card-stroke);"></div>
            <div style="flex:1;">
              <div class="text-caption" style="font-size:10px;font-weight:700;">VOLUMEN</div>
              <div class="text-card-title" style="font-size:16px;color:var(--primary-neon);margin-top:2px;">
                ${Math.round(totalVolume).toLocaleString('es-CO')} kg
              </div>
            </div>
            <div style="width:1px;height:32px;background:var(--surface-card-stroke);"></div>
            <div style="flex:1;">
              <div class="text-caption" style="font-size:10px;font-weight:700;">SERIES</div>
              <div class="text-card-title" style="font-size:16px;margin-top:2px;">
                ${completedSets} / ${totalSets}
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div style="width:100%;display:flex;flex-direction:column;gap:8px;margin-top:10px;">
            <button
              type="button"
              id="btnSaveAndFinishWorkout"
              class="btn btn-neon"
              style="width:100%;min-height:48px;"
              ${recordedSetsWithValues === 0 ? 'disabled' : ''}
            >
              ${isEndingEarly ? 'Finalizar antes y guardar avance' : 'Guardar y Continuar'}
            </button>

            <div style="display:flex;gap:8px;width:100%;">
              <button type="button" id="btnKeepTraining" class="btn btn-outlined" style="flex:1;">
                Seguir entrenando
              </button>
              <button
                type="button"
                id="btnDiscardWorkout"
                class="btn btn-outlined"
                style="color:var(--accent-red);border-color:var(--accent-red);"
              >
                Salir sin guardar
              </button>
            </div>
          </div>
        </div>
      `,
      onMount: (box, close) => {
        box.querySelector('#btnKeepTraining')?.addEventListener('click', close);

        box.querySelector('#btnDiscardWorkout')?.addEventListener('click', () => {
          close();
          stopAllTimers();
          showToast('Sesión descartada');
          onFinished();
        });

        box
          .querySelector('#btnSaveAndFinishWorkout')
          ?.addEventListener('click', () => {
            const res = WorkoutService.saveWorkoutSession({
              title: activeWorkout.title,
              isImprovised: activeWorkout.isImprovised,
              endedEarly: isEndingEarly,
              durationSec: getElapsedSeconds(),
              workoutExercises: activeWorkout.workoutExercises,
            });

            if (!res.ok) {
              showToast(res.error || 'Marca al menos una serie para guardar', {
                type: 'error',
              });
              return;
            }

            close();
            stopAllTimers();
            showToast('¡Entrenamiento guardado con éxito!', { type: 'success' });
            onFinished();
          });
      },
    });
  }

  function renderExercisesList() {
    const listEl = container.querySelector('#liveExercisesContainer');
    if (!listEl) return;

    if (activeWorkout.workoutExercises.length === 0) {
      listEl.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 24px;gap:10px;">
          <span style="color:var(--text-muted);display:flex;">
            ${icon('ic_fitness_center', { size: 60 })}
          </span>
          <h2 class="text-section" style="font-size:18px;margin-top:6px;">
            Tu entrenamiento está vacío
          </h2>
          <p class="text-body">
            Toca el botón inferior <b>«+ Añadir Ejercicio»</b> para buscar en el catálogo o crear un ejercicio propio sobre la marcha.
          </p>
        </div>
      `;
      updateSummaryNumbersUI();
      return;
    }

    listEl.innerHTML = activeWorkout.workoutExercises
      .map((item, exIdx) => {
        const ex = item.exercise;
        const setsRowsHtml = item.sets
          .map((set, setIdx) => {
            set.setNumber = setIdx + 1;
            const weightVal =
              set.weightKg > 0 ? String(set.weightKg) : '';
            const repsVal = set.reps > 0 ? String(set.reps) : '';

            return `
              <div class="set-row">
                <span style="width:34px;text-align:center;font-weight:700;color:var(--text-secondary);">
                  ${set.setNumber}
                </span>
                <span style="flex:1.2;text-align:center;font-size:12px;color:var(--text-muted);">
                  ${set.previousInfo || '-'}
                </span>
                <input
                  class="input-compact"
                  style="flex:1;"
                  type="text"
                  inputmode="decimal"
                  placeholder="0"
                  value="${weightVal}"
                  data-weight-ex="${exIdx}"
                  data-weight-set="${setIdx}"
                  aria-label="Peso serie ${set.setNumber}"
                />
                <input
                  class="input-compact"
                  style="flex:1;"
                  type="text"
                  inputmode="numeric"
                  placeholder="0"
                  value="${repsVal}"
                  data-reps-ex="${exIdx}"
                  data-reps-set="${setIdx}"
                  aria-label="Repeticiones serie ${set.setNumber}"
                />
                <button
                  type="button"
                  class="set-check-btn ${set.isCompleted ? 'set-check-btn--done' : ''}"
                  data-check-ex="${exIdx}"
                  data-check-set="${setIdx}"
                  aria-label="Completar serie ${set.setNumber}"
                >
                  ${icon('ic_check', { size: 20 })}
                </button>
              </div>
            `;
          })
          .join('');

        return `
          <div class="exercise-card">
            <!-- Cabecera del Ejercicio + Cambiar / Eliminar -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
              <div>
                <h3 class="text-section" style="font-size:17px;">${ex.name}</h3>
                <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                  <span
                    style="background:var(--surface-input);border:1px solid var(--surface-card-stroke);border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;color:var(--primary-neon);"
                  >
                    ${(ex.muscleGroup || 'PECHO').toUpperCase()}
                  </span>
                  <span class="text-caption">${ex.equipment || 'Libre'}</span>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:6px;">
                <button
                  type="button"
                  class="rest-ctrl-btn"
                  data-swap-ex="${exIdx}"
                  title="Cambiar este ejercicio por otro"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  class="auth-back-btn"
                  style="width:32px;height:32px;color:var(--text-muted);"
                  data-delete-ex="${exIdx}"
                  aria-label="Eliminar ejercicio"
                >
                  ${icon('ic_delete', { size: 18 })}
                </button>
              </div>
            </div>

            <div style="height:1px;background:var(--surface-card-stroke);"></div>

            <!-- Cabecera de Tabla de Series -->
            <div class="set-table-header">
              <span style="width:34px;text-align:center;">SERIE</span>
              <span style="flex:1.2;text-align:center;">ANTERIOR</span>
              <span style="flex:1;text-align:center;">KG</span>
              <span style="flex:1;text-align:center;">REPS</span>
              <span style="width:40px;text-align:center;">✓</span>
            </div>

            <!-- Filas de Series -->
            <div style="display:flex;flex-direction:column;gap:4px;">
              ${setsRowsHtml}
            </div>

            <!-- Botón Añadir Serie -->
            <button
              type="button"
              class="btn"
              data-add-set="${exIdx}"
              style="width:100%;min-height:38px;background:var(--surface-dark);border:1px solid var(--surface-card-stroke);border-radius:8px;color:var(--primary-neon);font-size:13px;margin-top:4px;"
            >
              + Añadir Serie
            </button>
          </div>
        `;
      })
      .join('');

    // Listeners de inputs KG
    listEl.querySelectorAll('[data-weight-ex]').forEach((input) => {
      input.addEventListener('input', () => {
        const eIdx = Number(input.getAttribute('data-weight-ex'));
        const sIdx = Number(input.getAttribute('data-weight-set'));
        const target = activeWorkout.workoutExercises[eIdx]?.sets[sIdx];
        if (!target) return;
        const val = Number(String(input.value).replace(',', '.'));
        target.weightKg = Number.isNaN(val) ? 0 : Math.max(0, val);
        updateSummaryNumbersUI();
      });
    });

    // Listeners de inputs REPS
    listEl.querySelectorAll('[data-reps-ex]').forEach((input) => {
      input.addEventListener('input', () => {
        const eIdx = Number(input.getAttribute('data-reps-ex'));
        const sIdx = Number(input.getAttribute('data-reps-set'));
        const target = activeWorkout.workoutExercises[eIdx]?.sets[sIdx];
        if (!target) return;
        const val = parseInt(input.value, 10);
        target.reps = Number.isNaN(val) ? 0 : Math.max(0, val);
        updateSummaryNumbersUI();
      });
    });

    // Listeners de Check de Serie (✓) -> inicia descanso automático
    listEl.querySelectorAll('[data-check-ex]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eIdx = Number(btn.getAttribute('data-check-ex'));
        const sIdx = Number(btn.getAttribute('data-check-set'));
        const target = activeWorkout.workoutExercises[eIdx]?.sets[sIdx];
        if (!target) return;
        target.isCompleted = !target.isCompleted;
        btn.classList.toggle('set-check-btn--done', target.isCompleted);
        updateSummaryNumbersUI();
        if (target.isCompleted) {
          startRestCountdown(programmedRestSec);
        }
      });
    });

    // Añadir Serie copiando valores de la anterior
    listEl.querySelectorAll('[data-add-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eIdx = Number(btn.getAttribute('data-add-set'));
        const item = activeWorkout.workoutExercises[eIdx];
        if (!item) return;
        const nextNum = item.sets.length + 1;
        const lastSet = item.sets[item.sets.length - 1];
        const prevFromHistory = WorkoutService.getPreviousSetInfo(
          item.exercise.name,
          nextNum
        );
        const fallbackPrev =
          lastSet && lastSet.weightKg > 0
            ? `${lastSet.weightKg} kg × ${lastSet.reps}`
            : '-';

        item.sets.push({
          setNumber: nextNum,
          previousInfo:
            prevFromHistory !== '-' ? prevFromHistory : fallbackPrev,
          weightKg: lastSet ? lastSet.weightKg : 0,
          reps: lastSet ? lastSet.reps : DEFAULT_REPS_COUNT,
          isCompleted: false,
        });
        renderExercisesList();
      });
    });

    // Cambiar ejercicio sobre la marcha
    listEl.querySelectorAll('[data-swap-ex]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eIdx = Number(btn.getAttribute('data-swap-ex'));
        const currentItem = activeWorkout.workoutExercises[eIdx];
        if (!currentItem) return;

        openExercisePickerSheet({
          modeTitle: `Cambiar «${currentItem.exercise.name}» por:`,
          onSelectExercise: (newExercise) => {
            activeWorkout.workoutExercises[eIdx] = {
              exercise: newExercise,
              sets: buildInitialSets(newExercise.name, DEFAULT_REPS_COUNT),
            };
            showToast(`Ejercicio cambiado a ${newExercise.name}`);
            renderExercisesList();
          },
        });
      });
    });

    // Eliminar ejercicio de la sesión
    listEl.querySelectorAll('[data-delete-ex]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const eIdx = Number(btn.getAttribute('data-delete-ex'));
        activeWorkout.workoutExercises.splice(eIdx, 1);
        renderExercisesList();
      });
    });

    updateSummaryNumbersUI();
  }

  // Renderizar estructura base de la pantalla en vivo
  container.innerHTML = `
    <div class="workout-live">
      <!-- 1. Top App Bar -->
      <header class="workout-topbar">
        <div style="overflow:hidden;">
          <div class="workout-brand-tag">ATLAS GYM</div>
          <h1
            id="tvWorkoutTitle"
            class="text-value"
            style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          >
            ${activeWorkout.title}
          </h1>
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
            <span style="color:var(--text-secondary);display:flex;">
              ${icon('ic_timer', { size: 14 })}
            </span>
            <span id="chronoWorkoutTime" class="text-body" style="font-size:13px;font-variant-numeric:tabular-nums;">
              00:00
            </span>
            <button
              type="button"
              id="btnRestPresetLabel"
              class="rest-ctrl-btn"
              style="padding:2px 8px;font-size:11px;margin-left:6px;color:var(--accent-orange);"
              title="Programar tiempo de descanso"
            >
              ⏱ ${programmedRestSec}s
            </button>
          </div>
        </div>

        <button
          type="button"
          id="btnFinishWorkout"
          class="btn btn-neon"
          style="min-height:40px;padding:0 16px;font-size:13px;border-radius:10px;flex-shrink:0;"
        >
          Finalizar
        </button>
      </header>

      <!-- 2. Quick Workout Summary Bar -->
      <div class="workout-summary-bar">
        <div class="workout-summary-bar__col">
          <span class="text-caption" style="font-size:10px;font-weight:700;">VOLUMEN TOTAL</span>
          <span id="tvTotalVolume" class="text-card-title">0 kg</span>
        </div>
        <div class="workout-summary-bar__divider"></div>
        <div class="workout-summary-bar__col">
          <span class="text-caption" style="font-size:10px;font-weight:700;">SERIES COMPLETADAS</span>
          <span id="tvCompletedSetsCount" class="text-card-title">0 de 0</span>
        </div>
      </div>

      <!-- 3. Rest Timer Bar (Dinámica) -->
      <div id="layoutRestTimer" class="rest-timer-bar" style="display:none;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="color:var(--accent-orange);display:flex;">
            ${icon('ic_timer', { size: 18 })}
          </span>
          <span class="text-body" style="font-size:13px;">Descanso:</span>
          <span
            id="tvRestTimerSeconds"
            style="font-size:16px;font-weight:700;color:var(--accent-orange);font-variant-numeric:tabular-nums;"
          >
            01:30
          </span>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" id="btnRestCfgInline" class="rest-ctrl-btn" title="Cambiar duración">
            Ajustar
          </button>
          <button type="button" id="btnAdd15s" class="rest-ctrl-btn">
            +15s
          </button>
          <button type="button" id="btnSkipTimer" class="rest-ctrl-btn" style="color:var(--text-secondary);">
            Saltar
          </button>
        </div>
      </div>

      <!-- 4. Lista de Ejercicios -->
      <main
        id="liveExercisesContainer"
        style="flex:1;display:flex;flex-direction:column;gap:12px;padding:12px 12px 92px;"
      ></main>

      <!-- 5. Barra Inferior Fija: Añadir Ejercicio -->
      <div class="workout-bottom-bar">
        <button
          type="button"
          id="btnAddExercise"
          class="btn"
          style="width:100%;min-height:52px;background:var(--surface-card);border:1px solid var(--primary-neon);border-radius:14px;color:var(--primary-neon);font-size:15px;"
        >
          + Añadir Ejercicio
        </button>
      </div>
    </div>
  `;

  renderExercisesList();

  // Cronómetro principal de sesión
  sessionTimerId = setInterval(() => {
    const chronoEl = container.querySelector('#chronoWorkoutTime');
    if (chronoEl) {
      chronoEl.textContent = formatClock(getElapsedSeconds());
    }
  }, 1000);

  // Configurar descanso programable
  container
    .querySelector('#btnRestPresetLabel')
    ?.addEventListener('click', openRestConfigDialog);
  container
    .querySelector('#btnRestCfgInline')
    ?.addEventListener('click', openRestConfigDialog);

  // +15s al descanso activo
  container.querySelector('#btnAdd15s')?.addEventListener('click', () => {
    restEndTimeMs += 15000;
    updateRestBarUI();
  });

  // Saltar descanso
  container.querySelector('#btnSkipTimer')?.addEventListener('click', () => {
    if (restTimerId) {
      clearInterval(restTimerId);
      restTimerId = null;
    }
    isRestRunning = false;
    updateRestBarUI();
  });

  // Añadir Ejercicio a la sesión
  container.querySelector('#btnAddExercise')?.addEventListener('click', () => {
    openExercisePickerSheet({
      modeTitle: 'Añadir Ejercicio a la Sesión',
      onSelectExercise: (exercise) => {
        activeWorkout.workoutExercises.push({
          exercise,
          sets: buildInitialSets(exercise.name, 0),
        });
        renderExercisesList();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
    });
  });

  // Finalizar / Finalizar antes
  container
    .querySelector('#btnFinishWorkout')
    ?.addEventListener('click', openFinishSummaryDialog);
}
