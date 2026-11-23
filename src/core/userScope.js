/**
 * Aislamiento de datos por cuenta activa (UserScope).
 * Garantiza que cada usuario registrado tenga sus propios bloques, ejercicios propios,
 * registros de agua, peso, preferencias e historial de sesiones.
 */

let currentUserIdResolver = () => 'guest';

/**
 * Registra la función que resuelve el ID del usuario con sesión activa.
 * @param {() => string} resolver
 */
export function setUserIdResolver(resolver) {
  currentUserIdResolver = resolver;
}

/**
 * Devuelve el ID del usuario activo o `'guest'` si no hay sesión iniciada.
 * @returns {string}
 */
export function getUserId() {
  return currentUserIdResolver() || 'guest';
}

/**
 * Construye una clave de colección aislada para el usuario actual.
 * @param {string} baseKey
 * @returns {string}
 */
export function scopedKey(baseKey) {
  return `${baseKey}_u_${getUserId()}`;
}
