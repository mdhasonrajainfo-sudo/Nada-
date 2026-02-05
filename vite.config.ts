import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Fix: Cast process to any to access cwd() and avoid TS error "Property 'cwd' does not exist on type 'Process'"
    const cwd = (process as any).cwd();
    const env = loadEnv(mode, cwd, '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Fix: Replace __dirname with cwd as __dirname is not defined in ESM or missing types
          '@': path.resolve(cwd, './'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true
      }
    };
});