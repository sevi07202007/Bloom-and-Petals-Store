#!/bin/sh
set -e

echo "Waiting for Postgres..."
i=0
until python -c "import os, psycopg; psycopg.connect(os.environ['DATABASE_URL']).close()" 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -ge 30 ]; then echo "Postgres not reachable, giving up."; exit 1; fi
  sleep 1
done
echo "Postgres is up."

python manage.py migrate --noinput

if [ "$DJANGO_SETTINGS_MODULE" = "config.settings.prod" ]; then
  python manage.py collectstatic --noinput
fi

if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput --email "$DJANGO_SUPERUSER_EMAIL" 2>/dev/null \
    && echo "Superuser created." || echo "Superuser already exists."
fi

if [ "$SEED_DEMO_DATA" = "1" ]; then
  python manage.py seed
fi

exec "$@"
