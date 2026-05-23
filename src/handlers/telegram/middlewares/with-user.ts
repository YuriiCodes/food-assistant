import type { MiddlewareFn } from "grammy";
import type { UsersService } from "../../../services/users.service.ts";
import type { AppContext } from "../types/app-context.ts";

export function createUserMiddleware(
	usersService: UsersService,
): MiddlewareFn<AppContext> {
	return async (ctx, next) => {
		const from = ctx.from;
		if (!from) {
			console.warn("No from field on context - skipping user upsert");
			throw new Error("No from field on context - skipping user upsert");
		}

		ctx.user = await usersService.upsert({
			telegramId: String(from.id),
			firstName: [from.first_name, from.last_name].filter(Boolean).join(" "),
			username: from.username,
		});

		return next();
	};
}
