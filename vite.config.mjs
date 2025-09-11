import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    base: process.env.VITE_BASE && `/${process.env.VITE_BASE}/`,
  };
});