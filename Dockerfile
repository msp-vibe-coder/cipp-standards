FROM node:20-alpine

# Install cron daemon
RUN apk add --no-cache dcron

WORKDIR /app

# Install dependencies (need devDeps for build: TypeScript, TailwindCSS, etc.)
COPY package.json package-lock.json ./
RUN npm ci

# Install 'serve' for static file serving
RUN npm install -g serve

# Copy source
COPY . .

# Initial sync + build
RUN node scripts/sync-standards.js && npm run build

# Copy entrypoint and sync scripts
COPY docker/entrypoint.sh docker/sync-and-rebuild.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/sync-and-rebuild.sh

# Cron schedule (default every 6 hours, configurable via SYNC_CRON env var at runtime)
ENV SYNC_CRON="0 */6 * * *"

EXPOSE 3000

CMD ["/usr/local/bin/entrypoint.sh"]
