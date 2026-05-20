#!/bin/sh

echo "Waiting for database..."

until pg_isready -h db -p 5432 -U postgres; do
  sleep 1
done

echo "Database ready"

npx prisma migrate deploy

if [ "$NODE_ENV" = "production" ]; then
  exec node dist/index.js
else
  exec npm run dev
fi