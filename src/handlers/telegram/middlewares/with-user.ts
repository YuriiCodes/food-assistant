import type { MiddlewareFn } from "grammy";
import { assert } from "../../../lib/assert.ts";
import type { UserSettingsService } from "../../../services/user-settings.service.ts";
import type { UsersService } from "../../../services/users.service.ts";
import type { AppContext } from "../types/app-context.ts";

export function createUserMiddleware(
	usersService: UsersService,
	userSettingsService?: UserSettingsService,
): MiddlewareFn<AppContext> {
	return async (ctx, next) => {
		const from = ctx.from;
		assert(from, "No from field on context - skipping user upsert");

		ctx.user = await usersService.upsert({
			telegramId: String(from.id),
			firstName: [from.first_name, from.last_name].filter(Boolean).join(" "),
			username: from.username,
		});

		if (userSettingsService) {
			await userSettingsService.ensureForUser(ctx.user.id);
		}

		return next();
	};
}
