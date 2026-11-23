/**
 * Punto de entrada unificado de la Capa de Datos y Almacenamiento Híbrido de ATLAS.
 */

import { DateHelper } from '../core/date.js';
import { initStorage, StorageEngine } from '../core/storage.js';
import { getUserId, scopedKey } from '../core/userScope.js';
import { AuthService, initAuth } from './authService.js';
import { BlockService } from './blockService.js';
import { DailyLogService } from './dailyLogService.js';
import { ExerciseCatalog } from './exerciseCatalog.js';
import { applyThemeToDocument, PreferencesService } from './preferencesService.js';
import { WorkoutService } from './workoutService.js';

/**
 * Inicializa el motor de almacenamiento híbrido, la autenticación y el tema visual activo.
 */
export async function initAtlasDataLayer() {
  await initStorage();
  initAuth();
  applyThemeToDocument();
}

export {
  AuthService,
  BlockService,
  DailyLogService,
  DateHelper,
  ExerciseCatalog,
  getUserId,
  PreferencesService,
  scopedKey,
  StorageEngine,
  WorkoutService,
};
