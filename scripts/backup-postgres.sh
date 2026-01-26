#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/ronic404/Web development/My sites and apps/car-wash"
BACKUP_DIR="${ROOT_DIR}/backups"
CONTAINER_NAME="car-wash-db"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Load .env if present (for POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB)
if [ -f "${ROOT_DIR}/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "${ROOT_DIR}/.env"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-carwash}"
POSTGRES_DB="${POSTGRES_DB:-car_wash}"

if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  echo "POSTGRES_PASSWORD is not set. Add it to ${ROOT_DIR}/.env" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date +"%Y-%m-%d_%H-%M")"
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

docker exec -e "PGPASSWORD=${POSTGRES_PASSWORD}" "${CONTAINER_NAME}" \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  | gzip -9 > "${BACKUP_FILE}"

echo "Backup created: ${BACKUP_FILE}"

# Cleanup old backups
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime "+${RETENTION_DAYS}" -print -delete
