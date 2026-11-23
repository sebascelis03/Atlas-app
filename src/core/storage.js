/**
 * Adaptador de Almacenamiento Local Híbrido (Resolución de H-01).
 *
 * - En Android (.apk): Detecta ejecución nativa mediante Capacitor. En la primera
 *   ejecución solicita crear/elegir la carpeta local donde se guardarán los archivos
 *   JSON de la aplicación (usando @capacitor/filesystem en Directory.Documents).
 * - En Navegador Web (entorno de pruebas): Desactiva automáticamente la ventana
 *   emergente de carpeta (salvo que se active el flag de simulación) y persiste
 *   directamente en localStorage para pruebas instantáneas.
 */

import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

const STORAGE_PREFIX = 'atlas_v3_';
const FOLDER_CONFIG_KEY = `${STORAGE_PREFIX}folder_config`;
const SIMULATE_ANDROID_KEY = `${STORAGE_PREFIX}simulate_android`;
const DEFAULT_FOLDER_NAME = 'ATLAS_Data';

/** Caché en memoria sincronizada para lecturas síncronas instantáneas en la UI. */
const memoryCache = new Map();
let initialized = false;

/**
 * Devuelve true si corre dentro del APK de Android o si el flag de simulación está activo.
 * @returns {boolean}
 */
export function isAndroidEnvironment() {
  const isNativeAndroid =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  if (isNativeAndroid) return true;
  try {
    return localStorage.getItem(SIMULATE_ANDROID_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Permite activar o desactivar la simulación del flujo de carpeta de Android en el navegador.
 * @param {boolean} enabled
 */
export function setSimulateAndroidInWeb(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(SIMULATE_ANDROID_KEY, 'true');
    } else {
      localStorage.removeItem(SIMULATE_ANDROID_KEY);
    }
  } catch {
    // Ignorar errores de acceso a storage
  }
}

/**
 * Obtiene la configuración actual de la carpeta local.
 * @returns {{ configured: boolean, folderName: string, directory: string, configuredAt: string | null }}
 */
export function getFolderConfig() {
  try {
    const raw = localStorage.getItem(FOLDER_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        configured: Boolean(parsed.configured),
        folderName: parsed.folderName || DEFAULT_FOLDER_NAME,
        directory: parsed.directory || 'Documents',
        configuredAt: parsed.configuredAt || null,
      };
    }
  } catch {
    // Fallback
  }
  return {
    configured: false,
    folderName: DEFAULT_FOLDER_NAME,
    directory: 'Documents',
    configuredAt: null,
  };
}

/**
 * Indica si se debe mostrar la ventana emergente de primera ejecución para elegir/crear carpeta.
 * - En Web: devuelve `false` automáticamente (desactivada en navegador).
 * - En Android: devuelve `true` si aún no se ha configurado la carpeta local.
 * @returns {boolean}
 */
export function needsFolderSetup() {
  if (!isAndroidEnvironment()) {
    return false;
  }
  return !getFolderConfig().configured;
}

/**
 * Configura y crea la carpeta local de datos en Android (y sincroniza las colecciones actuales).
 * @param {string} [folderName] Nombre de la carpeta dentro de Documentos (ej. "ATLAS_Data")
 * @returns {Promise<{ ok: boolean, path: string, error?: string }>}
 */
