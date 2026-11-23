/**
 * Pestaña 2 — Rutinas (Bloques) (src/screens/tabs/RoutinesTab.js)
 *
 * Incluye:
 * - Filtros horizontales por grupo muscular (Todos, Pecho, Espalda, Pierna, Hombro, Brazos, Core).
 * - Lista de bloques de entrenamiento con nombre libre y sin días fijos, franja lateral coloreada
 *   por el grupo muscular principal y botón circular Play ▶.
 * - BottomSheet de Vista Previa de Bloque (lista numerada, Iniciar, Editar y Eliminar con doble toque).
 * - BottomSheet de Crear / Editar Bloque (nombre libre, músculos, buscador y selección de ejercicios +
 *   botón "+ Crear ejercicio propio").
 * - Diálogo reutilizable `openCreateCustomExerciseDialog` para registrar un ejercicio propio en el catálogo.
 */

import {
  BlockService,
  ExerciseCatalog,
} from '../../services/index.js';
import { icon } from '../../ui/icons.js';
import {
  showBottomSheet,
  showDialog,
  showToast,
} from '../../ui/modals.js';

let selectedFilterGroup = 'Todos';

/**
 * Abre un diálogo centrado al 88% para crear un "Ejercicio propio" con nombre personalizado.
 * Puede invocarse tanto desde el editor de bloques como desde la sesión en vivo.
 * @param {{ defaultName?: string, onCreated?: (exercise: object) => void }} [opts]
 */
