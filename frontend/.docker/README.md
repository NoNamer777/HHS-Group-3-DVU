# Docker Setup for the React App

This directory contains the Docker- and Nginx-related configuration used to build and run the production version of the React app.

The resulting Docker image:

- Builds the app using Node.js (multi-stage build)
- Serves the static files using Nginx
- Exposes the application on **port 3000** by default

You can:

- Build and run the image directly with `docker`
- Or manage it with **Docker Compose** (recommended for multiservice setups)

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/) (or built-in `docker compose`)
- Project dependencies do **not** need to be installed locally for the basic Docker workflow (the build happens inside the container).

---

## Building the Image

From the React app directory (where `package.json` lives), run:

```bash
npm run docker:build
```

This is a convenience wrapper around `docker build` and uses the Dockerfile located at `.docker/Dockerfile`. The script will typically tag the image with a project-specific name (check `package.json` for the exact command).

If you prefer, you can also build the image directly:

```bash
docker build -f .docker/Dockerfile -t diabeticum-pedis/front-end:local .
```

---

## Running the Container

Once the image is built, you can run it with:

```bash
docker run --rm -p 3000:3000 diabeticum-pedis/front-end:latest
```

- `-p 3000:3000` maps container port `3000` to host port `3000`.
- The app should then be available at `http://localhost:3000`.

If your `npm run docker:build` script uses a different tag, substitute that tag in place of `diabeticum-pedis/front-end:latest`.

### Running in the Background

To run the container in detached mode:

```bash
docker run -d --name diabeticum-pedis/front-end -p 3000:3000 diabeticum-pedis/front-end:latest
```

To stop and remove it later:

```bash
docker stop diabeticum-pedis/front-end
docker rm diabeticum-pedis/front-end
```

---

## Running the Container with Docker Compose

For local development or when running multiple services together, Docker Compose is often more convenient than raw `docker run`.

### Example `docker-compose.yml`

Here is an example `compose.yml` placed at [.docker/compose.yml](compose.yml):

```yaml
name: diabeticum-pedis
services:
  frontend:
    image: diabeticum-pedis/front-end
    build:
      context: .
      dockerfile: .docker/Dockerfile
      tags:
        - "diabeticum-pedis/front-end:latest"
    container_name: front-end
    restart: unless-stopped
    ports:
      - "5173:3000"
```

Key points:

- `build.context: .` builds from the project root.
- `dockerfile: .docker/Dockerfile` uses the custom Dockerfile for this app.
- `ports: "5173:3000"` maps container port `3000` → host port `5173`, so you access the app at `http://localhost:5173`.
- The `tags` entry under `build` ensures the built image is also tagged as `diabeticum-pedis/front-end:latest`.

### Starting and Stopping with Compose

From the project root:

```bash
docker compose -f .docker/compose.yml up
```

or for detached (background) mode:

```bash
docker compose -f .docker/compose.yml up -d
```

Then open:

- `http://localhost:5173` in your browser (based on the port mapping above).

To stop and remove the containers:

```bash
docker compose -f .docker/compose.yml down
```

This stops all services defined in the compose file and removes their containers.

### Rebuilding the Image with Compose

When you change application code or Docker-related files and want to rebuild:

```bash
docker compose -f .docker/compose.yml up --build
```

To force a rebuild even if nothing seems to have changed:

```bash
docker compose -f .docker/compose.yml build --no-cache
docker compose -f .docker/compose.yml up -d
```

You can still use `npm run docker:build` separately if you prefer, but Compose can handle both **build** and **run** in one step.

### Example: Overriding the Host Port

If you want to serve the container on a different host port (e.g., `8080`) without changing the internal Nginx port (still 3000 inside the container), adjust `ports`:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"
```

Then access the app at `http://localhost:8080`.

---

## How the Dockerfile Works

The Dockerfile at `.docker/Dockerfile` is a **multi-stage** build:

1. **Build stage (Node.js)**

   ```dockerfile
   FROM node:24 AS build

   USER node

   WORKDIR /app

   COPY package*.json .

   RUN npm ci

   ENV NODE_ENV=production

   COPY . .

   RUN npm run build
   ```

    - Uses the official `node:24` image.
    - Installs dependencies with `npm ci`.
    - Copies the project source into the container.
    - Runs `npm run build` to produce a production build in `/app/dist`.

2. **Runtime stage (Nginx)**

   ```dockerfile
   FROM nginx:alpine3.22

   WORKDIR /usr/share/nginx/html

   COPY --from=build /app/dist .

   COPY .docker/default.conf /etc/nginx/conf.d/default.conf
   COPY .docker/nginx.conf /etc/nginx/nginx.conf

   RUN touch /var/run/nginx.pid && \
       chown -R nginx:nginx /usr/share/nginx /var/cache/nginx /var/run /etc/nginx && \
       chown -R nginx:nginx /var/run/nginx.pid && \
       chmod -R 755 /usr/share/nginx /var/cache/nginx /var/run && \
       chmod -R 644 /etc/nginx/conf.d/*.conf

   USER nginx

   EXPOSE 3000

   CMD ["nginx", "-g", "daemon off;"]
   ```

    - Uses a small `nginx:alpine3.22` image.
    - Copies the built files from the previous stage into the Nginx HTML root.
    - Applies custom Nginx configuration for this app.
    - Runs Nginx as the `nginx` user.
    - Exposes port `3000`.

---

## Nginx Configuration

Two Nginx configuration files are used:

### `.docker/default.conf`

```nginx
server {
    listen      3000;
    listen      [::]:3000;
    server_name localhost;

    root /usr/share/nginx/html;

    index index.html index.htm;

    location / {
        # Let routing be handled by the React app.
        try_files $uri $uri/ /index.html;
    }
}
```

Key points:

- Nginx listens on port `3000`.
- Serves static files from `/usr/share/nginx/html` (where the React build is
  copied).
- Uses `try_files` to fall back to `index.html`, which supports client-side
  routing (React Router, etc.).

### `.docker/nginx.conf`

```nginx
# This file was copied over from the default image and adjusted to fit our needs.
# In this case, the user command was removed.
# user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

Key points:

- Based on the default Nginx configuration with the `user` directive commented
  out (the Dockerfile sets `USER nginx` instead).
- Includes `conf.d/*.conf`, which pulls in `.docker/default.conf`.

---

## .dockerignore

The `.dockerignore` file controls what is sent to the Docker build context:

```text
*
!.docker/*.conf
!build/
!public/
!src/
!package*.json
!tsconfig*.json
!vite.config.ts
```

This:

- Ignores everything by default (`*`).
- Re-includes only:
    - Nginx configuration files in `.docker/`
    - The app source (`src/`, `public/`, `vite.config.ts`, `tsconfig*.json`)
    - Package manifests (`package*.json`)

This keeps the build context small and avoids copying unnecessary files (e.g. `node_modules`, logs, temporary files).

---

## Troubleshooting

- **App not available on localhost**:
    - Ensure the container is running: `docker ps`.
    - Verify the port mapping: `-p 3000:3000`.
    - Check logs: `docker logs <container-id>`.

- **Build failures**:
    - Make sure the project builds locally with `npm run build`.
    - Verify that all files needed for the build are included by `.dockerignore`.

If problems persist, inspect the image interactively:

```bash
docker run -it --rm diabeticum-pedis/front-end:latest sh
```

This lets you examine the file system inside the container.
