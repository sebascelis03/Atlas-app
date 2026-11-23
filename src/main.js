import './styles/atlas.css';
import { renderAppShell } from './screens/AppShell.js';
import { renderAuthScreen } from './screens/AuthScreen.js';
import { checkAndShowFolderSetupIfNeeded } from './screens/FolderSetupModal.js';
import {
  AuthService,
  initAtlasDataLayer,
  PreferencesService,
} from './services/index.js';

function renderRoot() {
  const app = document.getElementById('app');
  if (!app) return;

  const user = AuthService.getCurrentUser();
  PreferencesService.applyThemeToDocument();

  if (!user) {
    renderAuthScreen(app, {
      onAuthenticated: () => {
        PreferencesService.applyThemeToDocument();
        renderRoot();
      },
    });
    return;
  }

  renderAppShell(app, {
    onLoggedOut: () => {
      PreferencesService.applyThemeToDocument();
      renderRoot();
    },
  });
}

initAtlasDataLayer().then(() => {
  renderRoot();
  checkAndShowFolderSetupIfNeeded(() => {
    renderRoot();
  });
});
