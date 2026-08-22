import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { bundleAuditPlugin } from './scripts/vite-bundle-audit-plugin.mjs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const auditBundle = process.env.BUNDLE_AUDIT === '1';
  return {
    plugins: [react(), tailwindcss(), ...(auditBundle ? [bundleAuditPlugin()] : [])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://localhost:${env.API_PORT || '8787'}`,
          changeOrigin: true,
        },
      },
    },
  };
});
