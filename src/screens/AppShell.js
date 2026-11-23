/**
 * Contenedor Principal de ATLAS (AppShell):
 * - Header Superior Fijo: Logo ATLAS a la izquierda + Botón de Perfil en la esquina superior derecha
 *   con menú desplegable (Configuración de cuenta, Preferencias y Cerrar sesión).
 * - Área Principal de 3 Pestañas (Inicio, Rutinas, Dashboard) que permanecen montadas en el DOM
 *   para conservar la posición de scroll al alternar entre ellas.
 * - Barra de Navegación Inferior fija con las 3 pestañas oficiales.
 */

import {
  AuthService,
  BlockService,
  ExerciseCatalog,
  WorkoutService,
} from '../services/index.js';
import { icon } from '../ui/icons.js';
import { showToast } from '../ui/modals.js';
import {
  closeProfileDropdown,
  toggleProfileDropdown,
} from './ProfileMenuModal.js';
import { renderHomeTab } from './tabs/HomeTab.js';

let activeTab = 'home'; // 'home' | 'routines' | 'dashboard'
const tabScrollPositions = {
  home: 0,
  routines: 0,
  dashboard: 0,
};

/**
 * Permite cambiar de pestaña programáticamente conservando el scroll de la pestaña anterior.
 * @param {'home' | 'routines' | 'dashboard'} nextTab
 */
export function selectTab(nextTab) {
  if (!['home', 'routines', 'dashboard'].includes(nextTab)) return;
  tabScrollPositions[activeTab] = window.scrollY || 0;
  activeTab = nextTab;

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    const id = panel.getAttribute('data-tab-panel');
    panel.hidden = id !== activeTab;
  });

  document.querySelectorAll('.bottom-nav__item').forEach((btn) => {
    const id = btn.getAttribute('data-tab-btn');
    btn.classList.toggle('bottom-nav__item--active', id === activeTab);
  });

  window.scrollTo(0, tabScrollPositions[activeTab] || 0);
}

/**
 * Renderiza el contenedor autenticado de ATLAS con su Header, Menú de Perfil y 3 Pestañas.
 * @param {HTMLElement} container
 * @param {{
 *   onLoggedOut: () => void,
 *   onStartWorkout?: (config: { isImprovised: boolean, block: object | null }) => void
 * }} callbacks
 */
