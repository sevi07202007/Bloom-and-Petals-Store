.PHONY: up prod down logs shell seed test-be test-fe lint build smoke

# Dev mode: docker-compose.override.yml is merged automatically (hot reload, bind mounts)
up:
	docker compose up --build

# Prod-like mode: gunicorn + nginx, no bind mounts
prod:
	docker compose -f docker-compose.yml up --build

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec backend python manage.py shell

seed:
	docker compose exec backend python manage.py seed

test-be:
	docker compose run --rm -e DJANGO_SETTINGS_MODULE=config.settings.test --entrypoint "" backend pytest

# Runs against the built image (no bind mount): tsc over a macOS bind mount is very slow.
test-fe:
	docker compose build frontend
	docker run --rm bloom-petals-frontend-dev sh -c "npx tsc --noEmit && npx vitest run"


lint:
	docker compose run --rm --no-deps --entrypoint "" backend ruff check .
	docker run --rm bloom-petals-frontend-dev npm run lint

build:
	docker compose -f docker-compose.yml build

smoke:
	./scripts/smoke.sh
