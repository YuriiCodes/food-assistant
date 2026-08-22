// bun test forces NODE_ENV=test, which the app env schema rejects.
// This preload runs before test modules are imported and fills in
// safe defaults so unit tests never touch real services.
process.env.NODE_ENV = "local";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
process.env.SENTRY_DSN ??= "https://public@sentry.test/1";
process.env.OPEN_ROUTER_MODEL ??= "test-model";
process.env.OPEN_ROUTER_API_KEY ??= "test-key";
process.env.TELEGRAM_BOT_TOKEN ??= "123456:ABC-defGhIJKlmNoPQRsTUVwxyZ";
process.env.TELEGRAM_BOT_USERNAME ??= "test-bot";
process.env.TELEGRAM_ALLOWED_CHANNEL ??= "test-chat";
process.env.REDIS_URL ??= "redis://localhost:6379";
