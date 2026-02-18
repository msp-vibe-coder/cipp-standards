#!/bin/sh
set -e

# Write cron schedule from env var
echo "${SYNC_CRON} /usr/local/bin/sync-and-rebuild.sh >> /var/log/sync.log 2>&1" | crontab -

echo "Starting cron with schedule: ${SYNC_CRON}"
crond -b

echo "Serving static site on port 3000..."
exec serve /app/out -l 3000 -s
