/**
 * Menú Superior de Perfil (Esquina superior derecha del Header):
 * 1. Configuración de cuenta: Datos personales del usuario (con <select> de 40 opciones de Género),
 *    Carpeta local y Respaldo JSON.
 * 2. Preferencias: Tema Oscuro/Claro, Tiempo de descanso por defecto, Sonido/Vibración y Metas.
 * 3. Cerrar sesión: Diálogo de confirmación al 88% de ancho.
 */

import {
  AuthService,
  PreferencesService,
  StorageEngine,
  WorkoutService,
} from '../services/index.js';
import { icon } from '../ui/icons.js';
import { showBottomSheet, showDialog, showToast } from '../ui/modals.js';
import { openFolderSetupModal } from './FolderSetupModal.js';

let activeDropdownBackdrop = null;

export function closeProfileDropdown() {
  if (activeDropdownBackdrop) {
    activeDropdownBackdrop.remove();
    activeDropdownBackdrop = null;
  }
}

/**
 * Abre o cierra el menú desplegable bajo el botón de perfil en el Header.
 * @param {{ onStateChanged: () => void, onLoggedOut: () => void }} callbacks
 */
export function toggleProfileDropdown({ onStateChanged, onLoggedOut }) {
  if (activeDropdownBackdrop) {
    closeProfileDropdown();
    return;
  }

  const user = AuthService.getCurrentUser();
  if (!user) return;

  const fullName = AuthService.getFullName(user);
  const initial = fullName.charAt(0).toUpperCase();
  const prefs = PreferencesService.getPreferences();

  const backdrop = document.createElement('div');
  backdrop.className = 'profile-dropdown-backdrop';

  const menu = document.createElement('div');
  menu.className = 'profile-dropdown';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <div class="profile-dropdown__header">
      <div class="avatar" style="width:42px;height:42px;font-size:17px;">${initial}</div>
      <div style="overflow:hidden;">
        <div class="text-card-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${fullName}
        </div>
        <div class="text-caption" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${user.email}
        </div>
      </div>
    </div>

    <button type="button" id="menuBtnAccount" class="profile-dropdown__item" role="menuitem">
      <span style="display:flex;align-items:center;gap:10px;">
        <span style="color:var(--accent-orange);display:flex;">${icon('ic_person', { size: 20 })}</span>
        <span>Configuración de cuenta</span>
      </span>
      <span style="color:var(--text-muted);display:flex;">${icon('ic_chevron_right', { size: 16 })}</span>
    </button>

    <button type="button" id="menuBtnPreferences" class="profile-dropdown__item" role="menuitem">
      <span style="display:flex;align-items:center;gap:10px;">
        <span style="color:var(--accent-orange);display:flex;">${icon('ic_timer', { size: 20 })}</span>
        <span>Preferencias</span>
      </span>
      <span class="text-caption">${prefs.theme === 'light' ? 'Claro' : 'Oscuro'} · ${prefs.defaultRestSeconds}s</span>
    </button>

    <button type="button" id="menuBtnLogout" class="profile-dropdown__item profile-dropdown__item--danger" role="menuitem">
      <span style="display:flex;align-items:center;gap:10px;">
        <span style="display:flex;">${icon('ic_close', { size: 20 })}</span>
        <span>Cerrar sesión</span>
      </span>
    </button>
  `;

  backdrop.appendChild(menu);
  document.body.appendChild(backdrop);
  activeDropdownBackdrop = backdrop;

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeProfileDropdown();
    }
  });

  menu.querySelector('#menuBtnAccount')?.addEventListener('click', () => {
    closeProfileDropdown();
    openAccountSettingsSheet({ onStateChanged });
  });

  menu.querySelector('#menuBtnPreferences')?.addEventListener('click', () => {
    closeProfileDropdown();
    openPreferencesSheet({ onStateChanged });
  });

  menu.querySelector('#menuBtnLogout')?.addEventListener('click', () => {
    closeProfileDropdown();
    openLogoutConfirmDialog({ onLoggedOut });
  });
}

/**
 * 1. BottomSheet: Configuración de cuenta (Datos del usuario + Carpeta local + Respaldo JSON).
 * @param {{ onStateChanged: () => void }} callbacks
 */
export function openAccountSettingsSheet({ onStateChanged }) {
  const user = AuthService.getCurrentUser();
  if (!user) return;

  const folderCfg = StorageEngine.getFolderConfig();
  const totalWorkouts = WorkoutService.getTotalWorkouts();
  const currentGender = user.gender || AuthService.GENDER_OPTIONS[0];

  const genderOptionsHtml = AuthService.GENDER_OPTIONS.map(
    (g) =>
      `<option value="${g}" ${g === currentGender ? 'selected' : ''}>${g}</option>`
  ).join('');

  showBottomSheet({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <h3 class="text-screen" style="font-size:22px;">Configuración de cuenta</h3>
          <p class="text-body" style="font-size:13px;margin-top:2px;">
            ${user.email} · ${totalWorkouts} entrenamiento(s) registrados
          </p>
        </div>

        <!-- Datos del Usuario -->
        <div class="grid-2col">
          <div class="field" id="accFieldName">
            <label class="field__label" for="accEtName">Nombre *</label>
            <div class="field__box">
              <input id="accEtName" class="field__input" type="text" value="${user.name || ''}" />
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="accEtLastName">Apellido</label>
            <div class="field__box">
              <input id="accEtLastName" class="field__input" type="text" value="${user.lastName || ''}" placeholder="Opcional" />
            </div>
          </div>
        </div>

        <div class="grid-2col">
          <div class="field">
            <label class="field__label" for="accEtCity">Ciudad</label>
            <div class="field__box">
              <input id="accEtCity" class="field__input" type="text" value="${user.city || ''}" placeholder="Opcional" />
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="accEtCountry">País</label>
            <div class="field__box">
              <input id="accEtCountry" class="field__input" type="text" value="${user.country || ''}" placeholder="Opcional" />
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field__label" for="accSelGender">Género</label>
          <div class="field__box">
            <select id="accSelGender" class="field__select">
              ${genderOptionsHtml}
            </select>
          </div>
        </div>

        <div class="field">
          <label class="field__label" for="accEtBirthYear">Año de nacimiento</label>
          <div class="field__box">
            <input
              id="accEtBirthYear"
              class="field__input"
              type="number"
              min="1920"
              max="2016"
              value="${user.birthYear || ''}"
              placeholder="Ej. 2000"
            />
          </div>
        </div>

        <!-- Carpeta Local y Respaldo -->
        <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div>
              <div class="text-card-title">Almacenamiento y Respaldo Local</div>
              <div class="text-caption">Carpeta: <code>Documents/${folderCfg.folderName}</code></div>
            </div>
            <button type="button" id="accBtnChangeFolder" class="btn btn-tonal" style="min-height:36px;padding:0 12px;font-size:12px;">
              Cambiar carpeta
            </button>
          </div>

          <div style="display:flex;gap:8px;">
            <button type="button" id="accBtnExportJson" class="btn btn-outlined" style="flex:1;min-height:42px;font-size:13px;">
              Exportar respaldo (.json)
            </button>
            <label class="btn btn-outlined" style="flex:1;min-height:42px;font-size:13px;cursor:pointer;">
              Importar (.json)
              <input id="accFileImportJson" type="file" accept=".json,application/json" style="display:none;" />
            </label>
          </div>
        </div>

        <!-- Botones Guardar / Cancelar -->
        <div style="display:flex;gap:10px;margin-top:4px;">
          <button type="button" id="accBtnCancel" class="btn btn-outlined" style="flex:1;">
            Cancelar
          </button>
          <button type="button" id="accBtnSave" class="btn btn-primary" style="flex:1.3;">
            Guardar cambios
          </button>
        </div>
      </div>
    `,
    onMount: (sheet, close) => {
      sheet.querySelector('#accBtnChangeFolder')?.addEventListener('click', () => {
        close();
        openFolderSetupModal({
          dismissible: true,
          onConfigured: () => {
            if (typeof onStateChanged === 'function') onStateChanged();
          },
        });
      });

      sheet.querySelector('#accBtnExportJson')?.addEventListener('click', () => {
        const jsonStr = StorageEngine.exportBackupJson();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `atlas_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Respaldo JSON descargado', { type: 'success' });
      });

      sheet.querySelector('#accFileImportJson')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const res = StorageEngine.importBackupJson(String(reader.result || ''));
          if (!res.ok) {
            showToast(res.error || 'Archivo inválido', { type: 'error' });
            return;
          }
          close();
          showToast('Respaldo restaurado correctamente', { type: 'success' });
          if (typeof onStateChanged === 'function') onStateChanged();
        };
        reader.readAsText(file);
      });

      sheet.querySelector('#accBtnCancel')?.addEventListener('click', close);

      sheet.querySelector('#accBtnSave')?.addEventListener('click', () => {
        const name = sheet.querySelector('#accEtName')?.value?.trim() || '';
        const lastName = sheet.querySelector('#accEtLastName')?.value?.trim() || '';
        const city = sheet.querySelector('#accEtCity')?.value?.trim() || '';
        const country = sheet.querySelector('#accEtCountry')?.value?.trim() || '';
        const gender =
          sheet.querySelector('#accSelGender')?.value ||
          AuthService.GENDER_OPTIONS[0];
        const birthYear = Number(sheet.querySelector('#accEtBirthYear')?.value);

        const res = AuthService.updateAccount({
          name,
          lastName,
          city,
          country,
          gender,
          birthYear,
        });

        if (!res.ok) {
          sheet.querySelector('#accFieldName')?.classList.add('field--error');
          showToast(res.error || 'Revisa tu nombre', { type: 'error' });
          return;
        }

        close();
        showToast('Datos de la cuenta actualizados', { type: 'success' });
        if (typeof onStateChanged === 'function') onStateChanged();
      });
    },
  });
}

/**
 * 2. BottomSheet: Preferencias (Tema Oscuro/Claro, Tiempo de descanso, Sonido/Vibración y Metas).
 * @param {{ onStateChanged: () => void }} callbacks
 */
export function openPreferencesSheet({ onStateChanged }) {
  const prefs = PreferencesService.getPreferences();
  let selectedTheme = prefs.theme || 'dark';
  let selectedRest = prefs.defaultRestSeconds;
  let selectedWeeklyGoal = prefs.weeklyGoal;
  const targetWeightValue =
    prefs.targetWeightKg > 0 ? String(prefs.targetWeightKg) : '';

  const restPresets = [30, 60, 90, 120, 180];
  const restChipsHtml = restPresets
    .map(
      (sec) => `
      <button
        type="button"
        class="chip pref-rest-chip ${sec === selectedRest ? 'chip--active' : ''}"
        data-sec="${sec}"
      >
        ${sec}s
      </button>
    `
    )
    .join('');

  const weeklyChipsHtml = [1, 2, 3, 4, 5, 6, 7]
    .map(
      (days) => `
      <button
        type="button"
        class="chip pref-weekly-chip ${days === selectedWeeklyGoal ? 'chip--active' : ''}"
        data-days="${days}"
      >
        ${days}
      </button>
    `
    )
    .join('');

  showBottomSheet({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <h3 class="text-screen" style="font-size:22px;">Preferencias</h3>
          <p class="text-body" style="font-size:13px;margin-top:2px;">
            Personaliza la apariencia, el temporizador de descanso y tus metas
          </p>
        </div>

        <!-- Tema Oscuro (predeterminado) / Claro -->
        <div class="field">
          <label class="field__label">Apariencia (Tema)</label>
          <div class="chip-row">
            <button
              type="button"
              class="chip pref-theme-chip ${selectedTheme === 'dark' ? 'chip--active' : ''}"
              data-theme-val="dark"
              style="flex:1;justify-content:center;"
            >
              🌙 Tema Oscuro
            </button>
            <button
              type="button"
              class="chip pref-theme-chip ${selectedTheme === 'light' ? 'chip--active' : ''}"
              data-theme-val="light"
              style="flex:1;justify-content:center;"
            >
              ☀️ Tema Claro
            </button>
          </div>
        </div>

        <!-- Tiempo de Descanso por Defecto -->
        <div class="field">
          <label class="field__label">Tiempo de descanso por defecto (segundos)</label>
          <div class="chip-row">${restChipsHtml}</div>
          <div class="field__box" style="margin-top:6px;">
            <input
              id="prefEtRestSec"
              class="field__input"
              type="number"
              min="10"
              max="600"
              value="${selectedRest}"
            />
            <span class="field__suffix">seg</span>
          </div>
        </div>

        <!-- Sonido y Vibración -->
        <div class="card" style="padding:8px 16px;">
          <div class="setting-row">
            <div>
              <div class="text-card-title">Sonido al terminar descanso</div>
              <div class="text-caption">Alarma sutil cuando el temporizador llega a 00:00</div>
            </div>
            <input
              id="prefChkSound"
              class="toggle-switch"
              type="checkbox"
              ${prefs.soundEnabled ? 'checked' : ''}
            />
          </div>

          <div class="setting-row">
            <div>
              <div class="text-card-title">Vibración</div>
              <div class="text-caption">Respuesta táctil al completar el descanso</div>
            </div>
            <input
              id="prefChkVibration"
              class="toggle-switch"
              type="checkbox"
              ${prefs.vibrationEnabled ? 'checked' : ''}
            />
          </div>
        </div>

        <!-- Metas Personales -->
        <div class="field">
          <label class="field__label">Meta semanal de entrenamientos (días)</label>
          <div class="chip-row">${weeklyChipsHtml}</div>
        </div>

        <div class="grid-2col">
          <div class="field">
            <label class="field__label" for="prefEtTargetWeight">Peso meta (Opcional)</label>
            <div class="field__box">
              <input
                id="prefEtTargetWeight"
                class="field__input"
                type="number"
                step="0.5"
                min="30"
                max="300"
                placeholder="Sin definir"
                value="${targetWeightValue}"
              />
              <span class="field__suffix">kg</span>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="prefEtWaterGoal">Meta de agua diaria</label>
            <div class="field__box">
              <input
                id="prefEtWaterGoal"
                class="field__input"
                type="number"
                min="1"
                max="20"
                value="${prefs.waterGoal}"
              />
              <span class="field__suffix">vasos</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:6px;">
          <button type="button" id="prefBtnCancel" class="btn btn-outlined" style="flex:1;">
            Cancelar
          </button>
          <button type="button" id="prefBtnSave" class="btn btn-primary" style="flex:1.3;">
            Guardar preferencias
          </button>
        </div>
      </div>
    `,
    onMount: (sheet, close) => {
      const restInput = sheet.querySelector('#prefEtRestSec');

      // Cambio de tema con previsualización inmediata
      sheet.querySelectorAll('.pref-theme-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          selectedTheme = chip.getAttribute('data-theme-val') === 'light' ? 'light' : 'dark';
          PreferencesService.applyThemeToDocument(selectedTheme);
          sheet.querySelectorAll('.pref-theme-chip').forEach((c) => {
            c.classList.toggle('chip--active', c === chip);
          });
        });
      });

      sheet.querySelectorAll('.pref-rest-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          selectedRest = Number(chip.getAttribute('data-sec')) || 90;
          if (restInput) restInput.value = String(selectedRest);
          sheet.querySelectorAll('.pref-rest-chip').forEach((c) => {
            c.classList.toggle('chip--active', c === chip);
          });
        });
      });

      restInput?.addEventListener('input', () => {
        const val = Number(restInput.value) || 90;
        selectedRest = val;
        sheet.querySelectorAll('.pref-rest-chip').forEach((c) => {
          c.classList.toggle('chip--active', Number(c.getAttribute('data-sec')) === val);
        });
      });

      sheet.querySelectorAll('.pref-weekly-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          selectedWeeklyGoal = Number(chip.getAttribute('data-days')) || 4;
          sheet.querySelectorAll('.pref-weekly-chip').forEach((c) => {
            c.classList.toggle('chip--active', c === chip);
          });
        });
      });

      sheet.querySelector('#prefBtnCancel')?.addEventListener('click', () => {
        PreferencesService.applyThemeToDocument(prefs.theme);
        close();
      });

      sheet.querySelector('#prefBtnSave')?.addEventListener('click', () => {
        const restVal = Number(restInput?.value) || selectedRest || 90;
        const rawTarget = sheet.querySelector('#prefEtTargetWeight')?.value?.trim() || '';
        const targetWeightKg = rawTarget ? Number(rawTarget) : 0;
        const waterGoal =
          Number(sheet.querySelector('#prefEtWaterGoal')?.value) || prefs.waterGoal;
        const soundEnabled = Boolean(sheet.querySelector('#prefChkSound')?.checked);
        const vibrationEnabled = Boolean(sheet.querySelector('#prefChkVibration')?.checked);

        PreferencesService.updatePreferences({
          theme: selectedTheme,
          defaultRestSeconds: restVal,
          soundEnabled,
          vibrationEnabled,
          weeklyGoal: selectedWeeklyGoal,
          targetWeightKg,
          waterGoal,
        });

        close();
        showToast('Preferencias actualizadas', { type: 'success' });
        if (typeof onStateChanged === 'function') onStateChanged();
      });
    },
  });
}

