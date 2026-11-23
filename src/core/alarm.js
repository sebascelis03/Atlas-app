/**
 * Motor de Alarma Sutil y Vibración para el Temporizador de Descanso (Resolución de H-03).
 *
 * - Genera un acorde armónico suave de dos notas (528 Hz -> 660 Hz) usando Web Audio API,
 *   100 % local y sin depender de archivos de audio externos.
 * - Activa la vibración táctil (`navigator.vibrate`) si el dispositivo lo soporta.
 * - Respeta los interruptores `soundEnabled` y `vibrationEnabled` de `PreferencesService`.
 */

import { PreferencesService } from '../services/index.js';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Desbloquea el contexto de audio tras una interacción del usuario (toque en serie completada).
 */
export function unlockAudioContext() {
  try {
    getAudioContext();
  } catch {
    // Ignorar en entornos sin Web Audio
  }
}

/**
 * Reproduce la alarma sutil y/o vibración al finalizar el tiempo de descanso.
 */
export function playSubtleRestAlarm() {
  const prefs = PreferencesService.getPreferences();

  // 1. Vibración táctil
  if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([160, 80, 220]);
    } catch {
      // Ignorar si el navegador bloquea vibrate
    }
  }

  // 2. Alarma sonora sutil (Web Audio API)
  if (!prefs.soundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 528, start: 0, duration: 0.18 },
      { freq: 660, start: 0.2, duration: 0.28 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0.001, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.18, now + note.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration + 0.02);
    }
  } catch {
    // Ignorar si el dispositivo no permite síntesis de audio
  }
}
