/**
 * Catálogo completo de los 21 íconos vectoriales de ATLAS
 * Extraído 1:1 de .docs/03_referencia_ui_android/03_ESPECIFICACION_GRAFICAS_E_ICONOS.md
 */

export const ICONS = {
  ic_add: {
    type: 'fill',
    d: 'M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  },
  ic_arrow_back: {
    type: 'fill',
    d: 'M20,11H7.83l5.59,-5.59L12,4l-8,8 8,8 1.41,-1.41L7.83,13H20v-2z',
  },
  ic_bar_chart: {
    type: 'fill',
    d: 'M5,9.2h3V19H5V9.2zM10.6,5h2.8v14h-2.8V5zM16.2,13H19v6h-2.8V13z',
  },
  ic_bolt: {
    type: 'fill',
    d: 'M13,2 L5,13 H11 L10,22 L19,10 H13 Z',
  },
  ic_calendar: {
    type: 'fill',
    fillRule: 'evenodd',
    d: 'M5,4 H19 A2,2 0 0 1 21,6 V20 A2,2 0 0 1 19,22 H5 A2,2 0 0 1 3,20 V6 A2,2 0 0 1 5,4 Z M5,9 V20 H19 V9 Z',
  },
  ic_check: {
    type: 'fill',
    d: 'M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41,-1.41z',
  },
  ic_chevron_right: {
    type: 'stroke',
    strokeWidth: 2.5,
    d: 'M9,5 L16,12 L9,19',
  },
  ic_close: {
    type: 'fill',
    d: 'M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12z',
  },
  ic_delete: {
    type: 'fill',
    d: 'M6,19c0,1.1 0.9,2 2,2h8c1.1,0 2,-0.9 2,-2V7H6v12zM19,4h-3.5l-1,-1h-5l-1,1H5v2h14V4z',
  },
  ic_drop: {
    type: 'fill',
    d: 'M12,2 C12,2 5,10 5,14.5 A7,7 0 0 0 19,14.5 C19,10 12,2 12,2 Z',
  },
  ic_edit: {
    type: 'fill',
    d: 'M4,16 L4,20 L8,20 L19,9 L15,5 Z',
  },
  ic_fitness_center: {
    type: 'fill',
    d: 'M20.57,14.86L22,13.43 20.57,12 17,15.57 8.43,7 12,3.43 10.57,2 9.14,3.43 7.71,2 5.57,4.14 4.14,2.71 2.71,4.14l1.43,1.43L2,7.71l1.43,1.43L2,10.57 3.43,12 7,8.43 15.57,17 12,20.57 13.43,22l1.43,-1.43 1.43,1.43 2.14,-2.14 1.43,1.43 1.43,-1.43 -1.43,-1.43 1.43,-1.43 -1.43,-1.43 -1.43,-1.43 3.57,-3.57z',
  },
  ic_flame: {
    type: 'fill',
    d: 'M12,2 C12,2 6,8 6,14 A6,6 0 0 0 18,14 C18,11 16,9 15,8 C15,10 14,11 13,11 C13,8 12,2 12,2 Z',
  },
  ic_home: {
    type: 'fill',
    d: 'M10,20v-6h4v6h5v-8h3L12,3 2,12h3v8z',
  },
  ic_person: {
    type: 'fill',
    d: 'M12,12c2.21,0 4,-1.79 4,-4s-1.79,-4 -4,-4 -4,1.79 -4,4 1.79,4 4,4zM12,14c-2.67,0 -8,1.34 -8,4v2h16v-2c0,-2.66 -5.33,-4 -8,-4z',
  },
  ic_play: {
    type: 'fill',
    d: 'M8,5 V19 L19,12 Z',
  },
  ic_ruler: {
    type: 'fill',
    fillRule: 'evenodd',
    d: 'M3,7 H21 V17 H3 Z M6,7 V12 H7.5 V7 Z M10,7 V13 H11.5 V7 Z M14,7 V12 H15.5 V7 Z M18,7 V13 H19.5 V7 Z',
  },
  ic_search: {
    type: 'fill',
    d: 'M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zm-6,0C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14z',
  },
  ic_timer: {
    type: 'fill',
    d: 'M15,1H9v2h6V1zm-4,13h2V8h-2v6zm8.03,-6.61l1.42,-1.42c-.43,-.51 -.9,-.99 -1.41,-1.41l-1.42,1.42C16.07,4.74 14.12,4 12,4c-4.97,0 -9,4.03 -9,9s4.02,9 9,9 9,-4.03 9,-9c0,-2.12 -.74,-4.07 -1.97,-5.61zM12,20c-3.87,0 -7,-3.13 -7,-7s3.13,-7 7,-7 7,3.13 7,7 -3.13,7 -7,7z',
  },
  ic_trend: {
    type: 'stroke',
    strokeWidth: 2.5,
    d: 'M3,17 L9,11 L13,15 L21,7 M15,7 H21 V13',
  },
  ic_trophy: {
    type: 'fill',
    d: 'M7,4 H17 V10 A5,5 0 0 1 7,10 Z M10,16 H14 V19 H16 V21 H8 V19 H10 Z',
  },
};

/**
 * Renderiza un ícono SVG inline que hereda el color de texto (`currentColor`).
 * @param {keyof typeof ICONS} name Nombre del ícono (ej. 'ic_fitness_center')
 * @param {{ size?: number, className?: string }} [opts]
 * @returns {string} HTML del elemento <svg>
 */
export function icon(name, { size = 24, className = '' } = {}) {
  const spec = ICONS[name];
  if (!spec) return '';

  const cls = className ? ` class="${className}"` : '';
  if (spec.type === 'stroke') {
    return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${spec.d}" stroke="currentColor" stroke-width="${spec.strokeWidth || 2.5}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  const rule = spec.fillRule ? ` fill-rule="${spec.fillRule}" clip-rule="${spec.fillRule}"` : '';
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${spec.d}"${rule}/></svg>`;
}
