# Bloom & Petals

A flower-shop web application with a customer storefront and a staff inventory system.
Built as a case study in a clean, Dockerised Python + React architecture.

- **Backend:** Python 3.12, Django 5.1, Django REST Framework, PostgreSQL 16
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Infra:** Docker Compose for everything (dev with hot reload, and a prod-like build with gunicorn + nginx)

# Bloom & Petals – Local Setup Guide

## Requirements
Make sure you have installed the following:

- [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Project Directory

```text
bloom-petals-main/
├── backend/
│   ├── .venv/
│   ├── .env
│   └── manage.py
└── frontend/
    ├── package.json
    └── ...
```

## How to Run the Project

### 1. Open the Project

Open the project folder in VS Code:

```text
C:\xampp\htdocs\bloom-petals-main
```

Open the integrated terminal using `Ctrl + `` `.

### 2. Start the Backend (Django)

Open the first terminal and run:

```powershell
cd C:\xampp\htdocs\bloom-petals-main\backend
```

Remove any inherited PostgreSQL database URL so the local SQLite configuration in `backend/.env` can be used:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
```

Set the development settings:

```powershell
$env:DJANGO_SETTINGS_MODULE = "config.settings.dev"
```

Start the Django development server:

```powershell
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
```

Wait until the server displays:

```text
Starting development server at http://127.0.0.1:8000/
```

Keep this terminal running.

### 3. Start the Frontend (React + Vite)

Open a second terminal in VS Code.

Navigate to the frontend directory:

```powershell
cd C:\xampp\htdocs\bloom-petals-main\frontend
```

If dependencies have not been installed yet, run:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Wait until Vite displays:

```text
Local: http://localhost:5173/
```

Keep this terminal running.

### 4. Open the Website

Visit the following URLs in your browser:

| Service | URL |
|---|---|
| Bloom & Petals Website | http://localhost:5173/ |
| Backend Health Check | http://127.0.0.1:8000/api/health/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

## Important Reminders

- Always start the backend before the frontend.
- Use two separate terminals: one for Django and one for React/Vite.
- Keep both terminals running while using the system.
- Press `Ctrl + C` in each terminal to stop its server.
- Do not run database reset commands just to start the project.
- The backend uses the existing local SQLite database at `backend/db.sqlite3`.
- If the local virtual environment (`.venv`) is missing, recreate it and install the backend requirements before starting the backend.
- Never commit `.env`, database files containing private data, passwords, or secret keys to GitHub.

## Quick Start Summary

**Terminal 1 – Backend**

```powershell
cd C:\xampp\htdocs\bloom-petals-main\backend
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
$env:DJANGO_SETTINGS_MODULE = "config.settings.dev"
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
```

**Terminal 2 – Frontend**

```powershell
cd C:\xampp\htdocs\bloom-petals-main\frontend
npm run dev
```

**Open:** http://localhost:5173/

## Quick start

```bash
cp .env.example .env     # set DJANGO_SECRET_KEY to a unique local value first
make up                  # or: docker compose up --build
```

| What | URL | Credentials |
|---|---|---|
| Storefront (Vite dev server) | http://localhost:5173 | Demo customer account documented in local project guidance |
| API docs (Swagger) | http://localhost:8000/api/docs/ | |
| Django admin (staff backoffice) | http://localhost:8000/admin/ | `staff@bloom.local`; staff12345 |
| Postgres | localhost:5433 | bloom / bloom |

## Staff Backoffice Login

The existing Staff Backoffice account is:

- Email: `staff@bloom.local`
- Password: staff12345
- Frontend login: `http://127.0.0.1:5173/login`
- Django Admin: `http://127.0.0.1:8000/admin/`

The original seeded password is defined in
`backend/apps/accounts/management/commands/seed_users.py` for the staff entry. Verify the
password locally in that existing source file when needed; do not copy the actual password into
documentation, environment files, scripts, Git, or frontend demo credential displays.

The account has `is_staff=True` but `is_superuser=False`. Some Django Admin pages may therefore
have limited model permissions.

Do not run the seeder just to recover Staff Backoffice access when `staff@bloom.local` already
exists. Reseeding does not change an existing account and is unnecessary for password recovery.

On first boot the backend container runs migrations, creates the admin user and seeds demo
users, products and orders (`SEED_DEMO_DATA=1` in `.env`; all seeders are idempotent).

Prod-like run (nginx serving the built SPA on http://localhost:8080, gunicorn behind it):

```bash
make prod                # docker compose -f docker-compose.yml up --build
```

## Running on Windows

The whole stack runs inside Docker, so Windows needs no local Python, Node or Postgres. Tested
approach: **Docker Desktop with the WSL 2 backend** (the default on Windows 10 21H2+ / Windows 11).

1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   and make sure it is running with the WSL 2 engine enabled (Settings → General → "Use the WSL 2
   based engine").
2. Install [Git for Windows](https://git-scm.com/download/win). The repo ships a `.gitattributes`
   that forces LF line endings, so the default `core.autocrlf=true` setting is fine; the backend
   `entrypoint.sh` will still run inside the Linux container.
3. Clone the repo and create the env file. In **PowerShell**:

   ```powershell
   git clone https://github.com/ronalddantic/bloom-petals.git
   cd bloom-petals
   Copy-Item .env.example .env
   docker compose up --build
   ```

   Or in **Command Prompt**: `copy .env.example .env` then `docker compose up --build`.

4. Open the same URLs as above: storefront on http://localhost:5173, admin on
   http://localhost:8000/admin/, API docs on http://localhost:8000/api/docs/.

**Makefile equivalents.** `make` is not installed on Windows by default. Each target is a single
Docker command, so run them directly (or install `make` via `winget install GnuWin32.Make` /
`choco install make` and use the Makefile as-is):

| `make` target | Windows command |
|---|---|
| `make up` | `docker compose up --build` |
| `make prod` | `docker compose -f docker-compose.yml up --build` |
| `make down` | `docker compose down` |
| `make logs` | `docker compose logs -f` |
| `make shell` | `docker compose exec backend python manage.py shell` |
| `make seed` | `docker compose exec backend python manage.py seed` |
| `make test-be` | `docker compose run --rm -e DJANGO_SETTINGS_MODULE=config.settings.test --entrypoint "" backend pytest` |
| `make test-fe` | `docker compose build frontend` then `docker run --rm bloom-petals-frontend-dev sh -c "npx tsc --noEmit && npx vitest run"` |
| `make lint` | `docker compose run --rm --no-deps --entrypoint "" backend ruff check .` then `docker run --rm bloom-petals-frontend-dev npm run lint` |
| `make smoke` | see below |

**Smoke test.** `scripts/smoke.sh` is a bash script that needs `curl` and `jq`. On Windows run it
from a WSL shell or Git Bash (`bash scripts/smoke.sh`), with `jq` installed in that environment.

**Tips**

- **Best performance:** clone the repo *inside* your WSL 2 distro (e.g. `~/code/bloom-petals` in
  Ubuntu) and run `docker compose` from there. Bind mounts from the Windows filesystem
  (`/mnt/c/...`) are much slower, and file-change detection for hot reload is less reliable.
  Hot reload already uses polling (`CHOKIDAR_USEPOLLING`) so it works either way, just slower.
- **Port conflicts:** the stack uses host ports 5173, 8000, 5433 and 8080. If one is taken (e.g. a
  local Postgres on 5433), change the left-hand side of the mapping in
  `docker-compose.override.yml`.
- **Line endings:** if you edited `backend/entrypoint.sh` in a Windows editor and the backend
  container exits with `no such file or directory`, the file has CRLF endings. Re-save it as LF or
  run `git checkout -- backend/entrypoint.sh`.
- **Everything else is identical**: the dev/prod compose split, seeders, demo accounts and env
  variables behave exactly as documented above because they all run in Linux containers.

## Making your own copy

Nothing in the project is tied to the GitHub URL or the folder name (Docker image names are fixed
in the compose files), so you can copy it anywhere and run it unchanged. Pick one of three routes.

### Option A: Fork on GitHub (fastest, keeps a link to this repo)

1. Open https://github.com/ronalddantic/bloom-petals and click **Fork** → **Create fork**.
2. Clone *your* fork and run it:

   ```bash
   git clone https://github.com/<your-user>/bloom-petals.git
   cd bloom-petals
   cp .env.example .env
   docker compose up --build
   ```

A fork shows "forked from ronalddantic/bloom-petals" on GitHub and lets you pull future changes
with `git fetch upstream`. Use Option B or C if you want a standalone repo instead.

### Option B: Standalone copy with full history

Use this to keep every commit but have a repo that is entirely yours (no fork relationship, can be
private, any name).

1. Create an **empty** repo on GitHub (no README, no .gitignore, no licence) and note its URL,
   e.g. `https://github.com/<your-user>/<new-name>.git`.
2. Clone this repo and point it at the new remote:

   ```bash
   git clone https://github.com/ronalddantic/bloom-petals.git <new-name>
   cd <new-name>
   git remote set-url origin https://github.com/<your-user>/<new-name>.git
   git push -u origin main
   ```

   To keep this repo reachable for later merges, add it back as `upstream`:

   ```bash
   git remote add upstream https://github.com/ronalddantic/bloom-petals.git
   ```

3. `cp .env.example .env` and `docker compose up --build` as usual.

With the GitHub CLI, step 1 and the push collapse into one command run inside the clone:

```bash
gh repo create <your-user>/<new-name> --private --source=. --remote=origin --push
```

### Option C: Fresh start without history

Use this to publish the code as a brand-new project with a single initial commit.

```bash
git clone --depth 1 https://github.com/ronalddantic/bloom-petals.git <new-name>
cd <new-name>
rm -rf .git
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-user>/<new-name>.git
git push -u origin main
```

On Windows (PowerShell) replace `rm -rf .git` with `Remove-Item -Recurse -Force .git`.

### After copying

- **Secrets:** `.env` is git-ignored and is never copied; create it from `.env.example` and set a
  new `DJANGO_SECRET_KEY` and database password before deploying anywhere public.
- **Demo accounts:** the seeded logins listed under Quick start are for local use only. Set
  `SEED_DEMO_DATA=0` or change the passwords for a real deployment.
- **Renaming:** if you want the Docker images named after your project, change the `image:`
  values in `docker-compose.yml` and `docker-compose.override.yml`, the two `docker run` lines in
  the Makefile, and the Windows command table above.
- **Attribution:** this project is published as a case study. Keep or update the Photo credits
  section, since the product photos are Wikimedia Commons images with their own licences.

## Features

**Storefront**
- Catalog with categories, search, filters, sorting and pagination
- Product pages with live stock status ("Only 3 left", "Out of stock")
- Cart that works logged-out (localStorage) and merges into the server cart on login
- Checkout that atomically creates an order and decrements stock
- Order history and order detail pages
- JWT auth with silent refresh

**Inventory / backoffice**
- Django admin with an "Adjust stock" action that routes through the service layer
- Immutable `StockMovement` audit log (restock, sale, return, adjustment, damage)
- Staff API: product CRUD, stock adjustments, movement history, low-stock report
- Orders admin with fulfil / cancel-and-restock actions
- New-order awareness in the admin: a live badge on the Orders sidebar item (paid orders waiting to be
  fulfilled), a "To fulfil" dashboard KPI, and a 20-second poll (`core/static/admin/notify.js` against
  `GET /api/inventory/orders/queue/`) that prefixes the tab title with the count and shows a toast for
  each order that arrived while the admin was open

**Design**
- Storefront: botanical design system in Tailwind (cream / rose / sage palette, Cormorant Garamond display
  type, Inter body), hero and collection tiles, hover add-to-bag, slide-out mini-cart, toasts, skeleton
  loaders, mobile nav drawer.
- Admin: themed with [django-unfold](https://unfoldadmin.com) in the same palette, with a custom
  dashboard (7-day revenue, orders today, awaiting payment, low-stock list, recent orders and stock
  movements, order sparkline) defined in `backend/core/dashboard.py` + `core/templates/admin/index.html`.
- Error pages: the storefront renders branded 404 / 403 / 500 pages (`src/components/ErrorPage.tsx`,
  routes `/403` and `/500` exist for previewing); Django serves matching `core/templates/{404,403,500}.html`
  for non-API routes when `DEBUG=0` (staff on `/admin/*` get versions inside the admin shell from
  `core/templates/admin/errors/`) while `/api/*` keeps JSON errors; nginx shows `public/50x.html` if the
  backend is unreachable.
- Product photos are CC-licensed images from Wikimedia Commons, bundled in
  `backend/apps/catalog/fixtures/images/` (attribution in `CREDITS.json`) and attached by `seed_catalog`.

**Payments** are a school-project simulation behind a provider interface
(`apps/payments/providers/`). The fake provider marks orders paid for workflow
demonstration only: it does not collect, process, or verify any payment.

## Architecture

```
┌──────────────┐   /api, /admin, /media   ┌──────────────┐        ┌────────────┐
│  frontend    │ ───────────────────────▶ │   backend    │ ─────▶ │  postgres  │
│ nginx / vite │                          │ django + drf │        │            │
└──────────────┘                          └──────────────┘        └────────────┘
```

All browser traffic goes to one origin; the frontend container proxies `/api` to the
backend, so there is no CORS configuration in production.

### Backend layout

```
backend/
├── config/settings/{base,dev,prod,test}.py
├── core/            TimeStampedModel, IsStaff permission, pagination, domain exceptions
└── apps/
    ├── accounts/    email-based User, register / token / me
    ├── catalog/     Category, Product, ProductImage, public read-only API, seed_catalog
    ├── inventory/   StockMovement + services.adjust_stock (the ONLY write path for stock)
    ├── orders/      Cart, Order, services.checkout (atomic, row-locked), seed_orders
    └── payments/    provider interface + fake provider
```

**Key design decisions**

- `Product.stock_quantity` is only ever changed by `inventory.services.adjust_stock`, which
  takes a `SELECT ... FOR UPDATE` row lock and writes a `StockMovement`. Admin, the staff API,
  checkout and cancellation all go through it.
- `orders.services.checkout` runs in one transaction, locks all products in the cart in
  primary-key order (deterministic, deadlock-free), validates every line before writing
  anything, and returns HTTP 409 with the shortfall if any line can't be fulfilled.
- Order items snapshot product name and price, so later price changes don't rewrite history.
- Domain errors (`InsufficientStock`, `InvalidOrderState`, …) are plain exceptions mapped to
  HTTP responses by one DRF exception handler in `core/exceptions.py`.
- No background workers in v1: nothing in the request path is slow enough to need them.
  Emails, Stripe webhooks or scheduled reports would be the trigger to add Celery + Redis
  as two more compose services.

### Frontend layout

```
frontend/src/
├── api/         axios client (JWT header + one refresh-and-retry on 401), typed endpoint modules
├── auth/        AuthContext, token storage (access in memory, refresh in localStorage)
├── cart/        CartContext: unified cart over localStorage (guest) and the server (logged in)
├── components/  Layout, Navbar, ProductCard, QuantityInput, ProtectedRoute, …
└── pages/       Home, Catalog, ProductDetail, Cart, Checkout, OrderConfirmation, Login, Register, account/*
```

## API overview

All routes are under `/api/`. Interactive docs at `/api/docs/`.

| Area | Endpoints | Auth |
|---|---|---|
| Auth | `POST auth/register/`, `auth/token/`, `auth/token/refresh/`; `GET/PATCH auth/me/` | public / user |
| Catalog | `GET categories/`, `products/` (`?category=&search=&in_stock=&ordering=`), `products/{slug}/` | public |
| Cart | `GET cart/`, `POST cart/items/`, `PATCH/DELETE cart/items/{id}/`, `POST cart/merge/`, `DELETE cart/clear/` | user |
| Checkout | `POST checkout/` → 201 order, 409 insufficient stock, 400 empty cart | user |
| Orders | `GET orders/`, `orders/{number}/` | user (own) |
| Payments | `POST payments/{number}/intent/`, `payments/{number}/confirm/` | owner |
| Inventory | `inventory/products/` (CRUD), `inventory/products/low-stock/`, `POST inventory/adjustments/`, `GET inventory/movements/` | staff |
| Misc | `GET health/`, `schema/`, `docs/` | public |

## Development

```bash
make up         # dev stack with hot reload (backend: runserver, frontend: vite)
make down
make logs
make shell      # Django shell in the backend container
make seed       # re-run all seeders
make test-be    # pytest against the compose Postgres (includes concurrency tests)
make test-fe    # tsc + vitest
make lint       # ruff + eslint
make smoke      # scripts/smoke.sh: register → cart → checkout → pay → verify stock
```

Demo accounts are defined by the existing `seed_users` command. Use the staff email and original
seeded password locally; keep actual passwords out of documentation. See the
**Staff Backoffice Login** section above.

## Testing strategy

- **Backend** (`pytest`, runs against Postgres so row locks are real): service-level tests for
  stock adjustment and checkout, API tests for auth / scoping / 409 handling, and two
  concurrency tests that race threads over the last unit of stock and assert exactly one wins.
- **Frontend** (`vitest` + Testing Library + msw): cart storage helpers, product card states,
  protected-route redirect, checkout form schema.
- **Smoke** (`scripts/smoke.sh`): the full purchase flow over HTTP against a running stack.

## Environment variables

See `.env.example`. The important ones:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres DSN used by Django |
| `DJANGO_SETTINGS_MODULE` | `config.settings.prod` (compose default) or `.dev` (override) |
| `DJANGO_SUPERUSER_EMAIL/PASSWORD` | Admin user created on first boot |
| `SEED_DEMO_DATA` | `1` to run all seeders on boot |
| `PAYMENT_PROVIDER` | Dotted path to the payment provider class |
| `FRONTEND_URL` | Where `http://localhost:8000/` redirects in dev (prod redirects to `/admin/`) |

## Photo credits

Product imagery comes from Wikimedia Commons under CC0 / CC BY / CC BY-SA licences. Per-image
author, licence and source links are in `backend/apps/catalog/fixtures/images/CREDITS.json`.
