/**
 * Servicio de Autenticación Local (Portada: Login y Registro Ampliado).
 *
 * Campos de Usuario según definición funcional definitiva:
 * - id: string
 * - name: string (Obligatorio)
 * - lastName: string (Opcional)
 * - email: string (Obligatorio, único)
 * - password: string (Obligatorio, mín. 6 caracteres)
 * - city: string (Opcional por privacidad)
 * - country: string (Opcional por privacidad)
 * - gender: 'Hombre' | 'Mujer' | 'Prefiero no decirlo'
 * - birthYear: number
 * - acceptedTerms: boolean
 * - createdAt: string (ISO)
 */

import { getCollection, saveCollection } from '../core/storage.js';
import { setUserIdResolver } from '../core/userScope.js';

const KEY_USERS = 'auth_users';
const KEY_SESSION = 'auth_session_user_id';

export const GENDER_OPTIONS = ['Hombre', 'Mujer', 'Prefiero no decirlo'];

const DEMO_USERS = [
  {
    id: '1',
    name: 'Administrador',
    lastName: 'ATLAS',
    email: 'admin@atlas.com',
    password: '123456',
    city: 'Bogotá',
    country: 'Colombia',
    gender: 'Hombre',
    birthYear: 1999,
    acceptedTerms: true,
    createdAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: '2',
    name: 'Usuario',
    lastName: 'Demo',
    email: 'usuario@atlas.com',
    password: 'atlas2026',
    city: 'Medellín',
    country: 'Colombia',
    gender: 'Prefiero no decirlo',
    birthYear: 2002,
    acceptedTerms: true,
    createdAt: '2026-10-01T12:00:00.000Z',
  },
];

let users = [];
let currentUserId = null;

/**
 * Inicializa el servicio de autenticación, sembrando los usuarios demo si no hay datos previos.
 */
export function initAuth() {
  const storedUsers = getCollection(KEY_USERS, null);
  if (!Array.isArray(storedUsers) || storedUsers.length === 0) {
    users = structuredClone(DEMO_USERS);
    saveCollection(KEY_USERS, users);
  } else {
    users = storedUsers;
  }

  const storedSession = getCollection(KEY_SESSION, null);
  if (storedSession && users.some((u) => u.id === storedSession)) {
    currentUserId = storedSession;
  } else {
    currentUserId = null;
  }

  setUserIdResolver(() => currentUserId || 'guest');
}

/**
 * Devuelve el usuario con sesión activa o null si nadie ha iniciado sesión.
 * @returns {object | null}
 */
export function getCurrentUser() {
  if (!currentUserId) return null;
  const found = users.find((u) => u.id === currentUserId);
  return found ? structuredClone(found) : null;
}

/**
 * Nombre completo formateado ("Nombre Apellido" o solo "Nombre").
 * @param {object | null} [user]
 * @returns {string}
 */
export function getFullName(user = getCurrentUser()) {
  if (!user) return 'Atleta';
  return [user.name, user.lastName].filter(Boolean).join(' ').trim() || 'Atleta';
}

/**
 * Valida credenciales e inicia sesión.
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, user?: object, error?: string }}
 */
export function login(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanEmail) {
    return { ok: false, error: 'Ingresa tu correo electrónico' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'El formato del correo no es válido' };
  }
  if (!cleanPassword) {
    return { ok: false, error: 'Ingresa tu contraseña' };
  }

  const found = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
  );

  if (!found) {
    return { ok: false, error: 'Correo o contraseña incorrectos' };
  }

  currentUserId = found.id;
  saveCollection(KEY_SESSION, currentUserId);
  return { ok: true, user: structuredClone(found) };
}

/**
 * Registra un nuevo usuario validando todos los campos de la portada ampliada.
 * @param {{
 *   name: string,
 *   lastName?: string,
 *   email: string,
 *   password: string,
 *   city?: string,
 *   country?: string,
 *   gender: string,
 *   birthYear: number | string,
 *   acceptedTerms: boolean
 * }} payload
 * @returns {{ ok: boolean, user?: object, fieldErrors?: Record<string, string>, error?: string }}
 */
