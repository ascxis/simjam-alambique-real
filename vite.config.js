import { defineConfig } from 'vite';

export default defineConfig({
  // OBLIGATORIO: rutas relativas para despliegue en subcarpetas del servidor
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      // Excluye Phaser del bundle para usar la versión global cargada por CDN
      external: ['phaser'],
      output: {
        globals: {
          phaser: 'Phaser'
        }
      }
    }
  }
});
