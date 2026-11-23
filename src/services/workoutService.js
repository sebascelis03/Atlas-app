/**
 * Servicio de Entrenamientos e Historial de Sesiones (Sesión en Vivo + Dashboard).
 *
 * Soporta:
 * - Sesiones iniciadas desde un bloque guardado o desde "Iniciar rutina improvisada".
 * - Cambiar un ejercicio por otro sobre la marcha o agregar nuevos ejercicios.
 * - Finalizar normalmente o "Finalizar antes" guardando todo lo registrado hasta ese momento.
 * - Consulta real de marca "ANTERIOR" (`kg × reps`) por ejercicio y número de serie.
 * - Estadísticas dinámicas por fechas reales: racha, volumen semanal, sesiones por rango (7/30/90 días) y récords personales.
 */

import { daysAgo, key, startOfWeek, today } from '../core/date.js';
import { getCollection, saveCollection } from '../core/storage.js';
import { scopedKey } from '../core/userScope.js';

const KEY_WORKOUT_LOGS = 'workout_logs';

/**
 * Devuelve todos los entrenamientos del usuario activo (del más reciente al más antiguo).
 * @returns {Array<{
 *   id: string,
 *   dateKey: string,
 *   timestamp: number,
 *   title: string,
 *   isImprovised: boolean,
 *   endedEarly: boolean,
 *   durationSec: number,
 *   volumeKg: number,
 *   sets: number,
 *   exercises: number,
 *   exerciseDetails: Array<{ name: string, muscleGroup: string, sets: Array<{ setNumber: number, weightKg: number, reps: number, isCompleted: boolean }> }>,
 *   lifts: Array<{ name: string, weightKg: number }>
 * }>}
 */
export function getAllWorkouts() {
  const logs = getCollection(scopedKey(KEY_WORKOUT_LOGS), []);
  return Array.isArray(logs) ? logs : [];
}

/**
 * Guarda una sesión de entrenamiento (completa o finalizada antes).
 * Si hay series registradas (completadas o con peso/reps > 0 cuando se finaliza antes), las persiste.
 * @param {{
 *   title?: string,
 *   isImprovised?: boolean,
 *   endedEarly?: boolean,
 *   durationSec: number,
 *   workoutExercises: Array<{
 *     exercise: { name: string, muscleGroup?: string },
 *     sets: Array<{ setNumber?: number, weightKg: number, reps: number, isCompleted: boolean }>
 *   }>
 * }} session
 * @returns {{ ok: boolean, log?: object, error?: string }}
 */
export function saveWorkoutSession(session) {
  const workoutExercises = Array.isArray(session?.workoutExercises)
    ? session.workoutExercises
    : [];

  let volumeKg = 0;
  let totalSetsSaved = 0;
  let exercisesDone = 0;
  const lifts = [];
  const exerciseDetails = [];

  for (const item of workoutExercises) {
    const exName = item?.exercise?.name || 'Ejercicio';
    const exMuscle = item?.exercise?.muscleGroup || 'Pecho';
    const rawSets = Array.isArray(item?.sets) ? item.sets : [];

    // Al finalizar antes, también guardamos series que tengan reps > 0 aunque no se haya pulsado el check
    const validSets = rawSets.filter(
      (s) => s.isCompleted || (session?.endedEarly && (Number(s.reps) > 0 || Number(s.weightKg) > 0))
    );

    if (validSets.length > 0) {
      exercisesDone++;
      let bestWeight = 0;

      const normalizedSets = validSets.map((s, idx) => {
        const w = Math.max(0, Number(s.weightKg) || 0);
        const r = Math.max(0, Math.floor(Number(s.reps) || 0));
        totalSetsSaved++;
        volumeKg += w * r;
        if (w > bestWeight) bestWeight = w;

        return {
          setNumber: idx + 1,
          weightKg: w,
          reps: r,
          isCompleted: true,
        };
      });

      if (bestWeight > 0) {
        lifts.push({ name: exName, weightKg: bestWeight });
      }

      exerciseDetails.push({
        name: exName,
        muscleGroup: exMuscle,
        sets: normalizedSets,
      });
    }
  }

  if (totalSetsSaved === 0) {
    return {
      ok: false,
      error: 'Completa o registra al menos una serie para guardar el entrenamiento',
    };
  }

  const log = {
    id: `w_${Date.now()}`,
    dateKey: today(),
    timestamp: Date.now(),
    title: String(session?.title || 'Entrenamiento Libre').trim(),
    isImprovised: Boolean(session?.isImprovised),
    endedEarly: Boolean(session?.endedEarly),
    durationSec: Math.max(1, Math.floor(Number(session?.durationSec) || 0)),
    volumeKg: Math.round(volumeKg * 10) / 10,
    sets: totalSetsSaved,
    exercises: exercisesDone,
    exerciseDetails,
    lifts,
  };

  const all = getAllWorkouts();
  all.unshift(log);
  saveCollection(scopedKey(KEY_WORKOUT_LOGS), all);

  return { ok: true, log: structuredClone(log) };
}