export function register(payload) {
  const fieldErrors = {};

  const name = String(payload?.name || '').trim();
  const lastName = String(payload?.lastName || '').trim();
  const email = String(payload?.email || '').trim();
  const password = String(payload?.password || '');
  const city = String(payload?.city || '').trim();
  const country = String(payload?.country || '').trim();
  const gender = GENDER_OPTIONS.includes(payload?.gender)
    ? payload.gender
    : 'Prefiero no decirlo';
  const birthYear = Number(payload?.birthYear);
  const currentYear = new Date().getFullYear();
  const acceptedTerms = Boolean(payload?.acceptedTerms);

  if (!name) {
    fieldErrors.name = 'Ingresa tu nombre';
  }
  if (!email) {
    fieldErrors.email = 'Ingresa tu correo electrónico';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'El formato del correo no es válido';
  } else if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    fieldErrors.email = 'Ese correo ya está registrado';
  }

  if (!password) {
    fieldErrors.password = 'Crea una contraseña';
  } else if (password.length < 6) {
    fieldErrors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!Number.isInteger(birthYear) || birthYear < 1920 || birthYear > currentYear - 10) {
    fieldErrors.birthYear = `Ingresa un año válido (1920 - ${currentYear - 10})`;
  }

  if (!acceptedTerms) {
    fieldErrors.acceptedTerms = 'Debes aceptar los Términos y Condiciones';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors,
      error: Object.values(fieldErrors)[0],
    };
  }

  const newUser = {
    id: `u_${Date.now()}`,
    name,
    lastName,
    email,
    password,
    city,
    country,
    gender,
    birthYear,
    acceptedTerms: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  currentUserId = newUser.id;
  saveCollection(KEY_USERS, users);
  saveCollection(KEY_SESSION, currentUserId);

  return { ok: true, user: structuredClone(newUser) };
}

/**
 * Actualiza los datos personales de la cuenta activa (desde Configuración de cuenta).
 * @param {Partial<{ name: string, lastName: string, city: string, country: string, gender: string, birthYear: number }>} updates
 * @returns {{ ok: boolean, user?: object, error?: string }}
 */
export function updateAccount(updates) {
  if (!currentUserId) {
    return { ok: false, error: 'No hay sesión activa' };
  }
  const index = users.findIndex((u) => u.id === currentUserId);
  if (index < 0) {
    return { ok: false, error: 'Usuario no encontrado' };
  }

  const current = users[index];
  const nextName = updates.name !== undefined ? String(updates.name).trim() : current.name;
  if (!nextName) {
    return { ok: false, error: 'El nombre es obligatorio' };
  }

  const updated = {
    ...current,
    name: nextName,
    lastName:
      updates.lastName !== undefined ? String(updates.lastName).trim() : current.lastName,
    city: updates.city !== undefined ? String(updates.city).trim() : current.city,
    country:
      updates.country !== undefined ? String(updates.country).trim() : current.country,
    gender:
      updates.gender && GENDER_OPTIONS.includes(updates.gender)
        ? updates.gender
        : current.gender,
    birthYear:
      updates.birthYear !== undefined && !Number.isNaN(Number(updates.birthYear))
        ? Number(updates.birthYear)
        : current.birthYear,
  };

  users[index] = updated;
  saveCollection(KEY_USERS, users);
  return { ok: true, user: structuredClone(updated) };
}

/**
 * Cierra la sesión actual conservando los usuarios registrados.
 */
export function logout() {
  currentUserId = null;
  saveCollection(KEY_SESSION, null);
}

/**
 * Lista de usuarios registrados (sin exponer contraseñas).
 */
export function getAllUsers() {
  return users.map(({ password, ...safeUser }) => structuredClone(safeUser));
}

export const AuthService = {
  GENDER_OPTIONS,
  initAuth,
  getCurrentUser,
  getFullName,
  login,
  register,
  updateAccount,
  logout,
  getAllUsers,
};
