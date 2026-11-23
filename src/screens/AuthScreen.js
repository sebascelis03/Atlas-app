/**
 * Portada de Autenticación Local de ATLAS (100 % Anaranjada + Pizarra Limpia):
 * 1. Inicio de Sesión (sin usuarios demo ni botones de autocompletado ficticio).
 * 2. Registro Ampliado:
 *    - Nombre (obligatorio)
 *    - Apellido (opcional)
 *    - Correo electrónico (obligatorio)
 *    - Contraseña (obligatoria, mín. 6 caracteres)
 *    - Ciudad y País (opcionales por privacidad)
 *    - Género (Lista desplegable <select> con las 40 opciones oficiales en orden)
 *    - Año de nacimiento (sin valor pre-rellenado)
 *    - Aceptación de Términos y Condiciones
 */

import { AuthService } from '../services/index.js';
import { icon } from '../ui/icons.js';
import { showDialog, showToast } from '../ui/modals.js';

let currentMode = 'login'; // 'login' | 'register'

/**
 * Abre un diálogo con los Términos y Condiciones y la Política de Privacidad 100 % local.
 */
function openTermsDialog() {
  showDialog({
    contentHtml: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <h3 class="text-section" style="font-size:19px;">Términos y Privacidad Local</h3>
        <div class="text-body" style="display:flex;flex-direction:column;gap:8px;max-height:50dvh;overflow-y:auto;line-height:1.45;">
          <p><b>1. Almacenamiento 100 % Local:</b> ATLAS guarda tus credenciales, bloques, sesiones y métricas únicamente en el almacenamiento local de tu dispositivo. Ningún dato personal se envía a servidores externos.</p>
          <p><b>2. Privacidad de Ubicación:</b> Los campos de Ciudad y País son completamente opcionales y solo se utilizan para personalizar tu perfil local.</p>
          <p><b>3. Uso Responsable:</b> Los cálculos de volumen, peso y tiempos de descanso son herramientas de apoyo deportivo. Entrena siempre respetando tu técnica y límites físicos.</p>
        </div>
        <button id="btnCloseTerms" type="button" class="btn btn-primary" style="margin-top:6px;">
          Entendido
        </button>
      </div>
    `,
    onMount: (box, close) => {
      box.querySelector('#btnCloseTerms')?.addEventListener('click', close);
    },
  });
}

/**
 * Renderiza la pantalla de Inicio de Sesión o Registro Ampliado dentro del contenedor.
 * @param {HTMLElement} container
 * @param {{ onAuthenticated: (user: object) => void }} callbacks
 */
export function renderAuthScreen(container, { onAuthenticated }) {
  if (currentMode === 'register') {
    renderRegisterView(container, { onAuthenticated });
  } else {
    renderLoginView(container, { onAuthenticated });
  }
}

function renderLoginView(container, { onAuthenticated }) {
  container.innerHTML = `
    <div class="auth-screen">
      <!-- Logo en Naranja -->
      <div class="auth-logo" aria-label="Logo de ATLAS">
        ${icon('ic_fitness_center', { size: 72 })}
      </div>

      <!-- Título y Eslogan -->
      <h1 class="text-brand-hero" style="margin-top:12px;">ATLAS</h1>
      <p class="auth-slogan">ENTRENA SIN LÍMITES</p>

      <!-- Tarjeta del Formulario -->
      <form id="loginForm" class="auth-card" novalidate>
        <h2 class="text-value">Iniciar sesión</h2>
        <p class="text-body" style="font-size:13px;margin-top:2px;">
          Ingresa tus datos para continuar
        </p>

        <!-- Correo -->
        <div class="field" id="fieldLoginEmail" style="margin-top:22px;">
          <label class="field__label" for="etLoginEmail">Correo electrónico</label>
          <div class="field__box">
            <input
              id="etLoginEmail"
              class="field__input"
              type="email"
              placeholder="nombre@correo.com"
              autocomplete="email"
            />
          </div>
          <span class="field__error" id="errLoginEmail" style="display:none;"></span>
        </div>

        <!-- Contraseña -->
        <div class="field" id="fieldLoginPassword" style="margin-top:14px;">
          <label class="field__label" for="etLoginPassword">Contraseña</label>
          <div class="field__box">
            <input
              id="etLoginPassword"
              class="field__input"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button type="button" id="btnToggleLoginPass" class="field__toggle-btn">
              Ver
            </button>
          </div>
          <span class="field__error" id="errLoginPassword" style="display:none;"></span>
        </div>

        <button
          type="button"
          id="btnForgotPassword"
          style="align-self:flex-end;margin-top:10px;background:none;border:none;color:var(--text-secondary);font-size:12px;cursor:pointer;padding:4px;"
        >
          ¿Olvidaste tu contraseña?
        </button>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%;min-height:54px;margin-top:16px;"
        >
          INICIAR SESIÓN
        </button>
      </form>

      <!-- Enlace a Registro -->
      <button type="button" id="btnGoToRegister" class="auth-link" style="margin-top:24px;">
        ¿No tienes cuenta? <span class="auth-link__orange">Regístrate</span>
      </button>
    </div>
  `;

  const emailInput = container.querySelector('#etLoginEmail');
  const passInput = container.querySelector('#etLoginPassword');
  const fieldEmail = container.querySelector('#fieldLoginEmail');
  const fieldPass = container.querySelector('#fieldLoginPassword');
  const errEmail = container.querySelector('#errLoginEmail');
  const errPass = container.querySelector('#errLoginPassword');

  function clearError(fieldEl, errEl) {
    fieldEl?.classList.remove('field--error');
    if (errEl) {
      errEl.textContent = '';
      errEl.style.display = 'none';
    }
  }

  function setError(fieldEl, errEl, msg) {
    fieldEl?.classList.add('field--error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  }

  emailInput?.addEventListener('input', () => clearError(fieldEmail, errEmail));
  passInput?.addEventListener('input', () => clearError(fieldPass, errPass));

  container.querySelector('#btnToggleLoginPass')?.addEventListener('click', (e) => {
    if (!passInput) return;
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    e.currentTarget.textContent = isPass ? 'Ocultar' : 'Ver';
  });

  container.querySelector('#btnForgotPassword')?.addEventListener('click', () => {
    showToast('Tus cuentas se guardan localmente en este dispositivo');
  });

  container.querySelector('#btnGoToRegister')?.addEventListener('click', () => {
    currentMode = 'register';
    renderAuthScreen(container, { onAuthenticated });
  });

  container.querySelector('#loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput?.value?.trim() || '';
    const password = passInput?.value || '';

    let valid = true;
    if (!email) {
      setError(fieldEmail, errEmail, 'Ingresa tu correo electrónico');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(fieldEmail, errEmail, 'El formato del correo no es válido');
      valid = false;
    }

    if (!password) {
      setError(fieldPass, errPass, 'Ingresa tu contraseña');
      valid = false;
    }

    if (!valid) return;

    const res = AuthService.login(email, password);
    if (!res.ok) {
      setError(fieldPass, errPass, res.error || 'Correo o contraseña incorrectos');
      showToast(res.error || 'Correo o contraseña incorrectos', { type: 'error' });
      return;
    }

    showToast(`Bienvenido de nuevo, ${res.user.name}`, { type: 'success' });
    onAuthenticated(res.user);
  });
}

function renderRegisterView(container, { onAuthenticated }) {
  const genderOptionsHtml = AuthService.GENDER_OPTIONS.map(
    (g) => `<option value="${g}">${g}</option>`
  ).join('');

  container.innerHTML = `
    <div class="auth-screen auth-screen--register">
      <!-- Botón Volver -->
      <div>
        <button type="button" id="btnBackToLogin" class="auth-back-btn" aria-label="Volver">
          ${icon('ic_arrow_back', { size: 24 })}
        </button>
      </div>

      <!-- Encabezado -->
      <h1 class="text-screen" style="font-size:28px;margin-top:18px;">Crea tu cuenta</h1>
      <p class="text-body" style="margin-top:6px;">
        Empieza a registrar tu progreso hoy.
      </p>

      <form id="registerForm" style="display:flex;flex-direction:column;gap:14px;margin-top:24px;" novalidate>
        <!-- Nombre (obligatorio) y Apellido (opcional) -->
        <div class="grid-2col">
          <div class="field" id="fieldRegName">
            <label class="field__label" for="etRegName">Nombre *</label>
            <div class="field__box">
              <input id="etRegName" class="field__input" type="text" placeholder="Tu nombre" />
            </div>
            <span class="field__error" id="errRegName" style="display:none;"></span>
          </div>

          <div class="field" id="fieldRegLastName">
            <label class="field__label" for="etRegLastName">Apellido (Opcional)</label>
            <div class="field__box">
              <input id="etRegLastName" class="field__input" type="text" placeholder="Tu apellido" />
            </div>
          </div>
        </div>

        <!-- Correo electrónico -->
        <div class="field" id="fieldRegEmail">
          <label class="field__label" for="etRegEmail">Correo electrónico *</label>
          <div class="field__box">
            <input id="etRegEmail" class="field__input" type="email" placeholder="nombre@correo.com" />
          </div>
          <span class="field__error" id="errRegEmail" style="display:none;"></span>
        </div>

        <!-- Contraseña -->
        <div class="field" id="fieldRegPassword">
          <label class="field__label" for="etRegPassword">Contraseña (mín. 6 caracteres) *</label>
          <div class="field__box">
            <input id="etRegPassword" class="field__input" type="password" placeholder="••••••••" />
            <button type="button" id="btnToggleRegPass" class="field__toggle-btn">Ver</button>
          </div>
          <span class="field__error" id="errRegPassword" style="display:none;"></span>
        </div>

        <!-- Ciudad y País (Opcionales por privacidad) -->
        <div class="grid-2col">
          <div class="field">
            <label class="field__label" for="etRegCity">Ciudad (Opcional)</label>
            <div class="field__box">
              <input id="etRegCity" class="field__input" type="text" placeholder="Opcional" />
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="etRegCountry">País (Opcional)</label>
            <div class="field__box">
              <input id="etRegCountry" class="field__input" type="text" placeholder="Opcional" />
            </div>
          </div>
        </div>

        <!-- Género (Lista desplegable con las 40 opciones en orden) -->
        <div class="field">
          <label class="field__label" for="selRegGender">Género</label>
          <div class="field__box">
            <select id="selRegGender" class="field__select">
              ${genderOptionsHtml}
            </select>
          </div>
        </div>

        <!-- Año de nacimiento (sin valor pre-rellenado) -->
        <div class="field" id="fieldRegBirthYear">
          <label class="field__label" for="etRegBirthYear">Año de nacimiento *</label>
          <div class="field__box">
            <input
              id="etRegBirthYear"
              class="field__input"
              type="number"
              min="1920"
              max="2016"
              placeholder="Ej. 2000"
            />
          </div>
          <span class="field__error" id="errRegBirthYear" style="display:none;"></span>
        </div>

        <!-- Términos y Condiciones -->
        <div>
          <label class="terms-row" for="chkRegTerms">
            <input id="chkRegTerms" class="terms-row__checkbox" type="checkbox" />
            <span class="terms-row__text">
              He leído y acepto los
              <button type="button" id="btnOpenTerms" class="terms-row__link">
                Términos y Condiciones y la Política de Privacidad
              </button>.
            </span>
          </label>
          <span class="field__error" id="errRegTerms" style="display:none;margin-top:4px;"></span>
        </div>

        <!-- Botón Crear Cuenta -->
        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%;min-height:54px;margin-top:8px;font-size:16px;"
        >
          Crear cuenta
        </button>
      </form>

      <!-- Enlace a Login -->
      <button type="button" id="btnGoToLogin" class="auth-link" style="margin-top:20px;align-self:center;">
        ¿Ya tienes cuenta? <span class="auth-link__orange">Inicia sesión</span>
      </button>
    </div>
  `;

  const nameInput = container.querySelector('#etRegName');
  const lastNameInput = container.querySelector('#etRegLastName');
  const emailInput = container.querySelector('#etRegEmail');
  const passInput = container.querySelector('#etRegPassword');
  const cityInput = container.querySelector('#etRegCity');
  const countryInput = container.querySelector('#etRegCountry');
  const genderSelect = container.querySelector('#selRegGender');
  const birthYearInput = container.querySelector('#etRegBirthYear');
  const termsCheckbox = container.querySelector('#chkRegTerms');

  const fieldMap = {
    name: {
      field: container.querySelector('#fieldRegName'),
      err: container.querySelector('#errRegName'),
    },
    email: {
      field: container.querySelector('#fieldRegEmail'),
      err: container.querySelector('#errRegEmail'),
    },
    password: {
      field: container.querySelector('#fieldRegPassword'),
      err: container.querySelector('#errRegPassword'),
    },
    birthYear: {
      field: container.querySelector('#fieldRegBirthYear'),
      err: container.querySelector('#errRegBirthYear'),
    },
    acceptedTerms: {
      field: null,
      err: container.querySelector('#errRegTerms'),
    },
  };

  function clearFieldError(key) {
    const item = fieldMap[key];
    if (!item) return;
    item.field?.classList.remove('field--error');
    if (item.err) {
      item.err.textContent = '';
      item.err.style.display = 'none';
    }
  }

  function showFieldError(key, msg) {
    const item = fieldMap[key];
    if (!item) return;
    item.field?.classList.add('field--error');
    if (item.err) {
      item.err.textContent = msg;
      item.err.style.display = 'block';
    }
  }

  nameInput?.addEventListener('input', () => clearFieldError('name'));
  emailInput?.addEventListener('input', () => clearFieldError('email'));
  passInput?.addEventListener('input', () => clearFieldError('password'));
  birthYearInput?.addEventListener('input', () => clearFieldError('birthYear'));
  termsCheckbox?.addEventListener('change', () => clearFieldError('acceptedTerms'));

  container.querySelector('#btnToggleRegPass')?.addEventListener('click', (e) => {
    if (!passInput) return;
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    e.currentTarget.textContent = isPass ? 'Ocultar' : 'Ver';
  });

  container.querySelector('#btnOpenTerms')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openTermsDialog();
  });

  const goBackToLogin = () => {
    currentMode = 'login';
    renderAuthScreen(container, { onAuthenticated });
  };

  container.querySelector('#btnBackToLogin')?.addEventListener('click', goBackToLogin);
  container.querySelector('#btnGoToLogin')?.addEventListener('click', goBackToLogin);

  container.querySelector('#registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    Object.keys(fieldMap).forEach(clearFieldError);

    const res = AuthService.register({
      name: nameInput?.value || '',
      lastName: lastNameInput?.value || '',
      email: emailInput?.value || '',
      password: passInput?.value || '',
      city: cityInput?.value || '',
      country: countryInput?.value || '',
      gender: genderSelect?.value || AuthService.GENDER_OPTIONS[0],
      birthYear: birthYearInput?.value || '',
      acceptedTerms: Boolean(termsCheckbox?.checked),
    });

    if (!res.ok) {
      if (res.fieldErrors) {
        for (const [k, msg] of Object.entries(res.fieldErrors)) {
          showFieldError(k, msg);
        }
      }
      showToast(res.error || 'Revisa los campos marcados', { type: 'error' });
      return;
    }

    currentMode = 'login';
    showToast('¡Cuenta creada con éxito! Bienvenido', { type: 'success' });
    onAuthenticated(res.user);
  });
}
