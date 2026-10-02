import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = ['index.html', 'club.html', 'programas.html', 'horarios.html', 'costos.html', 'politicas.html'];

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace('.html', ''), resolve(root, page)])),
    },
  },
});
