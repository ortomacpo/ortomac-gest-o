import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
    'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
    'process.env.ID_DO_PROJETO_FIREBASE': JSON.stringify(process.env.ID_DO_PROJETO_FIREBASE),
    'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
    'process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE': JSON.stringify(process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE),
    'process.env.ID_DO_APLICATIVO_FIREBASE': JSON.stringify(process.env.ID_DO_APLICATIVO_FIREBASE),
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});