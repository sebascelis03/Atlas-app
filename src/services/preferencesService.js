/**
 * Servicio de Preferencias por Usuario (Menú Superior de Perfil -> Preferencias).
 *
 * Controla:
 * - theme: 'dark' | 'light'
 * - defaultRestSeconds: segundos por defecto para el temporizador de descanso (ej. 90)
 * - soundEnabled: alarma sonora sutil al terminar el descanso
 * - vibrationEnabled: vibración al terminar el descanso
 * - weeklyGoal: meta semanal de entrenamientos (1 a 7, por defecto 4)
 * - targetWeightKg: peso corporal objetivo (por defecto 75.0)
 * - waterGoal: meta diaria de vasos de agua (por defecto 8)
 */

import { getCollection, saveCollection } from '../core/storage.js';
import { scopedKey } from '../core/userScope.js';

const BASE_KEY = 'preferences';

export const DEFAULT_PREFERENCES = {
  theme: 'dark',
  defaultRestSeconds: 90,
  soundEnabled: true,
  vibrationEnabled: true,
  weeklyGoal: 4,
  targetWeightKg: 75.0,
  waterGoal: 8,
};

/**
 * Obtiene las preferencias del usuario activo.
 * @returns {typeof DEFAULT_PREFERENCES}
 */
export function getPreferences() {
  const stored = getCollection(scopedKey(BASE_KEY), null);
  return {
    ...DEFAULT_PREFERENCES,
    ...(stored || {}),
  };
}

/**
 * Actualiza una o varias preferencias del usuario activo y aplica el atributo de tema al DOM.
 * @param {Partial<typeof DEFAULT_PREFERENCES>} partial
 * @returns {typeof DEFAULT_PREFERENCES}
 */
export function updatePreferences(partial) {
  const current = getPreferences();
  const next = {
    ...current,
    ...partial,
  };

  next.theme = next.theme === 'light' ? 'light' : 'dark';
  next.defaultRestSeconds = Math.max(10, Math.min(600, Number(next.defaultRestSeconds) || 90));
  next.weeklyGoal = Math.max(1, Math.min(7, Number(next.weeklyGoal) || 4));
  next.targetWeightKg = Math.max(30, Math.min(300, Number(next.targetWeightKg) || 75.0));
  next.waterGoal = Math.max(1, Math.min(20, Number(next.waterGoal) || 8));
  next.soundEnabled = Boolean(next.soundEnabled);
  next.vibrationEnabled = Boolean(next.vibrationEnabled);

  saveCollection(scopedKey(BASE_KEY), next);
  applyThemeToDocument(next.theme);
  return next;
}

/**
 * Aplica el atributo `data-theme` en `<html>` para cambiar entre modo oscuro y claro.
 * @param {'dark' | 'light'} [theme]
 */
export function applyThemeToDocument(theme = getPreferences().theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export const PreferencesService = {
  DEFAULT_PREFERENCES,
  getPreferences,
  updatePreferences,
  applyThemeToDocument,
};
