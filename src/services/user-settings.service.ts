import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { type UserSettings, userSettings } from "../db/schema.ts";
import { assert } from "../lib/assert.ts";
import { createLogger } from "../lib/logger.ts";

const logger = createLogger("UserSettingsService");

export class UserSettingsService {
	constructor(private readonly database: Database) {}

	async getOrCreate(userId: number): Promise<UserSettings> {
		const [existing] = await this.database
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, userId))
			.limit(1);

		if (existing) return existing;

		const [created] = await this.database
			.insert(userSettings)
			.values({ userId })
			.onConflictDoNothing({ target: userSettings.userId })
			.returning();

		if (created) {
			logger.info({ userId }, "created default user settings");
			return created;
		}

		const [raced] = await this.database
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, userId))
			.limit(1);

		assert(raced, `Failed to get or create settings for user ${userId}`);
		return raced;
	}

	async ensureForUser(userId: number): Promise<UserSettings> {
		return this.getOrCreate(userId);
	}

	async setAutoStartEatingWindow(
		userId: number,
		value: boolean,
	): Promise<UserSettings> {
		await this.getOrCreate(userId);

		const [updated] = await this.database
			.update(userSettings)
			.set({ autoStartEatingWindow: value, updatedAt: new Date() })
			.where(eq(userSettings.userId, userId))
			.returning();

		assert(updated, `Failed to update settings for user ${userId}`);
		logger.info({ userId, value }, "updated autoStartEatingWindow setting");
		return updated;
	}
}
