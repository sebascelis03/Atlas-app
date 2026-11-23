/**
 * Gestor de Modales (BottomSheets deslizables, Diálogos al 88% de ancho) y Toasts.
 * Basado en .docs/03_referencia_ui_android/02_DISTRIBUCION_PANTALLAS_Y_MODALES.md
 */

let activeBackdrop = null;
let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer && document.body.contains(toastContainer)) {
    return toastContainer;
  }
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

/**
 * Muestra un mensaje flotante estilo Android Toast.
 * @param {string} message
 * @param {{ type?: 'info' | 'success' | 'error', duration?: number }} [opts]
 */
export function showToast(message, { type = 'info', duration = 2600 } = {}) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  const modClass =
    type === 'success'
      ? ' toast--success'
      : type === 'error'
        ? ' toast--error'
        : '';
  el.className = `toast${modClass}`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, duration);
}

/**
 * Cierra el modal activo (Dialog o BottomSheet) si existe.
 */
export function closeModal() {
  if (activeBackdrop) {
    activeBackdrop.remove();
    activeBackdrop = null;
  }
}

/**
 * Abre un diálogo centrado al 88% del ancho del viewport (`bg_card_dark`).
 * @param {{
 *   contentHtml: string,
 *   dismissible?: boolean,
 *   onMount?: (boxEl: HTMLElement, close: () => void) => void
 * }} options
 */
export function showDialog({ contentHtml, dismissible = true, onMount }) {
  closeModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const box = document.createElement('div');
  box.className = 'dialog-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = contentHtml;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
  activeBackdrop = backdrop;

  if (dismissible) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }

  if (typeof onMount === 'function') {
    onMount(box, closeModal);
  }
}

/**
 * Abre un BottomSheet deslizable desde el borde inferior (`#161B22`, asa 40x4px).
 * @param {{
 *   contentHtml: string,
 *   dismissible?: boolean,
 *   onMount?: (sheetEl: HTMLElement, close: () => void) => void
 * }} options
 */
export function showBottomSheet({ contentHtml, dismissible = true, onMount }) {
  closeModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--sheet';

  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    ${contentHtml}
  `;

  backdrop.appendChild(sheet);
  document.body.appendChild(backdrop);
  activeBackdrop = backdrop;

  if (dismissible) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }

  if (typeof onMount === 'function') {
    onMount(sheet, closeModal);
  }
}

export const ModalManager = {
  showToast,
  showDialog,
  showBottomSheet,
  closeModal,
};
