import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas: necesario para que los assets carguen dentro del WebView de Capacitor.
  base: './',
  server: {
    // Permite abrir la app desde el celular en la misma red local y evita colisiones con cachés viejas.
    host: true,
    port: 5174,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
