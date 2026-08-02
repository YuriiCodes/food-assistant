#!/bin/sh
set -e
if [ "$PROCESS_TYPE" = "worker" ]; then
    exec bun src/worker.ts
else
    bunx drizzle-kit migrate
    exec bun src/server.ts
fi
