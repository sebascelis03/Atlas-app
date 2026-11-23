/**
 * Servicio de Rutinas / Bloques de Entrenamiento (Pestaña 2: Rutinas).
 *
 * Según la definición funcional definitiva:
 * - Los bloques tienen nombre libre definido por el usuario y NO están atados a días fijos.
 * - Cada bloque contiene ejercicios tanto del catálogo base como creados por el usuario ("Crear ejercicio propio").
 * - Se siembran 4 bloques iniciales por usuario para que pueda probar de inmediato, y todos son editables/borrables.
 */

import { getCollection, saveCollection } from '../core/storage.js';
import { scopedKey } from '../core/userScope.js';
import { getExerciseByName } from './exerciseCatalog.js';

const KEY_BLOCKS = 'routine_blocks';
export const MINUTES_PER_EXERCISE = 10;

const DEFAULT_BLOCKS = [
  {
    id: 'b_push',
    title: 'Empuje (Push)',
    muscleGroups: 'Pecho, Hombro y Tríceps',
    exerciseNames: [
      'Press de Banca Plano',
      'Press Inclinado con Mancuernas',
      'Press Militar con Barra',
      'Elevaciones Laterales',
      'Extensiones de Tríceps en Polea',
    ],
    estimatedMinutes: 50,
  },
  {
    id: 'b_pull',
    title: 'Tirón (Pull)',
    muscleGroups: 'Espalda y Bíceps',
    exerciseNames: [
      'Dominadas (Pull-ups)',
      'Remo con Barra',
      'Jalón al Pecho (Lat Pulldown)',
      'Curl de Bíceps con Barra Z',
      'Curl Martillo con Mancuernas',
    ],
    estimatedMinutes: 45,
  },
  {
    id: 'b_legs',
    title: 'Pierna Completa (Legs)',
    muscleGroups: 'Cuádriceps, Femorales y Gemelos',
    exerciseNames: [
      'Sentadilla Trasera',
      'Prensa de Piernas 45°',
      'Extensiones de Cuádriceps',
      'Curl Femoral Tumbado',
      'Hip Thrust con Barra',
      'Elevación de Talones (Gemelos)',
    ],
    estimatedMinutes: 60,
  },
  {
    id: 'b_upper',
    title: 'Torso Completo',
    muscleGroups: 'Pectoral, Dorsales y Deltoides',
    exerciseNames: [
      'Press de Banca Plano',
      'Remo Gironda (Polea Baja)',
      'Press Militar con Mancuernas',
      'Aperturas en Polea (Cruces)',
      'Face Pulls',
    ],
    estimatedMinutes: 55,
  },
];

function ensureBlocksLoaded() {
  const key = scopedKey(KEY_BLOCKS);
  const stored = getCollection(key, null);
  if (!Array.isArray(stored)) {
    const initial = DEFAULT_BLOCKS.map((b) => ({
      ...b,
      exerciseCount: b.exerciseNames.length,
    }));
    saveCollection(key, initial);
    return initial;
  }
  return stored.map((b) => ({
    ...b,
    exerciseNames: Array.isArray(b.exerciseNames) ? b.exerciseNames : [],
    exerciseCount: Array.isArray(b.exerciseNames) ? b.exerciseNames.length : 0,
    estimatedMinutes:
      b.estimatedMinutes || estimateMinutes(Array.isArray(b.exerciseNames) ? b.exerciseNames.length : 0),
  }));
}

/**
 * Calcula los minutos estimados según la cantidad de ejercicios.
 * @param {number} exerciseCount
 * @returns {number}
 */
export function estimateMinutes(exerciseCount) {
  return Math.max(0, Number(exerciseCount) || 0) * MINUTES_PER_EXERCISE;
}

/**
 * Devuelve todos los bloques del usuario activo.
 */
export function getAllBlocks() {
  return ensureBlocksLoaded();
}

/**
 * Busca un bloque por su ID.
 * @param {string} id
 */
export function getBlockById(id) {
  return ensureBlocksLoaded().find((b) => b.id === id) || null;
}