/**
 * 3. Diálogo: Confirmación de cierre de sesión (88% de ancho).
 * @param {{ onLoggedOut: () => void }} callbacks
 */
export function openLogoutConfirmDialog({ onLoggedOut }) {
  showDialog({
    contentHtml: `
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;">
        <span style="color:var(--accent-red);display:flex;">${icon('ic_close', { size: 52 })}</span>
        <h3 class="text-value" style="margin-top:4px;">¿Cerrar sesión?</h3>
        <p class="text-body">¿Estás seguro de que deseas salir de tu cuenta?</p>
        <div style="display:flex;gap:12px;width:100%;margin-top:14px;">
          <button type="button" id="btnCancelLogout" class="btn btn-outlined" style="flex:1;color:var(--text-secondary);">
            Cancelar
          </button>
          <button type="button" id="btnConfirmLogout" class="btn" style="flex:1.4;min-height:50px;background:var(--accent-red);color:var(--white);border-radius:14px;">
            Cerrar sesión
          </button>
        </div>
      </div>
    `,
    onMount: (box, close) => {
      box.querySelector('#btnCancelLogout')?.addEventListener('click', close);
      box.querySelector('#btnConfirmLogout')?.addEventListener('click', () => {
        close();
        AuthService.logout();
        showToast('Sesión cerrada');
        if (typeof onLoggedOut === 'function') onLoggedOut();
      });
    },
  });
}
