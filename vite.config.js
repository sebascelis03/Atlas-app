import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas: necesario para que los assets carguen dentro del WebView de Capacitor.
  base: './',
  server: {
    // Permite abrir la app desde el celular en la misma red local.
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
