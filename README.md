# food-assistant-bot

A Telegram bot that analyzes food photos and tracks your daily nutrition.

Send a photo of your meal and the bot will estimate calories, carbs, protein, and fats using AI. All results are saved to a database and you can request summary reports for any time period.

## Requirements

- [Bun](https://bun.sh) v1.3.14+
- PostgreSQL 17+
- A Telegram bot token (from [@BotFather](https://t.me/BotFather))
- An [OpenRouter](https://openrouter.ai) API key

## Environment variables

Create a `.env` file in the project root:

```
NODE_ENV=local                    # local | production

DATABASE_URL=postgresql://username:password@localhost:5432/default_database

SENTRY_DSN=

OPEN_ROUTER_API_KEY=
OPEN_ROUTER_MODEL=                # e.g. google/gemini-2.0-flash

TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=            # without @
TELEGRAM_ALLOWED_CHANNEL=         # channel ID the bot is restricted to
```

## Running locally

Start the database:

```bash
docker compose up -d database
```

Install dependencies, run migrations, then start the bot:

```bash
bun install
bun run migrate
bun run start
```

## Core features

- **Nutrition analysis** — send any food photo and receive an estimate of calories, carbs, protein, and fats
- **Automatic logging** — every analysis is saved to the database against your Telegram user ID
- **Reports** — request a nutrition summary broken down by day, with totals for the chosen time period