/**
 * Determina los grupos musculares trabajados en un bloque, ordenados por frecuencia.
 * @param {{ exerciseNames?: string[] }} block
 * @returns {string[]}
 */
export function groupsOfBlock(block) {
  const counts = new Map();
  for (const name of block?.exerciseNames || []) {
    const ex = getExerciseByName(name);
    if (ex?.muscleGroup) {
      counts.set(ex.muscleGroup, (counts.get(ex.muscleGroup) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([group]) => group);
}

/**
 * Devuelve el grupo muscular principal de un bloque (para colorear la barra lateral).
 * @param {{ exerciseNames?: string[] }} block
 * @returns {string}
 */
export function primaryGroupOfBlock(block) {
  return groupsOfBlock(block)[0] || 'Pecho';
}

/**
 * Crea un nuevo bloque de entrenamiento con nombre libre.
 * @param {{ title: string, muscleGroups?: string, exerciseNames?: string[] }} payload
 * @returns {{ ok: boolean, block?: object, error?: string }}
 */
export function createBlock({ title, muscleGroups = '', exerciseNames = [] }) {
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) {
    return { ok: false, error: 'Escribe el nombre del bloque' };
  }

  const cleanExercises = Array.isArray(exerciseNames)
    ? exerciseNames.map((n) => String(n).trim()).filter(Boolean)
    : [];

  const derivedMuscles =
    String(muscleGroups || '').trim() ||
    groupsOfBlock({ exerciseNames: cleanExercises }).join(', ') ||
    'Personalizado';

  const newBlock = {
    id: `b_${Date.now()}`,
    title: cleanTitle,
    muscleGroups: derivedMuscles,
    exerciseNames: cleanExercises,
    exerciseCount: cleanExercises.length,
    estimatedMinutes: estimateMinutes(cleanExercises.length),
  };

  const list = ensureBlocksLoaded();
  list.push(newBlock);
  saveCollection(scopedKey(KEY_BLOCKS), list);

  return { ok: true, block: structuredClone(newBlock) };
}

/**
 * Actualiza un bloque existente (nombre, músculos o lista de ejercicios).
 * @param {string} id
 * @param {{ title?: string, muscleGroups?: string, exerciseNames?: string[] }} updates
 * @returns {{ ok: boolean, block?: object, error?: string }}
 */
export function updateBlock(id, updates) {
  const list = ensureBlocksLoaded();
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) {
    return { ok: false, error: 'Bloque no encontrado' };
  }

  const current = list[idx];
  const nextTitle =
    updates.title !== undefined ? String(updates.title).trim() : current.title;
  if (!nextTitle) {
    return { ok: false, error: 'Escribe el nombre del bloque' };
  }

  const nextExercises =
    updates.exerciseNames !== undefined
      ? updates.exerciseNames.map((n) => String(n).trim()).filter(Boolean)
      : current.exerciseNames;

  const nextMuscles =
    updates.muscleGroups !== undefined && String(updates.muscleGroups).trim()
      ? String(updates.muscleGroups).trim()
      : groupsOfBlock({ exerciseNames: nextExercises }).join(', ') || current.muscleGroups;

  const updated = {
    ...current,
    title: nextTitle,
    muscleGroups: nextMuscles,
    exerciseNames: nextExercises,
    exerciseCount: nextExercises.length,
    estimatedMinutes: estimateMinutes(nextExercises.length),
  };

  list[idx] = updated;
  saveCollection(scopedKey(KEY_BLOCKS), list);
  return { ok: true, block: structuredClone(updated) };
}

/**
 * Elimina un bloque por ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteBlock(id) {
  const list = ensureBlocksLoaded();
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length === list.length) return false;
  saveCollection(scopedKey(KEY_BLOCKS), filtered);
  return true;
}

export const BlockService = {
  MINUTES_PER_EXERCISE,
  estimateMinutes,
  getAllBlocks,
  getBlockById,
  groupsOfBlock,
  primaryGroupOfBlock,
  createBlock,
  updateBlock,
  deleteBlock,
};
