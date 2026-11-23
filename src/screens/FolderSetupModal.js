/**
 * Ventana Emergente de Primera Ejecución para Carpeta Local (Android vs Web).
 *
 * - En Android (.apk): Se abre automáticamente la primera vez que el usuario entra a la app
 *   (`StorageEngine.needsFolderSetup() === true`), solicitando elegir/crear la carpeta local.
 * - En Navegador Web: Se desactiva automáticamente para no interrumpir las pruebas, pero puede
 *   abrirse manualmente desde Configuración de cuenta o desde el botón de prueba.
 */

import { StorageEngine } from '../services/index.js';
import { icon } from '../ui/icons.js';
import { showDialog, showToast } from '../ui/modals.js';

/**
 * Muestra el diálogo para crear o elegir la carpeta local donde ATLAS guarda sus archivos JSON.
 * @param {{ dismissible?: boolean, onConfigured?: (path: string) => void }} [opts]
 */
export function openFolderSetupModal({ dismissible = true, onConfigured } = {}) {
  const current = StorageEngine.getFolderConfig();
  const isAndroid = StorageEngine.isAndroidEnvironment();

  const contentHtml = `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="icon-tile" style="color:var(--accent-orange);">
          ${icon('ic_fitness_center', { size: 22 })}
        </div>
        <div>
          <h3 class="text-section" style="font-size:19px;">Carpeta Local de Datos</h3>
          <p class="text-caption">${isAndroid ? 'Almacenamiento interno Android' : 'Modo Web (Simulación local)'}</p>
        </div>
      </div>

      <p class="text-body" style="line-height:1.45;">
        ATLAS funciona <b>100 % de manera local</b>. Indica el nombre de la carpeta dentro de
        <code>Documentos/</code> donde se guardarán tus rutinas, historial y métricas en formato JSON.
      </p>

      <div class="field" id="folderField">
        <label class="field__label" for="etFolderName">Carpeta en Documentos</label>
        <div class="field__box">
          <span class="text-caption" style="margin-right:6px;">Documents /</span>
          <input
            id="etFolderName"
            class="field__input"
            type="text"
            value="${current.folderName || 'ATLAS_Data'}"
            placeholder="ATLAS_Data"
            maxlength="40"
          />
        </div>
        <span id="tvFolderError" class="field__error" style="display:none;"></span>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" class="chip folder-preset" data-folder="ATLAS_Data">ATLAS_Data</button>
        <button type="button" class="chip folder-preset" data-folder="ATLAS_Backup">ATLAS_Backup</button>
        <button type="button" class="chip folder-preset" data-folder="Mi_Gimnasio_ATLAS">Mi_Gimnasio_ATLAS</button>
      </div>

      <div style="display:flex;gap:10px;margin-top:8px;">
        ${
          dismissible
            ? `<button id="btnCancelFolder" type="button" class="btn btn-outlined" style="flex:1;">Cancelar</button>`
            : ''
        }
        <button id="btnConfirmFolder" type="button" class="btn btn-primary" style="flex:1.3;">
          Guardar carpeta
        </button>
      </div>
    </div>
  `;

  showDialog({
    contentHtml,
    dismissible,
    onMount: (box, close) => {
      const input = box.querySelector('#etFolderName');
      const errorEl = box.querySelector('#tvFolderError');
      const fieldEl = box.querySelector('#folderField');

      box.querySelectorAll('.folder-preset').forEach((chip) => {
        chip.addEventListener('click', () => {
          const val = chip.getAttribute('data-folder');
          if (input && val) {
            input.value = val;
            fieldEl?.classList.remove('field--error');
            if (errorEl) errorEl.style.display = 'none';
          }
        });
      });

      box.querySelector('#btnCancelFolder')?.addEventListener('click', () => {
        close();
      });

      box.querySelector('#btnConfirmFolder')?.addEventListener('click', async () => {
        const folderName = input?.value?.trim() || '';
        if (!folderName) {
          fieldEl?.classList.add('field--error');
          if (errorEl) {
            errorEl.textContent = 'Escribe un nombre para la carpeta';
            errorEl.style.display = 'block';
          }
          return;
        }

        const res = await StorageEngine.configureLocalFolder(folderName);
        if (!res.ok) {
          fieldEl?.classList.add('field--error');
          if (errorEl) {
            errorEl.textContent = res.error || 'No se pudo configurar la carpeta';
            errorEl.style.display = 'block';
          }
          return;
        }

        close();
        showToast(`Carpeta configurada: ${res.path}`, { type: 'success' });
        if (typeof onConfigured === 'function') {
          onConfigured(res.path);
        }
      });
    },
  });
}

/**
 * Verifica si estamos en la primera ejecución de Android (.apk) y abre la ventana automáticamente.
 * En navegador web no hace nada para no interrumpir las pruebas.
 * @param {() => void} [onConfigured]
 */
export function checkAndShowFolderSetupIfNeeded(onConfigured) {
  if (StorageEngine.needsFolderSetup()) {
    openFolderSetupModal({
      dismissible: false,
      onConfigured,
    });
  }
}
