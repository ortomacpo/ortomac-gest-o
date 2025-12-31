import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Isso garante que o código consiga ler process.env.CHAVE_TAL
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  }
});