/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    plugins: [react()],
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
        root: import.meta.dirname,
        ui: true,
        sequence: {
            shuffle: true,
        },
    },
})
