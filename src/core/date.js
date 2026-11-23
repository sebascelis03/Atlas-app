/**
 * Utilidades de Fecha para ATLAS (Hora Local).
 * Todas las claves de día usan formato `yyyy-MM-dd` en zona horaria local.
 */

const LOCALE_ES = 'es-CO';

/** Iniciales de la semana ATLAS (Lunes a Domingo). */
export const WEEK_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Convierte un objeto Date a clave `yyyy-MM-dd` en hora local.
 * @param {Date} [date]
 * @returns {string}
 */
export function key(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Clave `yyyy-MM-dd` del día de hoy. */
export function today() {
  return key(new Date());
}

/**
 * Devuelve un Date correspondiente a `n` días atrás respecto a hoy (0 = hoy).
 * @param {number} n
 * @returns {Date}
 */
export function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Parsea una clave `yyyy-MM-dd` a un objeto Date en hora local (mediodía para evitar saltos DST).
 * @param {string} dateKey
 * @returns {Date | null}
 */
export function parse(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return null;
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
}

/**
 * Devuelve el lunes de la semana a la que pertenece `date` (Lunes = 0 ... Domingo = 6).
 * @param {Date} [date]
 * @returns {Date}
 */
export function startOfWeek(date = new Date()) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  const day = copy.getDay(); // 0 = Domingo, 1 = Lunes ... 6 = Sábado
  const offset = (day + 6) % 7; // Lunes = 0 ... Domingo = 6
  copy.setDate(copy.getDate() - offset);
  return copy;
}

/**
 * Índice del día de la semana (0 = Lunes ... 6 = Domingo).
 * @param {Date} [date]
 * @returns {number}
 */
export function weekDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

/**
 * Formato corto en español: "22 nov"
 * @param {string} dateKey
 * @returns {string}
 */
export function short(dateKey) {
  const date = parse(dateKey);
  if (!date) return dateKey;
  return new Intl.DateTimeFormat(LOCALE_ES, {
    day: 'numeric',
    month: 'short',
  })
    .format(date)
    .replace('.', '');
}

/**
 * Formato largo del día actual capitalizado: "Domingo, 22 de noviembre"
 * @param {Date} [date]
 * @returns {string}
 */
export function longToday(date = new Date()) {
  const text = new Intl.DateTimeFormat(LOCALE_ES, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Formatea segundos en "45m 12s" o "1h 05m".
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/**
 * Formatea minutos en "45 min" o "1 h 15 min".
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatMinutes(totalMinutes) {
  const mins = Math.max(0, Math.floor(totalMinutes || 0));
  if (mins >= 60) {
    return `${Math.floor(mins / 60)} h ${mins % 60} min`;
  }
  return `${mins} min`;
}

export const DateHelper = {
  WEEK_LETTERS,
  key,
  today,
  daysAgo,
  parse,
  startOfWeek,
  weekDayIndex,
  short,
  longToday,
  formatDuration,
  formatMinutes,
};
