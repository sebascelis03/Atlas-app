/**
 * Servicio de Registros Rápidos Diarios (Pestaña 1: Inicio & Pestaña 3: Dashboard).
 *
 * Gestiona por usuario y con fechas reales (`yyyy-MM-dd`):
 * 1. Vasos de agua del día (se reinicia automáticamente al cambiar de fecha, conservando historial diario).
 * 2. Peso corporal diario (un registro por fecha, upsert en el día actual, deltas y serie histórica para gráficas).
 */

import { daysAgo, key, today } from '../core/date.js';
import { getCollection, saveCollection } from '../core/storage.js';
import { scopedKey } from '../core/userScope.js';

const KEY_WATER_BY_DAY = 'daily_water';
const KEY_WEIGHT_ENTRIES = 'daily_weight';

// ============================================================================
// 1. Hidratación Diaria (Vasos de Agua)
// ============================================================================

/**
 * Devuelve la cantidad de vasos de agua registrados en la fecha indicada (por defecto hoy).
 * Al cambiar de día, devuelve automáticamente 0 para el nuevo día.
 * @param {string} [dateKey]
 * @returns {number}
 */
export function getTodayWater(dateKey = today()) {
  const map = getCollection(scopedKey(KEY_WATER_BY_DAY), {});
  return Math.max(0, Number(map?.[dateKey]) || 0);
}

/**
 * Fija la cantidad de vasos de agua de hoy.
 * @param {number} glasses
 * @param {string} [dateKey]
 * @returns {number}
 */
export function setTodayWater(glasses, dateKey = today()) {
  const clean = Math.max(0, Math.floor(Number(glasses) || 0));
  const storageKey = scopedKey(KEY_WATER_BY_DAY);
  const map = getCollection(storageKey, {});
  map[dateKey] = clean;
  saveCollection(storageKey, map);
  return clean;
}

/** Suma 1 vaso de agua al contador de hoy. */
export function incrementWater() {
  return setTodayWater(getTodayWater() + 1);
}

/** Resta 1 vaso de agua al contador de hoy (mínimo 0). */
export function decrementWater() {
  return setTodayWater(Math.max(0, getTodayWater() - 1));
}

// ============================================================================
// 2. Peso Corporal Diario (Serie Fechada)
// ============================================================================

/**
 * Devuelve todos los registros de peso ordenados del más reciente al más antiguo.
 * @returns {Array<{ dateKey: string, weightKg: number }>}
 */
export function getWeightHistory() {
  const list = getCollection(scopedKey(KEY_WEIGHT_ENTRIES), []);
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));
}

/**
 * Registra o actualiza el peso corporal de una fecha (por defecto hoy, entre 30 y 300 kg).
 * @param {number | string} weightKg
 * @param {string} [dateKey]
 * @returns {{ ok: boolean, entry?: { dateKey: string, weightKg: number }, error?: string }}
 */
export function saveWeight(weightKg, dateKey = today()) {
  const parsed = Number(String(weightKg).replace(',', '.'));
  if (Number.isNaN(parsed) || parsed < 30 || parsed > 300) {
    return { ok: false, error: 'Ingresa un peso válido entre 30 y 300 kg' };
  }

  const rounded = Math.round(parsed * 10) / 10;
  const storageKey = scopedKey(KEY_WEIGHT_ENTRIES);
  const list = getWeightHistory();
  const idx = list.findIndex((item) => item.dateKey === dateKey);

  const entry = { dateKey, weightKg: rounded };
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.unshift(entry);
  }

  list.sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));
  saveCollection(storageKey, list);

  return { ok: true, entry };
}

/**
 * Ajusta el peso actual en pasos (ej. ±0.5 kg) y lo guarda en la fecha de hoy.
 * @param {number} step
 */
export function adjustWeightStep(step = 0.5) {
  const base = getLatestWeight() ?? 70.0;
  const next = Math.max(30, Math.min(300, Math.round((base + step) * 10) / 10));
  return saveWeight(next);
}

/** Último peso registrado o null si aún no hay registros. */
export function getLatestWeight() {
  const history = getWeightHistory();
  return history.length > 0 ? history[0].weightKg : null;
}

/** Peso inmediatamente anterior al más reciente (para calcular delta). */
export function getPreviousWeight() {
  const history = getWeightHistory();
  return history.length > 1 ? history[1].weightKg : null;
}

/** Diferencia entre el último peso y el anterior (o null si solo hay 0-1 registros). */
export function getWeightDelta() {
  const latest = getLatestWeight();
  const prev = getPreviousWeight();
  if (latest === null || prev === null) return null;
  return Math.round((latest - prev) * 10) / 10;
}

/**
 * Serie cronológica de peso (antiguo -> reciente) para la gráfica de línea del Dashboard.
 * @param {number} [rangeDays] Si se especifica (ej. 7, 30, 90), filtra desde hace `rangeDays` días.
 * @returns {Array<{ dateKey: string, weightKg: number }>}
 */
export function getWeightSeries(rangeDays) {
  let list = getWeightHistory().reverse();
  if (rangeDays && Number(rangeDays) > 0) {
    const fromKey = key(daysAgo(Number(rangeDays) - 1));
    list = list.filter((item) => item.dateKey >= fromKey);
  }
  return list;
}

export const DailyLogService = {
  getTodayWater,
  setTodayWater,
  incrementWater,
  decrementWater,
  getWeightHistory,
  saveWeight,
  adjustWeightStep,
  getLatestWeight,
  getPreviousWeight,
  getWeightDelta,
  getWeightSeries,
};