export async function configureLocalFolder(folderName = DEFAULT_FOLDER_NAME) {
  const cleanName =
    String(folderName || DEFAULT_FOLDER_NAME)
      .trim()
      .replace(/[<>:"/\\|?*]+/g, '_') || DEFAULT_FOLDER_NAME;

  const config = {
    configured: true,
    folderName: cleanName,
    directory: 'Documents',
    configuredAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(FOLDER_CONFIG_KEY, JSON.stringify(config));

    if (Capacitor.isNativePlatform()) {
      await Filesystem.mkdir({
        path: cleanName,
        directory: Directory.Documents,
        recursive: true,
      }).catch(() => {
        // Si la carpeta ya existe, continuamos sin error
      });

      // Volcar todas las colecciones existentes en la carpeta recién configurada
      for (const [key, value] of memoryCache.entries()) {
        await writeNativeFile(cleanName, key, value);
      }
    }

    return { ok: true, path: `Documents/${cleanName}` };
  } catch (err) {
    return {
      ok: false,
      path: `Documents/${cleanName}`,
      error: err?.message || 'No se pudo crear la carpeta local',
    };
  }
}

/**
 * Inicializa el motor de almacenamiento cargando las colecciones existentes en memoria.
 */
export async function initStorage() {
  if (initialized) return;

  // 1. Cargar todo lo que exista en localStorage con prefijo atlas_v2_
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (
        fullKey &&
        fullKey.startsWith(STORAGE_PREFIX) &&
        fullKey !== FOLDER_CONFIG_KEY &&
        fullKey !== SIMULATE_ANDROID_KEY
      ) {
        const shortKey = fullKey.slice(STORAGE_PREFIX.length);
        const raw = localStorage.getItem(fullKey);
        if (raw !== null) {
          memoryCache.set(shortKey, JSON.parse(raw));
        }
      }
    }
  } catch {
    // Continuar con caché limpia si falla el parseo
  }

  // 2. Si estamos en Android nativo y la carpeta ya fue configurada, sincronizar desde archivos JSON
  const cfg = getFolderConfig();
  if (Capacitor.isNativePlatform() && cfg.configured) {
    try {
      const dirResult = await Filesystem.readdir({
        path: cfg.folderName,
        directory: Directory.Documents,
      });
      for (const file of dirResult.files || []) {
        const fileName = typeof file === 'string' ? file : file.name;
        if (fileName && fileName.endsWith('.json')) {
          const shortKey = fileName.replace(/\.json$/, '');
          const content = await Filesystem.readFile({
            path: `${cfg.folderName}/${fileName}`,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          if (content?.data) {
            const parsed = JSON.parse(String(content.data));
            memoryCache.set(shortKey, parsed);
            localStorage.setItem(`${STORAGE_PREFIX}${shortKey}`, JSON.stringify(parsed));
          }
        }
      }
    } catch {
      // Si la carpeta aún no tiene archivos, usamos lo sembrado en localStorage
    }
  }

  initialized = true;
}

/**
 * Lee una colección o valor del almacenamiento local (síncrono desde caché/localStorage).
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function getCollection(key, defaultValue) {
  if (memoryCache.has(key)) {
    return structuredClone(memoryCache.get(key));
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      memoryCache.set(key, parsed);
      return structuredClone(parsed);
    }
  } catch {
    // Devolver valor por defecto
  }
  return structuredClone(defaultValue);
}

/**
 * Guarda una colección o valor tanto en memoria/localStorage como en la carpeta JSON de Android.
 * @param {string} key
 * @param {unknown} data
 */
export function saveCollection(key, data) {
  const clone = structuredClone(data);
  memoryCache.set(key, clone);

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(clone));
  } catch {
    // Ignorar cuota excedida en entornos restringidos
  }

  const cfg = getFolderConfig();
  if (Capacitor.isNativePlatform() && cfg.configured) {
    writeNativeFile(cfg.folderName, key, clone).catch(() => {});
  }
}

async function writeNativeFile(folderName, key, data) {
  const safeFile = `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  await Filesystem.writeFile({
    path: `${folderName}/${safeFile}`,
    directory: Directory.Documents,
    data: JSON.stringify(data, null, 2),
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

/**
 * Exporta todas las colecciones actuales de ATLAS en un único JSON de respaldo.
 * @returns {string}
 */
export function exportBackupJson() {
  const snapshot = {
    app: 'ATLAS',
    version: 2,
    exportedAt: new Date().toISOString(),
    folderConfig: getFolderConfig(),
    collections: {},
  };

  for (const [key, value] of memoryCache.entries()) {
    snapshot.collections[key] = value;
  }
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Restaura un respaldo JSON exportado previamente.
 * @param {string} rawJson
 * @returns {{ ok: boolean, count: number, error?: string }}
 */
export function importBackupJson(rawJson) {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed.collections !== 'object') {
      return { ok: false, count: 0, error: 'El archivo no es un respaldo válido de ATLAS' };
    }
    let count = 0;
    for (const [key, value] of Object.entries(parsed.collections)) {
      saveCollection(key, value);
      count++;
    }
    return { ok: true, count };
  } catch (err) {
    return { ok: false, count: 0, error: err?.message || 'JSON inválido' };
  }
}

export const StorageEngine = {
  initStorage,
  isAndroidEnvironment,
  setSimulateAndroidInWeb,
  getFolderConfig,
  needsFolderSetup,
  configureLocalFolder,
  getCollection,
  saveCollection,
  exportBackupJson,
  importBackupJson,
};
