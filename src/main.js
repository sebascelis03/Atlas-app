import './styles/atlas.css';
import { renderAuthScreen } from './screens/AuthScreen.js';
import {
  checkAndShowFolderSetupIfNeeded,
  openFolderSetupModal,
} from './screens/FolderSetupModal.js';
import {
  AuthService,
  BlockService,
  DailyLogService,
  DateHelper,
  ExerciseCatalog,
  initAtlasDataLayer,
  PreferencesService,
  StorageEngine,
  WorkoutService,
} from './services/index.js';
import { icon } from './ui/icons.js';
import { showBottomSheet, showDialog, showToast } from './ui/modals.js';

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const user = AuthService.getCurrentUser();
  PreferencesService.applyThemeToDocument();

  // Si no hay usuario autenticado, mostrar Portada (Login / Registro Ampliado)
  if (!user) {
    renderAuthScreen(app, {
      onAuthenticated: () => {
        PreferencesService.applyThemeToDocument();
        renderApp();
      },
    });
    return;
  }

  // Vista autenticada (pre-contenedor para el Plan #6)
  const fullName = AuthService.getFullName(user);
  const avatarInitial = fullName.charAt(0).toUpperCase();
  const prefs = PreferencesService.getPreferences();
  const water = DailyLogService.getTodayWater();
  const waterPct = Math.min(100, Math.round((water * 100) / prefs.waterGoal));
  const weight = DailyLogService.getLatestWeight();
  const blocks = BlockService.getAllBlocks();
  const allExercises = ExerciseCatalog.getAllExercises();
  const folderCfg = StorageEngine.getFolderConfig();

  app.innerHTML = `
    <!-- Header Superior (Logo ATLAS + Avatar de Perfil) -->
    <header class="app-header">
      <div class="app-header__brand">
        <span style="color:var(--primary-neon);display:flex;">${icon('ic_fitness_center', { size: 24 })}</span>
        <span>ATLAS</span>
      </div>
      <button
        type="button"
        id="btnProfileAvatar"
        class="avatar"
        style="width:40px;height:40px;font-size:16px;cursor:pointer;"
        title="Opciones de cuenta"
      >
        ${avatarInitial}
      </button>
    </header>

    <main class="app-main" style="display:flex;flex-direction:column;gap:18px;">
      <!-- Saludo y Resumen de Cuenta Autenticada -->
      <section class="card" style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="pill pill--orange">Plan #5 · Portada y Modales Activos</span>
          <span class="text-caption">${DateHelper.longToday()}</span>
        </div>
        <h1 class="text-screen" style="margin-top:4px;">Hola, ${user.name}</h1>
        <p class="text-body">
          ${fullName} · ${user.email}
          ${user.city || user.country ? `<br/>📍 ${[user.city, user.country].filter(Boolean).join(', ')}` : ''}
          · Género: ${user.gender} · Nac.: ${user.birthYear || '—'}
        </p>
      </section>

      <!-- Prueba de Modales y Carpeta Local -->
      <section class="card" style="display:flex;flex-direction:column;gap:12px;">
        <h2 class="text-section">Carpeta Local y Modales</h2>
        <p class="text-body">
          Carpeta configurada: <code>Documents/${folderCfg.folderName}</code><br/>
          Bloques: <b>${blocks.length}</b> · Ejercicios: <b>${allExercises.length}</b> · Sesiones: <b>${WorkoutService.getTotalWorkouts()}</b>
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button type="button" id="btnOpenFolderModal" class="btn btn-tonal" style="flex:1;">
            ${icon('ic_edit', { size: 16 })} Carpeta Local
          </button>
          <button type="button" id="btnOpenTestSheet" class="btn btn-outlined" style="flex:1;">
            Probar BottomSheet
          </button>
        </div>
      </section>

      <!-- Registro Rápido Diario (Agua y Peso) -->
      <section class="card" style="display:flex;flex-direction:column;gap:14px;">
        <h2 class="text-section">Registros Diarios Rápidos</h2>

        <div style="display:flex;align-items:center;gap:14px;">
          <div class="icon-tile" style="color:var(--accent-cyan);">${icon('ic_drop', { size: 22 })}</div>
          <div style="flex:1;">
            <p class="text-card-title">Agua de hoy</p>
            <p class="text-body">${water} / ${prefs.waterGoal} vasos</p>
          </div>
          <button id="btnWaterMinus" class="btn btn-round" style="color:var(--accent-cyan);">−</button>
          <button id="btnWaterPlus" class="btn btn-round" style="color:var(--accent-cyan);">+</button>
        </div>
        <div class="progress-linear">
          <div class="progress-linear__bar progress-linear__bar--cyan" style="width:${waterPct}%;"></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;">
          <button id="btnWeightMinus" class="btn btn-round">−</button>
          <div style="text-align:center;">
            <p class="text-weight-hero">${weight !== null ? `${weight.toFixed(1)} kg` : 'Sin registro'}</p>
            <p class="text-caption">Peso corporal (±0.5 kg)</p>
          </div>
          <button id="btnWeightPlus" class="btn btn-round">+</button>
        </div>
      </section>

      <!-- Cerrar Sesión para volver a probar la Portada -->
      <button type="button" id="btnLogout" class="btn btn-danger">
        ${icon('ic_close', { size: 18 })} Cerrar sesión
      </button>
    </main>

    <!-- Barra de Navegación Inferior (3 Pestañas definitivas) -->
    <nav class="bottom-nav" aria-label="Navegación principal">
      <button class="bottom-nav__item bottom-nav__item--active">
        <span class="bottom-nav__pill">${icon('ic_home', { size: 22 })}</span>
        <span>Inicio</span>
      </button>
      <button class="bottom-nav__item">
        <span class="bottom-nav__pill">${icon('ic_fitness_center', { size: 22 })}</span>
        <span>Rutinas</span>
      </button>
      <button class="bottom-nav__item">
        <span class="bottom-nav__pill">${icon('ic_bar_chart', { size: 22 })}</span>
        <span>Dashboard</span>
      </button>
    </nav>
  `;

  document.getElementById('btnOpenFolderModal')?.addEventListener('click', () => {
    openFolderSetupModal({
      dismissible: true,
      onConfigured: () => renderApp(),
    });
  });

  document.getElementById('btnOpenTestSheet')?.addEventListener('click', () => {
    showBottomSheet({
      contentHtml: `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <h3 class="text-screen" style="font-size:22px;">Vista Previa de BottomSheet</h3>
          <p class="text-body">Hoja deslizable con asa superior de 40×4px y fondo <code>#161B22</code>.</p>
          <button type="button" id="btnCloseSheetDemo" class="btn btn-primary" style="margin-top:8px;">
            Cerrar hoja
          </button>
        </div>
      `,
      onMount: (sheet, close) => {
        sheet.querySelector('#btnCloseSheetDemo')?.addEventListener('click', close);
      },
    });
  });

  document.getElementById('btnWaterMinus')?.addEventListener('click', () => {
    DailyLogService.decrementWater();
    renderApp();
  });

  document.getElementById('btnWaterPlus')?.addEventListener('click', () => {
    DailyLogService.incrementWater();
    renderApp();
  });

  document.getElementById('btnWeightMinus')?.addEventListener('click', () => {
    DailyLogService.adjustWeightStep(-0.5);
    renderApp();
  });

  document.getElementById('btnWeightPlus')?.addEventListener('click', () => {
    DailyLogService.adjustWeightStep(0.5);
    renderApp();
  });

  const confirmLogout = () => {
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
          renderApp();
        });
      },
    });
  };

  document.getElementById('btnLogout')?.addEventListener('click', confirmLogout);
  document.getElementById('btnProfileAvatar')?.addEventListener('click', confirmLogout);
}

initAtlasDataLayer().then(() => {
  renderApp();
  checkAndShowFolderSetupIfNeeded(() => {
    renderApp();
  });
});