/**
 * Obtiene la marca anterior ("80 kg × 10") de un ejercicio para mostrar en la columna ANTERIOR.
 * @param {string} exerciseName
 * @param {number} [setNumber]
 * @returns {string}
 */
export function getPreviousSetInfo(exerciseName, setNumber = 1) {
  const clean = String(exerciseName || '').trim().toLowerCase();
  if (!clean) return '-';

  for (const log of getAllWorkouts()) {
    const foundEx = (log.exerciseDetails || []).find(
      (e) => e.name.toLowerCase() === clean
    );
    if (foundEx && Array.isArray(foundEx.sets) && foundEx.sets.length > 0) {
      const targetSet =
        foundEx.sets[setNumber - 1] || foundEx.sets[foundEx.sets.length - 1];
      if (targetSet && (targetSet.weightKg > 0 || targetSet.reps > 0)) {
        return `${targetSet.weightKg} kg × ${targetSet.reps}`;
      }
    }
  }
  return '-';
}

/** Total histórico de sesiones del usuario activo. */
export function getTotalWorkouts() {
  return getAllWorkouts().length;
}

/** Conjunto de fechas `yyyy-MM-dd` con al menos un entrenamiento. */
export function getDaysTrainedSet() {
  return new Set(getAllWorkouts().map((l) => l.dateKey));
}

/** Indica si el usuario ya entrenó hoy. */
export function hasTrainedToday() {
  const todayKey = today();
  return getAllWorkouts().some((l) => l.dateKey === todayKey);
}

/** Entrenamientos de la semana actual (Lunes a Domingo). */
export function getThisWeekWorkouts() {
  const mondayKey = key(startOfWeek());
  return getAllWorkouts().filter((l) => l.dateKey >= mondayKey);
}

/** Cantidad de entrenamientos en la semana actual. */
export function getThisWeekCount() {
  return getThisWeekWorkouts().length;
}

/** Volumen total levantado (kg) en la semana actual. */
export function getThisWeekVolume() {
  return getThisWeekWorkouts().reduce((acc, l) => acc + (Number(l.volumeKg) || 0), 0);
}

/**
 * Racha de días consecutivos entrenando (se mantiene viva si entrenó hoy o ayer).
 * @returns {number}
 */
export function getStreakDays() {
  const days = getDaysTrainedSet();
  if (days.size === 0) return 0;

  const cursor = daysAgo(0);
  if (!days.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(key(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(key(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Filtra sesiones en los últimos `days` días (incluido hoy).
 * @param {number} days
 */
export function getWorkoutsInLastDays(days = 7) {
  const fromKey = key(daysAgo(Math.max(1, days) - 1));
  return getAllWorkouts().filter((l) => l.dateKey >= fromKey);
}

/**
 * Ranking de récords personales (mejor peso histórico por ejercicio, de mayor a menor).
 * @returns {Array<{ name: string, weightKg: number, dateKey: string }>}
 */
export function getPersonalRecords() {
  const bestMap = new Map();
  for (const log of getAllWorkouts()) {
    for (const lift of log.lifts || []) {
      const current = bestMap.get(lift.name);
      if (!current || lift.weightKg > current.weightKg) {
        bestMap.set(lift.name, {
          name: lift.name,
          weightKg: lift.weightKg,
          dateKey: log.dateKey,
        });
      }
    }
  }
  return [...bestMap.values()].sort((a, b) => b.weightKg - a.weightKg);
}

export const WorkoutService = {
  getAllWorkouts,
  saveWorkoutSession,
  getPreviousSetInfo,
  getTotalWorkouts,
  getDaysTrainedSet,
  hasTrainedToday,
  getThisWeekWorkouts,
  getThisWeekCount,
  getThisWeekVolume,
  getStreakDays,
  getWorkoutsInLastDays,
  getPersonalRecords,
};
