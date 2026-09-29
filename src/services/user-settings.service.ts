import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { type UserSettings, userSettings } from "../db/schema.ts";
import { assert } from "../lib/assert.ts";
import { createLogger } from "../lib/logger.ts";

const logger = createLogger("UserSettingsService");

export class UserSettingsService {
	constructor(private readonly database: Database) {}

	async getOrCreate(userId: number): Promise<UserSettings> {
		const [settings] = await this.database
			.insert(userSettings)
			.values({ userId })
			.onConflictDoUpdate({
				target: userSettings.userId,
				set: { userId },
			})
			.returning();

		assert(settings, `Failed to get or create settings for user ${userId}`);

		return settings;
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
