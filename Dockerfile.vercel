FROM node:22-alpine

# Enable Corepack and pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY app/agent/package.json ./app/agent/

# Install dependencies across workspace
RUN pnpm install

# Copy agent code and configuration
COPY app/agent ./app/agent

# Build TypeScript to dist
WORKDIR /app/app/agent
RUN pnpm run build

# Default environment for Vercel / Container runtimes
ENV NODE_ENV=production
ENV PORT=80
ENV AGENT_BIND_HOST=0.0.0.0

EXPOSE 80 9000 8088

CMD ["node", "dist/unifiedMain.js"]
