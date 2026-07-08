import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
  ],
  ssr: {
    noExternal: [/remixicon-svelte/],
  },
  optimizeDeps: {
    include: [
      'wavesurfer.js',
      'mode-watcher',
    ],
  },
  server: {
    warmup: {
      ssrFiles: [
        './src/routes/**/+page.svelte',
        './src/routes/**/+layout.svelte',
        './src/lib/components/**/*.svelte',
      ],
    },
  },
});