import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reports: ['text', 'html'],
      exclude: [
        '**/node_modules/**',
        'postcss.config.js',
        'tailwind.config.js',
        'scripts/generate-test-report.js',
        'src/lib/types.ts'
      ]
    }
  }
});
