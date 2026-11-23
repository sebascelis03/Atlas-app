/**
 * Catálogo de Ejercicios Base (29 ejercicios en 6 grupos musculares) +
 * Creación de Ejercicios Propios personalizados por el usuario.
 */

import { getCollection, saveCollection } from '../core/storage.js';
import { scopedKey } from '../core/userScope.js';

const KEY_CUSTOM_EXERCISES = 'custom_exercises';

export const MUSCLE_GROUPS = [
  'Todos',
  'Pecho',
  'Espalda',
  'Pierna',
  'Hombro',
  'Brazos',
  'Core',
];

export const EQUIPMENT_TYPES = [
  'Barra',
  'Mancuerna',
  'Máquina',
  'Polea',
  'Peso Corporal',
  'Otro',
];

/** Color hexadecimal de acento por grupo muscular (extraído de MuscleStyle.kt). */
export const MUSCLE_COLORS = {
  Pecho: '#FF9100',
  Espalda: '#4FC3F7',
  Pierna: '#B388FF',
  Hombro: '#FF9100',
  Brazos: '#FF5252',
  Core: '#FFD740',
};

export const BASE_EXERCISES = [
  // Pecho (5)
  { id: '1', name: 'Press de Banca Plano', muscleGroup: 'Pecho', equipment: 'Barra', isCustom: false },
  { id: '2', name: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', equipment: 'Mancuerna', isCustom: false },
  { id: '3', name: 'Aperturas en Polea (Cruces)', muscleGroup: 'Pecho', equipment: 'Polea', isCustom: false },
  { id: '4', name: 'Fondos en Paralelas (Dips)', muscleGroup: 'Pecho', equipment: 'Peso Corporal', isCustom: false },
  { id: '5', name: 'Press en Máquina Pecho', muscleGroup: 'Pecho', equipment: 'Máquina', isCustom: false },

  // Espalda (5)
  { id: '6', name: 'Peso Muerto Convencional', muscleGroup: 'Espalda', equipment: 'Barra', isCustom: false },
  { id: '7', name: 'Jalón al Pecho (Lat Pulldown)', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: '8', name: 'Remo con Barra', muscleGroup: 'Espalda', equipment: 'Barra', isCustom: false },
  { id: '9', name: 'Remo Gironda (Polea Baja)', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: '10', name: 'Dominadas (Pull-ups)', muscleGroup: 'Espalda', equipment: 'Peso Corporal', isCustom: false },

  // Pierna (6)
  { id: '11', name: 'Sentadilla Trasera', muscleGroup: 'Pierna', equipment: 'Barra', isCustom: false },
  { id: '12', name: 'Prensa de Piernas 45°', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: '13', name: 'Extensiones de Cuádriceps', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: '14', name: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: '15', name: 'Elevación de Talones (Gemelos)', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: '16', name: 'Hip Thrust con Barra', muscleGroup: 'Pierna', equipment: 'Barra', isCustom: false },

  // Hombro (5)
  { id: '17', name: 'Press Militar con Barra', muscleGroup: 'Hombro', equipment: 'Barra', isCustom: false },
  { id: '18', name: 'Press Militar con Mancuernas', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: '19', name: 'Elevaciones Laterales', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: '20', name: 'Pájaros (Deltoides Posterior)', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: '21', name: 'Face Pulls', muscleGroup: 'Hombro', equipment: 'Polea', isCustom: false },

  // Brazos (5)
  { id: '22', name: 'Curl de Bíceps con Barra Z', muscleGroup: 'Brazos', equipment: 'Barra', isCustom: false },
  { id: '23', name: 'Curl en Banco Scott (Predicador)', muscleGroup: 'Brazos', equipment: 'Máquina', isCustom: false },
  { id: '24', name: 'Curl Martillo con Mancuernas', muscleGroup: 'Brazos', equipment: 'Mancuerna', isCustom: false },
  { id: '25', name: 'Extensiones de Tríceps en Polea', muscleGroup: 'Brazos', equipment: 'Polea', isCustom: false },
  { id: '26', name: 'Press Francés', muscleGroup: 'Brazos', equipment: 'Barra', isCustom: false },

  // Core (3)
  { id: '27', name: 'Plancha Abdominal', muscleGroup: 'Core', equipment: 'Peso Corporal', isCustom: false },
  { id: '28', name: 'Elevaciones de Piernas Colgado', muscleGroup: 'Core', equipment: 'Peso Corporal', isCustom: false },
  { id: '29', name: 'Crunch en Polea Alta', muscleGroup: 'Core', equipment: 'Polea', isCustom: false },
];

/**
 * Devuelve los ejercicios personalizados creados por el usuario activo.
 * @returns {Array<{ id: string, name: string, muscleGroup: string, equipment: string, isCustom: boolean }>}
 */
export function getCustomExercises() {
  return getCollection(scopedKey(KEY_CUSTOM_EXERCISES), []);
}

/**
 * Devuelve el catálogo completo (29 base + ejercicios propios del usuario).
 */
export function getAllExercises() {
  return [...BASE_EXERCISES, ...getCustomExercises()];
}

/**
 * Busca un ejercicio por nombre (sin distinguir mayúsculas). Si no existe en el catálogo,
 * devuelve un objeto genérico para soportar cualquier nombre personalizado.
 * @param {string} name
 */
export function getExerciseByName(name) {
  const clean = String(name || '').trim();
  const found = getAllExercises().find(
    (e) => e.name.toLowerCase() === clean.toLowerCase()
  );
  if (found) return structuredClone(found);
  return {
    id: `adhoc_${clean.toLowerCase().replace(/\s+/g, '_')}`,
    name: clean || 'Ejercicio Personalizado',
    muscleGroup: 'Pecho',
    equipment: 'Otro',
    isCustom: true,
  };
}

/**
 * Filtra ejercicios por texto de búsqueda y grupo muscular.
 * @param {{ query?: string, muscleGroup?: string }} [filters]
 */
export function searchExercises({ query = '', muscleGroup = 'Todos' } = {}) {
  const q = String(query || '').trim().toLowerCase();
  const group = muscleGroup || 'Todos';

  return getAllExercises().filter((ex) => {
    const matchesQuery =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroup.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q);
    const matchesGroup =
      group === 'Todos' || ex.muscleGroup.toLowerCase() === group.toLowerCase();
    return matchesQuery && matchesGroup;
  });
}

