import './styles/atlas.css';
import { ICONS, icon } from './ui/icons.js';

const COLOR_TOKENS = [
  { name: 'bg_dark', hex: '#0E1117' },
  { name: 'surface_dark', hex: '#161B22' },
  { name: 'surface_card', hex: '#212631' },
  { name: 'surface_input', hex: '#1A1F29' },
  { name: 'accent_orange', hex: '#FF9100' },
  { name: 'primary_neon', hex: '#00E676' },
  { name: 'accent_cyan', hex: '#00E5FF' },
  { name: 'accent_red', hex: '#FF5252' },
  { name: 'group_espalda', hex: '#4FC3F7' },
  { name: 'group_pierna', hex: '#B388FF' },
  { name: 'group_core', hex: '#FFD740' },
];

function renderStyleGuide() {
  const app = document.getElementById('app');
  if (!app) return;

  const swatchesHtml = COLOR_TOKENS.map(
    (c) => `
      <div class="tile" style="display:flex;align-items:center;gap:10px;padding:10px 12px;">
        <span style="width:24px;height:24px;border-radius:6px;background:${c.hex};border:1px solid var(--surface-card-stroke);flex-shrink:0;"></span>
        <div style="overflow:hidden;">
          <div class="text-caption" style="color:var(--text-primary);font-weight:700;">${c.name}</div>
          <div class="text-caption">${c.hex}</div>
        </div>
      </div>
    `
  ).join('');

  const iconsHtml = Object.keys(ICONS)
    .map(
      (key) => `
      <div class="tile" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;">
        <span style="color:var(--accent-orange);display:flex;">${icon(key, { size: 22 })}</span>
        <span class="text-caption" style="font-size:10px;text-align:center;word-break:break-all;">${key}</span>
      </div>
    `
    )
    .join('');

  app.innerHTML = `
    <!-- Header Superior (Logo ATLAS + Avatar de Perfil) -->
    <header class="app-header">
      <div class="app-header__brand">
        <span style="color:var(--primary-neon);display:flex;">${icon('ic_fitness_center', { size: 24 })}</span>
        <span>ATLAS</span>
      </div>
      <div class="avatar" style="width:40px;height:40px;font-size:16px;" title="Menú de Perfil">A</div>
    </header>

    <main class="app-main" style="display:flex;flex-direction:column;gap:20px;">
      <!-- Banner de Verificación -->
      <section class="card" style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="pill pill--orange">Plan #3 · Base JS Activa</span>
          <span class="text-caption">Vite + Capacitor</span>
        </div>
        <h1 class="text-screen" style="margin-top:4px;">Sistema de Diseño ATLAS</h1>
        <p class="text-body">
          Guía visual interactiva para verificar paleta, tipografía, tarjetas, botones, inputs y los 21 íconos SVG antes de construir la capa de datos.
        </p>
      </section>

      <!-- 1. Paleta de Colores -->
      <section style="display:flex;flex-direction:column;gap:10px;">
        <h2 class="text-section">1. Paleta Oficial (Tokens)</h2>
        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;">
          ${swatchesHtml}
        </div>
      </section>

      <!-- 2. Escala Tipográfica -->
      <section class="card" style="display:flex;flex-direction:column;gap:8px;">
        <h2 class="text-section">2. Escala Tipográfica</h2>
        <p class="text-brand-hero" style="font-size:28px;">ATLAS (Hero)</p>
        <p class="text-weight-hero">74.8 kg (Weight 34px)</p>
        <p class="text-screen">Hola, Atleta (Screen 26px)</p>
        <p class="text-value">5 días · 84.0 cm (Value 20px)</p>
        <p class="text-section">Meta semanal (Section 17px)</p>
        <p class="text-card-title">Agua de hoy (CardTitle 15px)</p>
        <p class="text-body">Pecho, Hombro y Tríceps (Body 14px)</p>
        <p class="text-caption">5 ejercicios • 50 min (Caption 12px)</p>
      </section>

      <!-- 3. Botones y Controles -->
      <section class="card" style="display:flex;flex-direction:column;gap:12px;">
        <h2 class="text-section">3. Botones y Chips</h2>
        <button class="btn btn-primary">${icon('ic_play', { size: 18 })} Comenzar entrenamiento</button>
        <button class="btn btn-neon">INICIAR SESIÓN / FINALIZAR</button>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outlined" style="flex:1;">${icon('ic_edit', { size: 16 })} Editar</button>
          <button class="btn btn-tonal">${icon('ic_add', { size: 18 })} Nueva Rutina</button>
        </div>
        <button class="btn btn-danger">${icon('ic_close', { size: 18 })} Cerrar sesión</button>

        <div class="chip-row" style="margin-top:4px;">
          <button class="chip chip--active">Todos</button>
          <button class="chip">Pecho</button>
          <button class="chip">Espalda</button>
          <button class="chip">Pierna</button>
        </div>
      </section>

      <!-- 4. Tarjeta de Rutina y Tiles -->
      <section style="display:flex;flex-direction:column;gap:10px;">
        <h2 class="text-section">4. Tarjetas, Tiles e Hidratación</h2>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
          <div class="tile">
            <span style="color:var(--accent-orange);display:flex;">${icon('ic_flame', { size: 20 })}</span>
            <p class="text-value" style="margin-top:10px;">5 días</p>
            <p class="text-caption">Racha</p>
          </div>
          <div class="tile">
            <span style="color:var(--group-core);display:flex;">${icon('ic_bolt', { size: 20 })}</span>
            <p class="text-value" style="margin-top:10px;">4.8 t</p>
            <p class="text-caption">Volumen</p>
          </div>
          <div class="tile">
            <span style="color:var(--primary-neon);display:flex;">${icon('ic_trophy', { size: 20 })}</span>
            <p class="text-value" style="margin-top:10px;">18</p>
            <p class="text-caption">Sesiones</p>
          </div>
        </div>

        <div class="card-routine">
          <div class="card-routine__accent" style="background:var(--group-pecho);"></div>
          <div class="card-routine__body">
            <div>
              <h3 class="text-section">Bloque Empuje (Push)</h3>
              <p class="text-body" style="margin-top:2px;">Pecho, Hombro y Tríceps</p>
              <p class="text-caption" style="margin-top:6px;">Press de Banca Plano • Press Militar…</p>
              <span class="pill" style="margin-top:10px;">5 ejercicios • 50 min</span>
            </div>
            <button class="btn btn-play" aria-label="Iniciar rutina">${icon('ic_play', { size: 20 })}</button>
          </div>
        </div>

        <div class="card" style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-tile" style="color:var(--accent-cyan);">${icon('ic_drop', { size: 22 })}</div>
            <div style="flex:1;">
              <p class="text-card-title">Agua de hoy</p>
              <p class="text-body">5 / 8 vasos</p>
            </div>
            <button class="btn btn-round" style="color:var(--accent-cyan);">−</button>
            <button class="btn btn-round" style="color:var(--accent-cyan);">+</button>
          </div>
          <div class="progress-linear">
            <div class="progress-linear__bar progress-linear__bar--cyan" style="width:62.5%;"></div>
          </div>
        </div>
      </section>

      <!-- 5. Inputs y Fila de Serie -->
      <section class="card" style="display:flex;flex-direction:column;gap:14px;">
        <h2 class="text-section">5. Formularios y Series en Vivo</h2>
        <div class="field">
          <label class="field__label">Correo electrónico</label>
          <div class="field__box">
            <input class="field__input" type="email" placeholder="admin@atlas.com" value="admin@atlas.com" />
          </div>
        </div>
        <div class="field field--error">
          <label class="field__label">Peso meta (kg)</label>
          <div class="field__box">
            <input class="field__input" type="text" value="15" />
            <span class="field__suffix">kg</span>
          </div>
          <span class="field__error">Ingresa un peso entre 30 y 300 kg</span>
        </div>

        <div style="display:flex;align-items:center;gap:8px;padding-top:4px;">
          <span style="width:36px;text-align:center;font-weight:700;color:var(--text-secondary);">1</span>
          <span style="flex:1.2;text-align:center;font-size:12px;color:var(--text-muted);">80 kg × 8</span>
          <input class="input-compact" style="flex:1;" type="text" value="82.5" aria-label="KG" />
          <input class="input-compact" style="flex:1;" type="text" value="8" aria-label="REPS" />
          <button class="set-check-btn set-check-btn--done" aria-label="Serie completada">${icon('ic_check', { size: 20 })}</button>
        </div>
      </section>

      <!-- 6. Catálogo de 21 Íconos SVG -->
      <section style="display:flex;flex-direction:column;gap:10px;">
        <h2 class="text-section">6. Catálogo de 21 Íconos SVG</h2>
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;">
          ${iconsHtml}
        </div>
      </section>
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
}

renderStyleGuide();
