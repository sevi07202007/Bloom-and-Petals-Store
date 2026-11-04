# ---- base: install deps ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- dev: Vite dev server with HMR (used by docker-compose.override.yml) ----
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: compile static assets ----
FROM base AS build
COPY . .
RUN npm run build

# ---- prod: nginx serving the SPA and proxying /api to the backend ----
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
