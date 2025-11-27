# HHS Group 3 DVU

This repository contains a full‑stack application with:

- **Frontend** – React.js (TypeScript), located in `./frontend`
- **Backend** – FastAPI (Python), located in `./backend`

Each project is self‑contained and has its own README with detailed instructions.

---

## Prerequisites

For local development you should have:

- **Node.js** v24
- **npm** v11
- **Python** v3.14

You can install these tools manually, or use **[Mise](https://mise.jdx.dev/)** to manage them automatically.

If you use Mise, the versions above are already configured for you via the repository’s configuration file(s).

---

## Getting Started (Quick Overview)

Clone the repository:

```bash
git clone https://github.com/nonamer777/HHS-Group-3-DVU.git
cd HHS-Group-3-DVU
```

### Using Mise (recommended)

1. Install Mise (see the official docs for your platform).
2. In the repo root, run:

   ```bash
   mise install
   ```

   This will install the configured versions of Node.js, npm, and Python.

---

## Project Structure

```text
HHS-Group-3-DVU/
├─ frontend/   # React + TypeScript web app
│  └─ README.md
├─ backend/    # FastAPI backend (Python)
│  └─ README.md
└─ ...         # misc config, tooling, etc.
```

---

## Further Documentation

- [Frontend](./frontend/README.md)
- [Backend](./backend/README.md)
