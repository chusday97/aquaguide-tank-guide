import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execFileSync } from 'node:child_process';
import {defineConfig, loadEnv} from 'vite';

const readGitValue = (args: string[], fallback: string) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim() || fallback;
  } catch {
    return fallback;
  }
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const apiPort = process.env.API_PORT || env.API_PORT || '8787';
  const previewMetadata = {
    branch: env.VITE_PREVIEW_BRANCH || readGitValue(['branch', '--show-current'], 'unknown-branch'),
    sha: env.VITE_GIT_SHA || readGitValue(['rev-parse', 'HEAD'], 'unknown-sha'),
    seed: env.VITE_PREVIEW_SEED || 'interactive-preview',
    builtAt: env.VITE_BUILD_TIME || new Date().toISOString(),
  };
  return {
    define: {
      __AQUAGUIDE_PREVIEW_METADATA__: JSON.stringify(previewMetadata),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