export function openCreateCustomExerciseDialog({ defaultName = '', onCreated } = {}) {
  const muscleOptions = ExerciseCatalog.MUSCLE_GROUPS.filter((g) => g !== 'Todos');
  const equipmentOptions = ExerciseCatalog.EQUIPMENT_TYPES;

  let chosenMuscle = muscleOptions[0];
  let chosenEquipment = equipmentOptions[0];

  const muscleChipsHtml = muscleOptions
    .map(
      (m) => `
      <button
        type="button"
        class="chip custom-ex-muscle ${m === chosenMuscle ? 'chip--active' : ''}"
        data-muscle="${m}"
      >
        ${m}
      </button>
    `
    )
    .join('');

  const equipChipsHtml = equipmentOptions
    .map(
      (eq) => `
      <button
        type="button"
        class="chip custom-ex-equip ${eq === chosenEquipment ? 'chip--active' : ''}"
        data-equip="${eq}"
      >
        ${eq}
      </button>
    `
    )
    .join('');

  showDialog({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <h3 class="text-section" style="font-size:20px;">Crear ejercicio propio</h3>
          <p class="text-body" style="margin-top:2px;">
            Se guardará en tu catálogo personal para usarlo en cualquier bloque o sesión
          </p>
        </div>

        <div class="field" id="customExNameField">
          <label class="field__label" for="etCustomExName">Nombre del ejercicio *</label>
          <div class="field__box">
            <input
              id="etCustomExName"
              class="field__input"
              type="text"
              placeholder="Ej. Press Arnold, Sentadilla Búlgara..."
              value="${defaultName}"
            />
          </div>
          <span class="field__error" id="errCustomExName" style="display:none;"></span>
        </div>

        <div class="field">
          <label class="field__label">Grupo muscular</label>
          <div class="chip-row">${muscleChipsHtml}</div>
        </div>

        <div class="field">
          <label class="field__label">Equipamiento</label>
          <div class="chip-row">${equipChipsHtml}</div>
        </div>

        <div style="display:flex;gap:10px;margin-top:6px;">
          <button type="button" id="btnCancelCustomEx" class="btn btn-outlined" style="flex:1;">
            Cancelar
          </button>
          <button type="button" id="btnSaveCustomEx" class="btn btn-primary" style="flex:1.2;">
            Guardar ejercicio
          </button>
        </div>
      </div>
    `,
    onMount: (box, close) => {
      const nameInput = box.querySelector('#etCustomExName');
      const fieldEl = box.querySelector('#customExNameField');
      const errEl = box.querySelector('#errCustomExName');

      nameInput?.focus();

      nameInput?.addEventListener('input', () => {
        fieldEl?.classList.remove('field--error');
        if (errEl) errEl.style.display = 'none';
      });

      box.querySelectorAll('.custom-ex-muscle').forEach((chip) => {
        chip.addEventListener('click', () => {
          chosenMuscle = chip.getAttribute('data-muscle') || 'Pecho';
          box.querySelectorAll('.custom-ex-muscle').forEach((c) => {
            c.classList.toggle('chip--active', c === chip);
          });
        });
      });

      box.querySelectorAll('.custom-ex-equip').forEach((chip) => {
        chip.addEventListener('click', () => {
          chosenEquipment = chip.getAttribute('data-equip') || 'Barra';
          box.querySelectorAll('.custom-ex-equip').forEach((c) => {
            c.classList.toggle('chip--active', c === chip);
          });
        });
      });

      box.querySelector('#btnCancelCustomEx')?.addEventListener('click', close);

      box.querySelector('#btnSaveCustomEx')?.addEventListener('click', () => {
        const res = ExerciseCatalog.createCustomExercise({
          name: nameInput?.value || '',
          muscleGroup: chosenMuscle,
          equipment: chosenEquipment,
        });

        if (!res.ok) {
          fieldEl?.classList.add('field--error');
          if (errEl) {
            errEl.textContent = res.error || 'Escribe el nombre del ejercicio';
            errEl.style.display = 'block';
          }
          return;
        }

        close();
        showToast(`Ejercicio propio creado: ${res.exercise.name}`, {
          type: 'success',
        });
        if (typeof onCreated === 'function') {
          onCreated(res.exercise);
        }
      });
    },
  });
}

/**
 * Abre el BottomSheet de Vista Previa de un Bloque (`bottom_sheet_routine_preview.xml`).
 */
function openBlockPreviewSheet(block, { onStartBlock, onEditBlock, onDeleted }) {
  const exercisesHtml =
    block.exerciseNames.length > 0
      ? block.exerciseNames
          .map(
            (name, idx) => `
            <div style="padding:10px 0;font-size:15px;color:var(--text-primary);border-bottom:1px solid var(--surface-card-stroke);">
              <b>${idx + 1}.</b> &nbsp;${name}
            </div>
          `
          )
          .join('')
      : `<p class="text-body" style="margin-top:8px;">Este bloque aún no tiene ejercicios. Toca «Editar» para agregarlos.</p>`;

  showBottomSheet({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <h3 class="text-screen" style="font-size:22px;">${block.title}</h3>
        <p class="text-body">${block.muscleGroups}</p>
        <div>
          <span class="pill">${block.exerciseCount} ejercicios • ${block.estimatedMinutes} min</span>
        </div>

        <div style="margin-top:6px;max-height:38dvh;overflow-y:auto;">
          ${exercisesHtml}
        </div>

        <button type="button" id="btnPreviewStart" class="btn btn-primary" style="width:100%;min-height:54px;margin-top:12px;">
          ${icon('ic_play', { size: 18 })} Iniciar entrenamiento
        </button>

        <div style="display:flex;gap:10px;margin-top:4px;">
          <button type="button" id="btnPreviewEdit" class="btn btn-outlined" style="flex:1;">
            ${icon('ic_edit', { size: 18 })} Editar
          </button>
          <button
            type="button"
            id="btnPreviewDelete"
            class="btn btn-outlined"
            style="flex:1;color:var(--accent-red);border-color:var(--accent-red);"
          >
            ${icon('ic_delete', { size: 18 })} <span id="lblPreviewDelete">Eliminar</span>
          </button>
        </div>
      </div>
    `,
    onMount: (sheet, close) => {
      sheet.querySelector('#btnPreviewStart')?.addEventListener('click', () => {
        close();
        onStartBlock(block);
      });

      sheet.querySelector('#btnPreviewEdit')?.addEventListener('click', () => {
        close();
        onEditBlock(block);
      });

      let deleteArmed = false;
      sheet.querySelector('#btnPreviewDelete')?.addEventListener('click', () => {
        const lbl = sheet.querySelector('#lblPreviewDelete');
        if (!deleteArmed) {
          deleteArmed = true;
          if (lbl) lbl.textContent = '¿Seguro? Toca otra vez';
          return;
        }
        BlockService.deleteBlock(block.id);
        close();
        showToast(`Bloque «${block.title}» eliminado`);
        onDeleted();
      });
    },
  });
}

/**
 * Abre el BottomSheet para Crear o Editar un Bloque con nombre libre, buscador y "+ Crear ejercicio propio".
 * @param {object | null} existingBlock
 * @param {{ onSaved: () => void }} callbacks
 */
