/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const __dirname = import.meta.dirname;

export default defineConfig({
    build: {
        assetsDir: '.',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
            },
        },
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
    },
    plugins: [react()],
    publicDir: resolve(__dirname, 'public'),
    root: resolve(__dirname, 'src'),
    test: {
        browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }],
            provider: playwright(),
        },
        clearMocks: true,
        coverage: {
            enabled: true,
            include: ['src/**/*.tsx'],
            exclude: ['main.tsx'],
            provider: 'v8',
            reportOnFailure: true,
            reporter: ['text-summary', ['html', { subdir: 'coverage' }]],
            reportsDirectory: 'reports',
        },
        globals: true,
        include: ['src/**/*.spec.tsx'],
        name: 'diabeticum-pedis',
        open: false,
        reporters: ['dot', ['html', { outputFile: 'reports/index.html' }]],
        root: __dirname,
        ui: true,
        sequence: {
            shuffle: true,
        },
    },
});
