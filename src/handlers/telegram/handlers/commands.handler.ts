import { Composer } from "grammy";
import type { Context } from "grammy";
import type { UsersService } from "../../../services/users.service.ts";

export function createCommandHandler(usersService: UsersService) {
    const composer = new Composer<Context>();

    composer.command("start", async (ctx) => {
        await ctx.reply("Welcome! Send me a photo of your meal to analyze it.");
    });

    composer.command("help", async (ctx) => {
        await ctx.reply("Send any food photo and I'll break down its calories and macros.");
    });


    return composer;
}