export function openBlockEditorSheet(existingBlock, { onSaved }) {
  const selectedNames = new Set(
    (existingBlock?.exerciseNames || []).map((n) => n)
  );
  let searchQuery = '';

  showBottomSheet({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <h3 class="text-screen" style="font-size:22px;">
          ${existingBlock ? 'Editar bloque' : 'Nuevo bloque'}
        </h3>

        <!-- Nombre Libre del Bloque -->
        <div class="field" id="editorFieldName">
          <label class="field__label" for="etBlockName">Nombre del bloque *</label>
          <div class="field__box">
            <input
              id="etBlockName"
              class="field__input"
              type="text"
              placeholder="Ej. Torso Pesado, Full Body, Glúteo e Isquios..."
              value="${existingBlock?.title || ''}"
            />
          </div>
          <span class="field__error" id="errBlockName" style="display:none;"></span>
        </div>

        <!-- Músculos Principales -->
        <div class="field" id="editorFieldMuscles">
          <label class="field__label" for="etBlockMuscles">Músculos principales (Opcional: se autocalcula)</label>
          <div class="field__box">
            <input
              id="etBlockMuscles"
              class="field__input"
              type="text"
              placeholder="Ej. Pecho, Espalda y Hombro"
              value="${existingBlock?.muscleGroups || ''}"
            />
          </div>
        </div>

        <!-- Cabecera de Ejercicios + Botón Crear Ejercicio Propio -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px;">
          <div>
            <span class="text-card-title">Ejercicios del bloque</span>
            <span id="tvSelectedExCount" class="text-caption" style="color:var(--accent-orange);font-weight:700;margin-left:8px;">
              ${selectedNames.size} seleccionados
            </span>
          </div>
          <button
            type="button"
            id="btnEditorNewCustomEx"
            class="btn btn-tonal"
            style="min-height:34px;padding:0 12px;font-size:12px;"
          >
            ${icon('ic_add', { size: 15 })} Ejercicio propio
          </button>
        </div>

        <!-- Buscador rápido dentro del catálogo -->
        <div class="picker-search-box">
          <span style="color:var(--text-muted);display:flex;">${icon('ic_search', { size: 18 })}</span>
          <input
            id="etEditorSearchEx"
            type="text"
            placeholder="Buscar ejercicio (ej. Banca, Sentadilla)..."
          />
        </div>

        <!-- Lista de chips agrupados por músculo -->
        <div
          id="editorExerciseGroups"
          style="display:flex;flex-direction:column;gap:12px;max-height:36dvh;overflow-y:auto;padding-right:4px;"
        ></div>

        <!-- Acciones -->
        <div style="display:flex;gap:10px;margin-top:6px;">
          <button type="button" id="btnCancelBlock" class="btn btn-outlined" style="flex:1;color:var(--text-secondary);">
            Cancelar
          </button>
          <button type="button" id="btnSaveBlock" class="btn btn-primary" style="flex:1.2;">
            Guardar
          </button>
        </div>
      </div>
    `,
    onMount: (sheet, close) => {
      const nameInput = sheet.querySelector('#etBlockName');
      const musclesInput = sheet.querySelector('#etBlockMuscles');
      const searchInput = sheet.querySelector('#etEditorSearchEx');
      const groupsContainer = sheet.querySelector('#editorExerciseGroups');
      const countEl = sheet.querySelector('#tvSelectedExCount');
      const fieldName = sheet.querySelector('#editorFieldName');
      const errName = sheet.querySelector('#errBlockName');

      function updateCountLabel() {
        if (countEl) {
          countEl.textContent = `${selectedNames.size} ${selectedNames.size === 1 ? 'seleccionado' : 'seleccionados'}`;
        }
      }

      function renderExerciseGroups() {
        if (!groupsContainer) return;
        const muscles = ExerciseCatalog.MUSCLE_GROUPS.filter((g) => g !== 'Todos');
        const allExercises = ExerciseCatalog.searchExercises({
          query: searchQuery,
          muscleGroup: 'Todos',
        });

        let html = '';
        for (const muscle of muscles) {
          const groupList = allExercises.filter((e) => e.muscleGroup === muscle);
          if (groupList.length === 0) continue;

          html += `
            <div>
              <div class="text-caption" style="color:var(--text-secondary);font-weight:700;margin-bottom:6px;">
                ${muscle}
              </div>
              <div class="chip-row">
                ${groupList
                  .map((ex) => {
                    const checked = selectedNames.has(ex.name);
                    return `
                      <button
                        type="button"
                        class="chip editor-ex-chip ${checked ? 'chip--active' : ''}"
                        data-ex-name="${ex.name}"
                      >
                        ${ex.name}${ex.isCustom ? ' ★' : ''}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          `;
        }

        if (!html) {
          html = `<p class="text-body">No se encontraron ejercicios para "${searchQuery}". Puedes crearlo con el botón «+ Ejercicio propio».</p>`;
        }

        groupsContainer.innerHTML = html;

        groupsContainer.querySelectorAll('.editor-ex-chip').forEach((chip) => {
          chip.addEventListener('click', () => {
            const exName = chip.getAttribute('data-ex-name');
            if (!exName) return;
            if (selectedNames.has(exName)) {
              selectedNames.delete(exName);
              chip.classList.remove('chip--active');
            } else {
              selectedNames.add(exName);
              chip.classList.add('chip--active');
            }
            updateCountLabel();
          });
        });
      }

      renderExerciseGroups();

      nameInput?.addEventListener('input', () => {
        fieldName?.classList.remove('field--error');
        if (errName) errName.style.display = 'none';
      });

      searchInput?.addEventListener('input', () => {
        searchQuery = searchInput.value || '';
        renderExerciseGroups();
      });

      // Crear ejercicio propio desde el editor de bloques
      sheet.querySelector('#btnEditorNewCustomEx')?.addEventListener('click', () => {
        const draftTitle = nameInput?.value || '';
        const draftMuscles = musclesInput?.value || '';
        close();
        openCreateCustomExerciseDialog({
          defaultName: searchQuery,
          onCreated: (newEx) => {
            selectedNames.add(newEx.name);
            // Reabrir el editor con el ejercicio propio ya seleccionado
            openBlockEditorSheet(
              {
                id: existingBlock?.id || null,
                title: draftTitle,
                muscleGroups: draftMuscles,
                exerciseNames: [...selectedNames],
              },
              { onSaved }
            );
          },
        });
      });

      sheet.querySelector('#btnCancelBlock')?.addEventListener('click', close);

      sheet.querySelector('#btnSaveBlock')?.addEventListener('click', () => {
        const title = nameInput?.value?.trim() || '';
        const muscleGroups = musclesInput?.value?.trim() || '';

        if (!title) {
          fieldName?.classList.add('field--error');
          if (errName) {
            errName.textContent = 'Escribe el nombre del bloque';
            errName.style.display = 'block';
          }
          return;
        }

        const exerciseNames = [...selectedNames];
        const isEdit = Boolean(existingBlock?.id);

        const res = isEdit
          ? BlockService.updateBlock(existingBlock.id, {
              title,
              muscleGroups,
              exerciseNames,
            })
          : BlockService.createBlock({
              title,
              muscleGroups,
              exerciseNames,
            });

        if (!res.ok) {
          showToast(res.error || 'No se pudo guardar el bloque', { type: 'error' });
          return;
        }

        close();
        showToast(
          isEdit
            ? `Bloque «${title}» actualizado`
            : `Bloque «${title}» creado`,
          { type: 'success' }
        );
        if (typeof onSaved === 'function') onSaved();
      });
    },
  });
}

