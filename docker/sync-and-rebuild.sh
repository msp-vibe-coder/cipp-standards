#!/bin/sh
set -e

STANDARDS_FILE="/app/src/data/standards.json"
TEMP_FILE="/tmp/standards-new.json"
URL="https://raw.githubusercontent.com/KelvinTegelaar/CIPP/main/src/data/standards.json"

echo "[$(date)] Checking for standards updates..."

# Fetch latest standards
if ! wget -q -O "$TEMP_FILE" "$URL"; then
  echo "[$(date)] ERROR: Failed to fetch standards from GitHub"
  exit 1
fi

# Compare hashes
OLD_HASH=$(md5sum "$STANDARDS_FILE" 2>/dev/null | cut -d' ' -f1 || echo "none")
NEW_HASH=$(md5sum "$TEMP_FILE" | cut -d' ' -f1)

if [ "$OLD_HASH" = "$NEW_HASH" ]; then
  echo "[$(date)] No changes detected, skipping rebuild."
  rm -f "$TEMP_FILE"
  exit 0
fi

echo "[$(date)] Changes detected, updating standards and rebuilding..."
cp "$TEMP_FILE" "$STANDARDS_FILE"
rm -f "$TEMP_FILE"

cd /app
npm run build

echo "[$(date)] Rebuild complete."
