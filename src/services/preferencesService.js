/**
 * Servicio de Preferencias por Usuario (Menú Superior de Perfil -> Preferencias).
 *
 * - Tema oscuro ('dark') activo de forma predeterminada al iniciar la aplicación.
 * - Peso meta inicia en 0 (sin valor ficticio pre-rellenado hasta que el usuario lo configure).
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
  targetWeightKg: 0,
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

  const rawTarget = Number(next.targetWeightKg);
  next.targetWeightKg =
    !Number.isNaN(rawTarget) && rawTarget >= 30 && rawTarget <= 300
      ? Math.round(rawTarget * 10) / 10
      : 0;

  next.waterGoal = Math.max(1, Math.min(20, Number(next.waterGoal) || 8));
  next.soundEnabled = Boolean(next.soundEnabled);
  next.vibrationEnabled = Boolean(next.vibrationEnabled);

  saveCollection(scopedKey(BASE_KEY), next);
  applyThemeToDocument(next.theme);
  return next;
}

/**
 * Aplica el atributo `data-theme` en `<html>` (por defecto 'dark').
 * @param {'dark' | 'light'} [theme]
 */
export function applyThemeToDocument(theme = getPreferences().theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme || 'dark');
  }
}

export const PreferencesService = {
  DEFAULT_PREFERENCES,
  getPreferences,
  updatePreferences,
  applyThemeToDocument,
};
