FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/core/package.json ./packages/core/
COPY apps/bot/package.json ./apps/bot/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/core ./packages/core
COPY apps/bot ./apps/bot
COPY tsconfig.base.json ./

RUN pnpm --filter @astralis/types build
RUN pnpm --filter @astralis/core build
RUN pnpm --filter @astralis/bot build

CMD ["node", "apps/bot/dist/index.js"]
