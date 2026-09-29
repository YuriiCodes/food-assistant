import { Composer, InlineKeyboard } from "grammy";
import { assert } from "../../../lib/assert.ts";
import { SETTINGS_TOGGLE_AUTO_START_CALLBACK_DATA } from "../../../lib/callback-data.ts";
import { createLogger } from "../../../lib/logger.ts";
import type { UserSettingsService } from "../../../services/user-settings.service.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger("createSettingsHandler");

function formatSettingsMessage(autoStart: boolean): string {
	const status = autoStart ? "ON ✅" : "OFF ❌";
	return (
		"⚙️ Your settings:\n\n" +
		`• Auto-start 8-hour eating window on first calorie track of the day: ${status}\n\n` +
		"When ON, your tracking starts automatically with the first meal of the day."
	);
}

function settingsKeyboard(autoStart: boolean): InlineKeyboard {
	const toggleLabel = autoStart ? "Turn auto-start OFF" : "Turn auto-start ON";
	return InlineKeyboard.from([
		[
			InlineKeyboard.text(
				toggleLabel,
				SETTINGS_TOGGLE_AUTO_START_CALLBACK_DATA,
			),
		],
	]);
}

export function createSettingsHandler(
	userSettingsService: UserSettingsService,
) {
	const composer = new Composer<AppContext>();

	composer.command("manage_settings", async (ctx) => {
		assert(ctx.user, "settings handler ran without with-user middleware");
		const settings = await userSettingsService.getOrCreate(ctx.user.id);

		await ctx.reply(formatSettingsMessage(settings.autoStartEatingWindow), {
			reply_markup: settingsKeyboard(settings.autoStartEatingWindow),
		});

		logger.info(
			{ userId: ctx.user.id, autoStart: settings.autoStartEatingWindow },
			"showed settings",
		);
	});

	composer.callbackQuery(
		SETTINGS_TOGGLE_AUTO_START_CALLBACK_DATA,
		async (ctx) => {
			assert(ctx.user, "settings handler ran without with-user middleware");
			const current = await userSettingsService.getOrCreate(ctx.user.id);
			const updated = await userSettingsService.setAutoStartEatingWindow(
				ctx.user.id,
				!current.autoStartEatingWindow,
			);

			await ctx.answerCallbackQuery({
				text: `Auto-start ${updated.autoStartEatingWindow ? "enabled" : "disabled"}`,
			});
			await ctx.editMessageText(
				formatSettingsMessage(updated.autoStartEatingWindow),
				{ reply_markup: settingsKeyboard(updated.autoStartEatingWindow) },
			);

			logger.info(
				{ userId: ctx.user.id, autoStart: updated.autoStartEatingWindow },
				"toggled auto-start setting",
			);
		},
	);

	return composer;
}
