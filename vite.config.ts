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
      'bits-ui',
      'layerchart',
      'embla-carousel-svelte',
      'wavesurfer.js',
      'vaul-svelte',
      'paneforge',
      'formsnap',
      'svelte-sonner',
      'mode-watcher',
      '@lucide/svelte',
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