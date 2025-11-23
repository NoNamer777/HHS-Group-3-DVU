# Base python image
FROM python:3.12-slim-bookworm

# Python & Poetry envs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=2.1.2 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PATH="/opt/poetry/bin:$PATH"

# OS deps
RUN set -eux; \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Everything will live in /app
WORKDIR /app

# Install dependencies (pyproject.toml & poetry.lock are in Backend/)
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

# Copy the rest of the Backend folder into /app
COPY . .

# Open ports used by app
EXPOSE 8000 5678

# Start the app
CMD ["uvicorn", "project.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
