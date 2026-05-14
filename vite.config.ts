import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set VITE_BASE to your GitHub Pages repo name, e.g. "/playvista/"
// Leave empty or "/" for a user/org site (username.github.io).
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/playvista/' : '/',
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
  },
}));