/**
 * Renderiza la Pestaña 2 — Rutinas (Bloques).
 * @param {HTMLElement} container
 * @param {{
 *   onStartWorkout: (config: { isImprovised: boolean, block: object | null }) => void,
 *   onBlocksChanged?: () => void
 * }} callbacks
 */
export function renderRoutinesTab(container, { onStartWorkout, onBlocksChanged }) {
  const allBlocks = BlockService.getAllBlocks();
  const customCount = ExerciseCatalog.getCustomExercises().length;

  const visibleBlocks =
    selectedFilterGroup === 'Todos'
      ? allBlocks
      : allBlocks.filter((b) =>
          BlockService.groupsOfBlock(b).includes(selectedFilterGroup)
        );

  const filterChipsHtml = ExerciseCatalog.MUSCLE_GROUPS.map(
    (group) => `
      <button
        type="button"
        class="chip routine-filter-chip ${group === selectedFilterGroup ? 'chip--active' : ''}"
        data-group="${group}"
        style="white-space:nowrap;flex-shrink:0;"
      >
        ${group}
      </button>
    `
  ).join('');

  const blocksHtml =
    visibleBlocks.length > 0
      ? visibleBlocks
          .map((block) => {
            const primaryMuscle = BlockService.primaryGroupOfBlock(block);
            const accentColor = ExerciseCatalog.colorForMuscle(primaryMuscle);
            const previewList = block.exerciseNames.slice(0, 3).join(' • ');
            const hasMore = block.exerciseNames.length > 3;
            const previewText = previewList
              ? `${previewList}${hasMore ? '…' : ''}`
              : 'Sin ejercicios asignados aún';

            return `
              <div class="card-routine" data-block-card="${block.id}">
                <div class="card-routine__accent" style="background-color:${accentColor};"></div>
                <div class="card-routine__body">
                  <div style="flex:1;overflow:hidden;">
                    <h3 class="text-section">${block.title}</h3>
                    <p class="text-body" style="margin-top:2px;">${block.muscleGroups}</p>
                    <p
                      class="text-caption"
                      style="margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
                    >
                      ${previewText}
                    </p>
                    <span class="pill" style="margin-top:10px;">
                      ${block.exerciseCount} ejercicios • ${block.estimatedMinutes} min
                    </span>
                  </div>

                  <button
                    type="button"
                    class="btn btn-play"
                    data-start-block="${block.id}"
                    aria-label="Iniciar ${block.title}"
                    title="Iniciar entrenamiento"
                  >
                    ${icon('ic_play', { size: 20 })}
                  </button>
                </div>
              </div>
            `;
          })
          .join('')
      : `
        <div class="card" style="text-align:center;padding:32px 20px;">
          <p class="text-body">
            No hay bloques para el grupo muscular <b>${selectedFilterGroup}</b>.
            Crea uno nuevo con el botón «+ Nuevo Bloque».
          </p>
        </div>
      `;

  container.innerHTML = `
    <!-- 1. Encabezado -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <div>
        <h1 class="text-screen">Rutinas</h1>
        <p class="text-body" style="margin-top:2px;">
          ${allBlocks.length} ${allBlocks.length === 1 ? 'bloque' : 'bloques'}
          ${customCount > 0 ? ` · ${customCount} ejercicio(s) propio(s)` : ''}
        </p>
      </div>

      <button type="button" id="btnCreateBlock" class="btn btn-tonal">
        ${icon('ic_add', { size: 18 })} Nuevo Bloque
      </button>
    </div>

    <!-- 2. Filtros por Grupo Muscular + Botón rápido de Ejercicio Propio -->
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="chip-row" style="overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;">
        ${filterChipsHtml}
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <button
          type="button"
          id="btnQuickCustomExercise"
          style="background:none;border:none;color:var(--primary-neon);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:4px;"
        >
          ${icon('ic_add', { size: 16 })} Crear ejercicio propio en el catálogo
        </button>
      </div>
    </div>

    <!-- 3. Lista de Tarjetas de Bloques -->
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${blocksHtml}
    </div>
  `;

  const refreshRoutines = () => {
    renderRoutinesTab(container, { onStartWorkout, onBlocksChanged });
    if (typeof onBlocksChanged === 'function') onBlocksChanged();
  };

  // Filtros de grupo muscular
  container.querySelectorAll('.routine-filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedFilterGroup = chip.getAttribute('data-group') || 'Todos';
      renderRoutinesTab(container, { onStartWorkout, onBlocksChanged });
    });
  });

  // Crear nuevo bloque
  container.querySelector('#btnCreateBlock')?.addEventListener('click', () => {
    openBlockEditorSheet(null, { onSaved: refreshRoutines });
  });

  // Crear ejercicio propio directo
  container.querySelector('#btnQuickCustomExercise')?.addEventListener('click', () => {
    openCreateCustomExerciseDialog({
      onCreated: refreshRoutines,
    });
  });

  // Botón Play directo en la tarjeta
  container.querySelectorAll('[data-start-block]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-start-block');
      const block = BlockService.getBlockById(id);
      if (block) {
        onStartWorkout({ isImprovised: false, block });
      }
    });
  });

  // Toque en la tarjeta -> Vista Previa
  container.querySelectorAll('[data-block-card]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-block-card');
      const block = BlockService.getBlockById(id);
      if (!block) return;

      openBlockPreviewSheet(block, {
        onStartBlock: (b) => onStartWorkout({ isImprovised: false, block: b }),
        onEditBlock: (b) => openBlockEditorSheet(b, { onSaved: refreshRoutines }),
        onDeleted: refreshRoutines,
      });
    });
  });
}
