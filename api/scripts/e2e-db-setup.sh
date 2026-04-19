#!/usr/bin/env sh
set -eu

DB_NAME="${E2E_DB_NAME:-med_clinic_e2e}"
DB_USER="${POSTGRES_USER:-med_user}"
DB_CONTAINER="${POSTGRES_CONTAINER_NAME:-med-clinic-postgres}"

echo "-> Subindo Postgres e Redis (profile db)..."
docker compose --profile db up -d postgres redis

echo "-> Garantindo database E2E (${DB_NAME})..."
EXISTS="$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'")"
if [ "${EXISTS}" = "1" ]; then
  echo "   Banco ${DB_NAME} já existe."
else
  docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"
  echo "   Banco ${DB_NAME} criado."
fi

echo "✅ Ambiente E2E pronto."
