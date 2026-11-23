/**
 * Contenedor Principal de ATLAS (AppShell):
 * - Header Superior Fijo: Logo ATLAS a la izquierda + Botón de Perfil en la esquina superior derecha
 *   con menú desplegable (Configuración de cuenta, Preferencias y Cerrar sesión).
 * - Área Principal de 3 Pestañas (Inicio, Rutinas, Dashboard) que permanecen montadas en el DOM
 *   para conservar la posición de scroll al alternar entre ellas.
 * - Transición limpia hacia el Motor de Sesión en Vivo (`WorkoutLiveScreen`) al iniciar
 *   cualquier bloque guardado o al pulsar "Iniciar rutina improvisada".
 */

import { AuthService } from '../services/index.js';
import { icon } from '../ui/icons.js';
import {
  closeProfileDropdown,
  toggleProfileDropdown,
} from './ProfileMenuModal.js';
import {
  drawDashboardCharts,
  renderDashboardTab,
} from './tabs/DashboardTab.js';
import { renderHomeTab } from './tabs/HomeTab.js';
import { renderRoutinesTab } from './tabs/RoutinesTab.js';
import { renderWorkoutLiveScreen } from './WorkoutLiveScreen.js';

let activeTab = 'home'; // 'home' | 'routines' | 'dashboard'
let activeLiveWorkoutConfig = null; // null | { isImprovised: boolean, block: object | null }

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

  if (activeTab === 'dashboard') {
    const dashPanel = document.querySelector('#tabPanelDashboard');
    if (dashPanel) {
      requestAnimationFrame(() => drawDashboardCharts(dashPanel));
    }
  }

  window.scrollTo(0, tabScrollPositions[activeTab] || 0);
}

/**
 * Renderiza el contenedor autenticado de ATLAS (o la Sesión en Vivo si hay un entrenamiento activo).
 * @param {HTMLElement} container
 * @param {{ onLoggedOut: () => void }} callbacks
 */
export function renderAppShell(container, { onLoggedOut }) {
  closeProfileDropdown();

  const user = AuthService.getCurrentUser();
  if (!user) {
    activeLiveWorkoutConfig = null;
    onLoggedOut();
    return;
  }

  // Si hay una sesión de entrenamiento en curso, mostrar el Motor de Sesión en Vivo
  if (activeLiveWorkoutConfig) {
    renderWorkoutLiveScreen(container, {
      isImprovised: Boolean(activeLiveWorkoutConfig.isImprovised),
      block: activeLiveWorkoutConfig.block || null,
      onFinished: () => {
        activeLiveWorkoutConfig = null;
        activeTab = 'home';
        renderAppShell(container, { onLoggedOut });
        window.scrollTo(0, 0);
      },
    });
    return;
  }

  const fullName = AuthService.getFullName(user);
  const initial = fullName.charAt(0).toUpperCase();

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
      <!-- PESTAÑA 1: INICIO (HomeTab.js) -->
      <section
        id="tabPanelHome"
        class="tab-panel"
        data-tab-panel="home"
        ${activeTab !== 'home' ? 'hidden' : ''}
      ></section>

      <!-- PESTAÑA 2: RUTINAS / BLOQUES (RoutinesTab.js) -->
      <section
        id="tabPanelRoutines"
        class="tab-panel"
        data-tab-panel="routines"
        ${activeTab !== 'routines' ? 'hidden' : ''}
      ></section>

      <!-- PESTAÑA 3: DASHBOARD (DashboardTab.js) -->
      <section
        id="tabPanelDashboard"
        class="tab-panel"
        data-tab-panel="dashboard"
        ${activeTab !== 'dashboard' ? 'hidden' : ''}
      ></section>
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

  const refreshShell = () => renderAppShell(container, { onLoggedOut });

  const handleStartWorkout = (workoutConfig) => {
    activeLiveWorkoutConfig = workoutConfig || {
      isImprovised: true,
      block: null,
    };
    renderAppShell(container, { onLoggedOut });
    window.scrollTo(0, 0);
  };

  const homePanel = container.querySelector('#tabPanelHome');
  const routinesPanel = container.querySelector('#tabPanelRoutines');
  const dashboardPanel = container.querySelector('#tabPanelDashboard');

  const mountDashboard = () => {
    if (dashboardPanel) {
      renderDashboardTab(dashboardPanel, {
        onWeightUpdated: () => mountHome(),
      });
    }
  };

  const mountHome = () => {
    if (homePanel) {
      renderHomeTab(homePanel, {
        onNavigateTab: (tabId) => selectTab(tabId),
        onStartWorkout: handleStartWorkout,
      });
    }
    if (dashboardPanel) {
      renderDashboardTab(dashboardPanel, {
        onWeightUpdated: () => {
          if (homePanel) {
            renderHomeTab(homePanel, {
              onNavigateTab: (tabId) => selectTab(tabId),
              onStartWorkout: handleStartWorkout,
            });
          }
        },
      });
    }
  };

  const mountRoutines = () => {
    if (routinesPanel) {
      renderRoutinesTab(routinesPanel, {
        onStartWorkout: handleStartWorkout,
        onBlocksChanged: mountHome,
      });
    }
  };

  mountHome();
  mountRoutines();
  mountDashboard();

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
