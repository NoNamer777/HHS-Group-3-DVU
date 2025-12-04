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
- Serve the app in your browser, usually at `http://localhost:5173`.

The server will automatically reload when you make changes to the source files.

---

## Running with Docker

You can run the production build of this React app using Docker and Nginx. The Docker image is built from the `.docker/Dockerfile` in this project and serves the compiled app through Nginx on port `3000` by default.

At a high level, the flow is:

1. The app is built using Node inside a Docker build stage.
2. The compiled output is copied into a lightweight Nginx image.
3. Nginx serves the static files and handles client-side routing for the React app.

A convenience script is available in `package.json`:

```bash
npm run docker:build
```

This command builds a local image for the app. After building, you can run it with Docker and access it via `http://localhost:3000`.

For detailed instructions (including example `docker run` commands, environment configuration, and how the Nginx setup works), see [.docker/README.md](./.docker/README.md).

---

## Project Structure (High-Level)

- `src/` – React components, hooks, and other frontend logic
- `public/` – Static assets (HTML template, icons, etc.)
- `package.json` – App-specific dependencies and npm scripts

---

## Formatting & Linting

This project uses:

- [Prettier](https://prettier.io/) for code formatting.
- [ESLint](https://eslint.org/) for linting.

### NPM scripts

```bash
npm run format:check  # Check formatting with Prettier (no changes made)
npm run format:write  # Format files with Prettier (applies fixes)
npm run lint          # Run ESLint checks
```

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
npm run test      # Same as `npm test`, runs all tests once
npm run test:dev  # Run all tests in watch mode
```

---

## Additional Commands

Other scripts that are available are:

```bash
npm run build                 # Build the app for production
npm run docker:build          # Build a Docker image for the production app
npm run docker-compose:build  # Build a Docker image for the production app using Docker Compose
npm run docker-compose:up     # Run the production app using Docker Compose
npm run docker-compose:down   # Stop and remove the Docker containers using Docker Compose
```

---

## Editor Integration

### VS Code

#### Recommended extensions

Install the following extensions:

- **ESLint** – `dbaeumer.vscode-eslint`
- **Prettier - Code formatter** – `esbenp.prettier-vscode`

You can save these recommendations in a `.vscode/extensions.json` file:

```jsonc
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

#### Suggested settings

In `.vscode/settings.json` (project-level) or your global VS Code settings:

```jsonc
{
  // Use Prettier as the default formatter
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Format on save
  "editor.formatOnSave": true,

  // Optional: organize imports on save
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit",
    "source.fixAll.eslint": "explicit"
  },

  // Ensure ESLint runs for JS/TS/React files
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

If you prefer ESLint to drive formatting (with `eslint-plugin-prettier`/`prettier-eslint`), you can rely on `source.fixAll.eslint` instead of `editor.defaultFormatter`.

---

### JetBrains IDEs (WebStorm, IntelliJ, etc.)

#### Enable ESLint

1. Open **Settings / Preferences** → **Languages & Frameworks** → **JavaScript** → **Code Quality Tools** → **ESLint**.
2. Select **"Automatic ESLint configuration"** or point to your local `node_modules/eslint`.
3. Enable **"Run eslint --fix on save"** (or **Run for files** on save, depending on the IDE version).

#### Enable Prettier

1. Open **Settings / Preferences** → **Languages & Frameworks** → **JavaScript** → **Prettier**.
2. Set **Prettier package** to `node_modules/prettier`.
3. Check **"On 'Reformat Code' action"** and/or **"On save"**.
4. Set the **"Run for files"** pattern: `**/*`

#### Optional: File watchers

If you want the IDE to delegate to your NPM scripts instead of calling Prettier directly:

- Configure a **File Watcher** to run `npm run format:write` on changes, or
- Use **Run Configuration** / **Before Launch** to run `npm run lint` or `npm run format:check` as part of your workflow.

---

## Suggested Workflow

- During development:
    - Rely on **format on save** (Prettier) and **ESLint fixes on save** in your
      editor.
- Before committing:
    - Run `npm run lint` and `npm run format:check`.