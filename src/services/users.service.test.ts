import { describe, expect, it } from "bun:test";
import type { User } from "../db/schema.ts";
import { UsersService } from "./users.service.ts";

type ChainConfig = {
	returning?: unknown[];
};

function createChainableDb(config: ChainConfig = {}) {
	const calls: { method: string; args: unknown[] }[] = [];

	const track =
		(method: string) =>
		(...args: unknown[]) => {
			calls.push({ method, args });
			return builder;
		};

	const builder: Record<string, unknown> = {
		values: track("values"),
		onConflictDoUpdate: track("onConflictDoUpdate"),
		insert: track("insert"),
		returning: async () => config.returning ?? [],
	};

	return { db: builder as never, calls };
}

describe("UsersService", () => {
	const existingUser: User = {
		id: 1,
		telegramId: "42",
		firstName: "Yurii",
		username: "yurii",
		createdAt: new Date(2026, 0, 1),
	};

	it("upsert returns the persisted user", async () => {
		const { db, calls } = createChainableDb({ returning: [existingUser] });
		const service = new UsersService(db);

		const result = await service.upsert({
			telegramId: "42",
			firstName: "Yurii",
			username: "yurii",
		});

		expect(result).toEqual(existingUser);
		expect(calls.some(({ method }) => method === "insert")).toBe(true);
		expect(calls.some(({ method }) => method === "onConflictDoUpdate")).toBe(
			true,
		);
	});

	it("upsert throws when the database returns nothing", async () => {
		const { db } = createChainableDb({ returning: [] });
		const service = new UsersService(db);

		await expect(service.upsert({ telegramId: "42" })).rejects.toThrow(
			"Error upserting user",
		);
	});
});
