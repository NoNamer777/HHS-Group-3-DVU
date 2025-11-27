# React App

This directory contains the React.js frontend for the project.

For information about required tools (Node.js version, package manager, system dependencies, etc.), see the [README](../README.md) in the root of the repository.

---

## Getting Started (Development)

Follow these steps to run the app locally.

### 1. Install dependencies

Make sure you are in this app’s directory, then run:

```bash
npm install
```

This will install all dependencies listed in this app's `package.json`.

### 2. Start the development server

To start the app in development mode:

```bash
npm start
```

This will typically:

- Start the development server.
- You can find the app in your browser, usually at `http://localhost:5173`.

The server will automatically reload when you make changes to the source files.

---

## Project Structure (High-Level)

- `src/` – React components, hooks, and other frontend logic
- `public/` – Static assets (HTML template, icons, etc.)
- `package.json` – App-specific dependencies and npm scripts

---

## Testing

This project uses [Vitest](https://vitest.dev) for unit/integration tests and [Playwright](https://playwright.dev) for browser-based testing.

### Browser setup

Before running tests, install the browsers used by Playwright:

```bash
npx playwright install chromium
```

### Test commands

```bash
npm run test  # Same as `npm test`, runs all tests once
npm run test:dev  # Run all tests in watch mode
```

---

## Additional Commands

Other scripts that are available are:

```bash
npm run build # Build the app for production
npm run lint  # Run linters (if configured)
```