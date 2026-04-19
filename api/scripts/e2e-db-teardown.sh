#!/usr/bin/env sh
set -eu

DB_NAME="${E2E_DB_NAME:-med_clinic_e2e}"
DB_USER="${POSTGRES_USER:-med_user}"
DB_CONTAINER="${POSTGRES_CONTAINER_NAME:-med-clinic-postgres}"
REDIS_CONTAINER="${REDIS_CONTAINER_NAME:-med-clinic-redis}"
REDIS_E2E_DB="${REDIS_DB_E2E:-2}"

echo "-> Removendo conexões ativas do banco E2E (${DB_NAME})..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" >/dev/null

echo "-> Deletando banco E2E (${DB_NAME})..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"

echo "-> Limpando Redis E2E (DB ${REDIS_E2E_DB})..."
docker exec "${REDIS_CONTAINER}" redis-cli -n "${REDIS_E2E_DB}" FLUSHDB >/dev/null

echo "✅ Banco E2E removido."
