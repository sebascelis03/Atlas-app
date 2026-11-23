/**
 * Servicio de Registros Rápidos Diarios (Pestaña 1: Inicio & Pestaña 3: Dashboard).
 *
 * Principio de Pizarra Limpia (Clean Slate):
 * - Cero pesos inventados o pre-cargados (inicia en null hasta que el usuario registre su peso real).
 * - Vasos de agua inician en 0 y se reinician automáticamente al cambiar de fecha (`yyyy-MM-dd`).
 */

import { daysAgo, key, today } from '../core/date.js';
import { getCollection, saveCollection } from '../core/storage.js';
import { scopedKey } from '../core/userScope.js';

const KEY_WATER_BY_DAY = 'daily_water';
const KEY_WEIGHT_ENTRIES = 'daily_weight';

// ============================================================================
// 1. Hidratación Diaria (Vasos de Agua)
// ============================================================================

export function getTodayWater(dateKey = today()) {
  const map = getCollection(scopedKey(KEY_WATER_BY_DAY), {});
  return Math.max(0, Number(map?.[dateKey]) || 0);
}

export function setTodayWater(glasses, dateKey = today()) {
  const clean = Math.max(0, Math.floor(Number(glasses) || 0));
  const storageKey = scopedKey(KEY_WATER_BY_DAY);
  const map = getCollection(storageKey, {});
  map[dateKey] = clean;
  saveCollection(storageKey, map);
  return clean;
}

export function incrementWater() {
  return setTodayWater(getTodayWater() + 1);
}

export function decrementWater() {
  return setTodayWater(Math.max(0, getTodayWater() - 1));
}

// ============================================================================
// 2. Peso Corporal Diario (Serie Fechada)
// ============================================================================

export function getWeightHistory() {
  const list = getCollection(scopedKey(KEY_WEIGHT_ENTRIES), []);
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) =>
    a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0
  );
}

export function saveWeight(weightKg, dateKey = today()) {
  const raw = String(weightKg ?? '').trim();
  if (!raw) {
    return { ok: false, error: 'Ingresa tu peso corporal' };
  }
  const parsed = Number(raw.replace(',', '.'));
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

  list.sort((a, b) =>
    a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0
  );
  saveCollection(storageKey, list);

  return { ok: true, entry };
}

/**
 * Ajusta el peso actual en pasos (ej. ±0.5 kg) solo si ya existe un peso registrado.
 * @param {number} step
 */
export function adjustWeightStep(step = 0.5) {
  const base = getLatestWeight();
  if (base === null) {
    return { ok: false, error: 'Registra primero tu peso inicial' };
  }
  const next = Math.max(30, Math.min(300, Math.round((base + step) * 10) / 10));
  return saveWeight(next);
}

export function getLatestWeight() {
  const history = getWeightHistory();
  return history.length > 0 ? history[0].weightKg : null;
}

export function getPreviousWeight() {
  const history = getWeightHistory();
  return history.length > 1 ? history[1].weightKg : null;
}

export function getWeightDelta() {
  const latest = getLatestWeight();
  const prev = getPreviousWeight();
  if (latest === null || prev === null) return null;
  return Math.round((latest - prev) * 10) / 10;
}

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
