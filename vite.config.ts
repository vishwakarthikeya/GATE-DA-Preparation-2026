import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const configuredBase = process.env.VITE_BASE_PATH;
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = configuredBase || (process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/');

export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    manifest: {
      name: 'GATE DA Preparation', short_name: 'GATE DA', description: 'A private GATE 2027 Data Science and Artificial Intelligence study workspace.',
      theme_color: '#103e5b', background_color: '#f4f8f9', display: 'standalone', start_url: '.', scope: '.',
      icons: [
        { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: {
      navigateFallback: 'index.html',
      globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
      navigateFallbackDenylist: [/^\/.*\/offline\.html$/],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: false
    }
  })]
});
