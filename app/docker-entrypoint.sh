#!/bin/sh

set -e

echo "Waiting for database..."

until pg_isready -h db -p 5432 -U "${POSTGRES_USER}"
do
    sleep 1
done

echo "Database is ready."

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ "$NODE_ENV" = "production" ]; then
    echo "Running required master seed..."
    npm run db:seed:master

    echo "Starting production server..."
    exec npm start
else
    echo "Starting development server..."
    exec npm run dev
fi