export function renderAppShell(container, { onLoggedOut, onStartWorkout }) {
  closeProfileDropdown();

  const user = AuthService.getCurrentUser();
  if (!user) {
    onLoggedOut();
    return;
  }

  const fullName = AuthService.getFullName(user);
  const initial = fullName.charAt(0).toUpperCase();
  const blocks = BlockService.getAllBlocks();
  const customExercises = ExerciseCatalog.getCustomExercises();
  const totalWorkouts = WorkoutService.getTotalWorkouts();
  const streak = WorkoutService.getStreakDays();

  container.innerHTML = `
    <!-- Header Superior Fijo (Logo ATLAS + Menú de Perfil) -->
    <header class="app-header">
      <div class="app-header__brand">
        <span style="color:var(--primary-neon);display:flex;">${icon('ic_fitness_center', { size: 24 })}</span>
        <span>ATLAS</span>
      </div>

      <button
        type="button"
        id="btnHeaderProfile"
        class="avatar"
        style="width:40px;height:40px;font-size:16px;cursor:pointer;"
        aria-label="Abrir menú de perfil"
        title="${fullName}"
      >
        ${initial}
      </button>
    </header>

    <!-- Área Central con los 3 Paneles de Pestañas Preservados -->
    <main class="app-main">
      <!-- PESTAÑA 1: INICIO (Montada dinámicamente por HomeTab.js) -->
      <section
        id="tabPanelHome"
        class="tab-panel"
        data-tab-panel="home"
        ${activeTab !== 'home' ? 'hidden' : ''}
      ></section>

      <!-- PESTAÑA 2: RUTINAS (BLOQUES) — Se completa en Plan #8 -->
      <section
        id="tabPanelRoutines"
        class="tab-panel"
        data-tab-panel="routines"
        ${activeTab !== 'routines' ? 'hidden' : ''}
      >
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h1 class="text-screen">Rutinas</h1>
            <p class="text-body">${blocks.length} bloques · ${customExercises.length} ejercicios propios</p>
          </div>
        </div>

        <div class="card" style="display:flex;flex-direction:column;gap:8px;">
          <h2 class="text-section">Bloques Configurados</h2>
          <p class="text-body">
            El gestor completo de bloques, creación de ejercicios propios y sesión en vivo se conectará en el <b>Plan #8</b>.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:6px;">
            ${blocks
              .map(
                (b) => `
                <div class="card-routine">
                  <div class="card-routine__accent"></div>
                  <div class="card-routine__body">
                    <div>
                      <h3 class="text-section">${b.title}</h3>
                      <p class="text-body">${b.muscleGroups}</p>
                      <span class="pill" style="margin-top:8px;">${b.exerciseCount} ejercicios • ${b.estimatedMinutes} min</span>
                    </div>
                  </div>
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- PESTAÑA 3: DASHBOARD — Se completa en Plan #9 -->
      <section
        id="tabPanelDashboard"
        class="tab-panel"
        data-tab-panel="dashboard"
        ${activeTab !== 'dashboard' ? 'hidden' : ''}
      >
        <div>
          <h1 class="text-screen">Dashboard</h1>
          <p class="text-body">Estadísticas, gráficas Canvas e historial</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
          <div class="tile">
            <span style="color:var(--accent-orange);display:flex;">${icon('ic_flame', { size: 20 })}</span>
            <p class="text-value" style="margin-top:10px;">${streak} d</p>
            <p class="text-caption">Racha</p>
          </div>
          <div class="tile">
            <span style="color:var(--group-core);display:flex;">${icon('ic_bolt', { size: 20 })}</span>
            <p class="text-value" style="margin-top:10px;">${WorkoutService.getThisWeekVolume()} kg</p>
            <p class="text-caption">Semanal</p>
          </div>
          <div class="tile">
            <span style="color:var(--primary-neon);display:flex;">${icon('ic_trophy', { size: 20 })}</span>
            <p class="text-value" style="margin-top:10px;">${totalWorkouts}</p>
            <p class="text-caption">Sesiones</p>
          </div>
        </div>

        <div class="card">
          <h2 class="text-section">Panel Estadístico</h2>
          <p class="text-body" style="margin-top:4px;">
            Las gráficas Canvas 2D (volumen, entrenamientos, evolución de peso y calendario de actividad) se conectarán en el <b>Plan #9</b>.
          </p>
        </div>
      </section>
    </main>

    <!-- Barra de Navegación Inferior (3 Pestañas Oficiales) -->
    <nav class="bottom-nav" aria-label="Navegación principal">
      <button
        type="button"
        class="bottom-nav__item ${activeTab === 'home' ? 'bottom-nav__item--active' : ''}"
        data-tab-btn="home"
      >
        <span class="bottom-nav__pill">${icon('ic_home', { size: 22 })}</span>
        <span>Inicio</span>
      </button>

      <button
        type="button"
        class="bottom-nav__item ${activeTab === 'routines' ? 'bottom-nav__item--active' : ''}"
        data-tab-btn="routines"
      >
        <span class="bottom-nav__pill">${icon('ic_fitness_center', { size: 22 })}</span>
        <span>Rutinas</span>
      </button>

      <button
        type="button"
        class="bottom-nav__item ${activeTab === 'dashboard' ? 'bottom-nav__item--active' : ''}"
        data-tab-btn="dashboard"
      >
        <span class="bottom-nav__pill">${icon('ic_bar_chart', { size: 22 })}</span>
        <span>Dashboard</span>
      </button>
    </nav>
  `;

  const refreshShell = () =>
    renderAppShell(container, { onLoggedOut, onStartWorkout });

  const handleStartWorkout = (workoutConfig) => {
    if (typeof onStartWorkout === 'function') {
      onStartWorkout(workoutConfig);
    } else {
      const label = workoutConfig?.isImprovised
        ? 'Rutina Improvisada'
        : workoutConfig?.block?.title || 'Entrenamiento';
      showToast(`Iniciando: ${label} (Motor en vivo en Plan #8)`, {
        type: 'info',
      });
    }
  };

  // Montar Pestaña 1 — Inicio
  const homePanel = container.querySelector('#tabPanelHome');
  if (homePanel) {
    renderHomeTab(homePanel, {
      onNavigateTab: (tabId) => selectTab(tabId),
      onStartWorkout: handleStartWorkout,
    });
  }

  // Botón de perfil en la esquina superior derecha
  container.querySelector('#btnHeaderProfile')?.addEventListener('click', () => {
    toggleProfileDropdown({
      onStateChanged: refreshShell,
      onLoggedOut,
    });
  });

  // Cambio de pestañas inferiores conservando scroll
  container.querySelectorAll('.bottom-nav__item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab-btn');
      if (targetTab) {
        selectTab(targetTab);
      }
    });
  });
}
