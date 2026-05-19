FROM oven/bun:1.3.14

WORKDIR /app

COPY package.json bun.lock ./


RUN bun install --frozen-lockfile


COPY . .

CMD ["sh", "-c", "bun run migrate && bun src/index.ts"]