/**
 * Crea y persiste un "Ejercicio propio" con nombre personalizado para el usuario activo.
 * @param {{ name: string, muscleGroup?: string, equipment?: string }} payload
 * @returns {{ ok: boolean, exercise?: object, error?: string }}
 */
export function createCustomExercise({
  name,
  muscleGroup = 'Pecho',
  equipment = 'Otro',
}) {
  const cleanName = String(name || '').trim();
  if (!cleanName) {
    return { ok: false, error: 'Escribe el nombre del ejercicio' };
  }

  const all = getAllExercises();
  const existing = all.find((e) => e.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    return { ok: false, error: 'Ya existe un ejercicio con ese nombre', exercise: existing };
  }

  const validGroup = MUSCLE_GROUPS.filter((g) => g !== 'Todos').includes(muscleGroup)
    ? muscleGroup
    : 'Pecho';
  const validEquipment = EQUIPMENT_TYPES.includes(equipment) ? equipment : 'Otro';

  const newExercise = {
    id: `custom_${Date.now()}`,
    name: cleanName,
    muscleGroup: validGroup,
    equipment: validEquipment,
    isCustom: true,
  };

  const customList = getCustomExercises();
  customList.push(newExercise);
  saveCollection(scopedKey(KEY_CUSTOM_EXERCISES), customList);

  return { ok: true, exercise: structuredClone(newExercise) };
}

/**
 * Devuelve el color hexadecimal correspondiente a un grupo muscular.
 * @param {string} [group]
 * @returns {string}
 */
export function colorForMuscle(group) {
  return MUSCLE_COLORS[group] || '#FF9100';
}

export const ExerciseCatalog = {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  MUSCLE_COLORS,
  BASE_EXERCISES,
  getCustomExercises,
  getAllExercises,
  getExerciseByName,
  searchExercises,
  createCustomExercise,
  colorForMuscle,
};
