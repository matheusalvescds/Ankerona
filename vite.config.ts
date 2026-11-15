import { defineConfig } from 'vite';

// base './' faz a build funcionar em qualquer subpasta (XAMPP em /ankerona/dist/, Vercel, GitHub Pages).
// base './' makes the build work from any subfolder (XAMPP at /ankerona/dist/, Vercel, GitHub Pages).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // O Phaser sozinho passa de 1 MB; o aviso padrão de 500 kB não ajuda aqui.
    // Phaser alone is over 1 MB; the default 500 kB warning is not useful here.
    chunkSizeWarningLimit: 2000,
  },
  server: { port: 5173, open: true },
});
