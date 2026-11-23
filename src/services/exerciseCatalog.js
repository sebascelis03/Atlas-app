/**
 * Catálogo Base de Ejercicios Fundamentales Reales (50 ejercicios en 6 grupos musculares) +
 * Creación de Ejercicios Propios personalizados por el usuario.
 *
 * Incluye variantes específicas de press de banca, press con mancuernas, press militar,
 * jalón dorsal (agarre ancho, unilateral, estándar, cerrado), remos, sentadillas, peso muerto,
 * curls y extensiones, con acentos 100 % en gama anaranjada.
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

/** Gama monocromática anaranjada por grupo muscular. */
export const MUSCLE_COLORS = {
  Pecho: '#FF9100',
  Espalda: '#FFA726',
  Pierna: '#FB8C00',
  Hombro: '#FF9100',
  Brazos: '#F57C00',
  Core: '#FFB74D',
};

export const BASE_EXERCISES = [
  // 1. PECHO (9)
  { id: 'ex_1', name: 'Press de banca en banco plano', muscleGroup: 'Pecho', equipment: 'Barra', isCustom: false },
  { id: 'ex_2', name: 'Press plano con mancuernas', muscleGroup: 'Pecho', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_3', name: 'Press inclinado en banco con barra', muscleGroup: 'Pecho', equipment: 'Barra', isCustom: false },
  { id: 'ex_4', name: 'Press inclinado con mancuernas', muscleGroup: 'Pecho', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_5', name: 'Press declinado en banco', muscleGroup: 'Pecho', equipment: 'Barra', isCustom: false },
  { id: 'ex_6', name: 'Press de pecho en máquina', muscleGroup: 'Pecho', equipment: 'Máquina', isCustom: false },
  { id: 'ex_7', name: 'Aperturas con mancuernas en banco plano', muscleGroup: 'Pecho', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_8', name: 'Aperturas en polea (Cruces)', muscleGroup: 'Pecho', equipment: 'Polea', isCustom: false },
  { id: 'ex_9', name: 'Contractor de pecho (Pec Deck)', muscleGroup: 'Pecho', equipment: 'Máquina', isCustom: false },
  { id: 'ex_10', name: 'Fondos en paralelas (Dips)', muscleGroup: 'Pecho', equipment: 'Peso Corporal', isCustom: false },

  // 2. ESPALDA (11)
  { id: 'ex_11', name: 'Jalón dorsal', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: 'ex_12', name: 'Jalón dorsal con agarre ancho', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: 'ex_13', name: 'Jalón dorsal unilateral', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: 'ex_14', name: 'Jalón dorsal con agarre neutro / cerrado', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: 'ex_15', name: 'Remo con barra', muscleGroup: 'Espalda', equipment: 'Barra', isCustom: false },
  { id: 'ex_16', name: 'Remo unilateral con mancuerna', muscleGroup: 'Espalda', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_17', name: 'Remo en polea baja (Gironda)', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: 'ex_18', name: 'Remo en máquina', muscleGroup: 'Espalda', equipment: 'Máquina', isCustom: false },
  { id: 'ex_19', name: 'Pull-over en polea alta', muscleGroup: 'Espalda', equipment: 'Polea', isCustom: false },
  { id: 'ex_20', name: 'Dominadas (Pull-ups)', muscleGroup: 'Espalda', equipment: 'Peso Corporal', isCustom: false },
  { id: 'ex_21', name: 'Peso muerto convencional', muscleGroup: 'Espalda', equipment: 'Barra', isCustom: false },

  // 3. HOMBRO (9)
  { id: 'ex_22', name: 'Press militar con mancuernas', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_23', name: 'Press militar en máquina', muscleGroup: 'Hombro', equipment: 'Máquina', isCustom: false },
  { id: 'ex_24', name: 'Press militar con barra', muscleGroup: 'Hombro', equipment: 'Barra', isCustom: false },
  { id: 'ex_25', name: 'Press Arnold con mancuernas', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_26', name: 'Elevaciones laterales con mancuernas', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_27', name: 'Elevaciones laterales en polea', muscleGroup: 'Hombro', equipment: 'Polea', isCustom: false },
  { id: 'ex_28', name: 'Elevaciones frontales con mancuernas', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_29', name: 'Pájaros (Deltoides posterior)', muscleGroup: 'Hombro', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_30', name: 'Face Pull en polea', muscleGroup: 'Hombro', equipment: 'Polea', isCustom: false },

  // 4. PIERNA (11)
  { id: 'ex_31', name: 'Sentadilla libre con barra', muscleGroup: 'Pierna', equipment: 'Barra', isCustom: false },
  { id: 'ex_32', name: 'Sentadilla en multipower (Smith)', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: 'ex_33', name: 'Sentadilla búlgara con mancuernas', muscleGroup: 'Pierna', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_34', name: 'Sentadilla Hack en máquina', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: 'ex_35', name: 'Prensa de piernas 45°', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: 'ex_36', name: 'Extensiones de cuádriceps en máquina', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: 'ex_37', name: 'Peso muerto rumano', muscleGroup: 'Pierna', equipment: 'Barra', isCustom: false },
  { id: 'ex_38', name: 'Curl femoral tumbado en máquina', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: 'ex_39', name: 'Curl femoral sentado en máquina', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },
  { id: 'ex_40', name: 'Hip Thrust con barra', muscleGroup: 'Pierna', equipment: 'Barra', isCustom: false },
  { id: 'ex_41', name: 'Elevación de talones (Gemelos)', muscleGroup: 'Pierna', equipment: 'Máquina', isCustom: false },

  // 5. BRAZOS (6)
  { id: 'ex_42', name: 'Curl de bíceps con barra Z', muscleGroup: 'Brazos', equipment: 'Barra', isCustom: false },
  { id: 'ex_43', name: 'Curl de bíceps con mancuernas', muscleGroup: 'Brazos', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_44', name: 'Curl martillo con mancuernas', muscleGroup: 'Brazos', equipment: 'Mancuerna', isCustom: false },
  { id: 'ex_45', name: 'Curl de bíceps en banco Scott (Predicador)', muscleGroup: 'Brazos', equipment: 'Máquina', isCustom: false },
  { id: 'ex_46', name: 'Extensiones de tríceps en polea', muscleGroup: 'Brazos', equipment: 'Polea', isCustom: false },
  { id: 'ex_47', name: 'Press francés de tríceps', muscleGroup: 'Brazos', equipment: 'Barra', isCustom: false },

  // 6. CORE (4)
  { id: 'ex_48', name: 'Plancha abdominal', muscleGroup: 'Core', equipment: 'Peso Corporal', isCustom: false },
  { id: 'ex_49', name: 'Crunch abdominal en polea alta', muscleGroup: 'Core', equipment: 'Polea', isCustom: false },
  { id: 'ex_50', name: 'Elevaciones de piernas colgado', muscleGroup: 'Core', equipment: 'Peso Corporal', isCustom: false },
];

/**
 * Devuelve los ejercicios personalizados creados por el usuario activo.
 * @returns {Array<{ id: string, name: string, muscleGroup: string, equipment: string, isCustom: boolean }>}
 */
export function getCustomExercises() {
  return getCollection(scopedKey(KEY_CUSTOM_EXERCISES), []);
}

/**
 * Devuelve el catálogo completo (50 ejercicios base + ejercicios propios del usuario).
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
 * Devuelve el color hexadecimal correspondiente a un grupo muscular (gama naranja).
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
