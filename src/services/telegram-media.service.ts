import type { Api } from "grammy";
import type { PhotoSize } from "grammy/types";
import { ENV } from "../config/env.ts";
import { assert } from "../lib/assert.ts";

const DEFAULT_TARGET_WIDTH = 1024;

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
};

export interface ImageFileBuffer {
	buffer: Buffer;
	mimeType: string;
}

export class TelegramMediaService {
	constructor(private readonly api: Api) {}

	public pickPhotoSize(
		photoSizes: PhotoSize[],
		targetWidth: number = DEFAULT_TARGET_WIDTH,
	): PhotoSize | null {
		const sorted = [...photoSizes].sort((a, b) => a.width - b.width);
		return (
			sorted.find((size) => size.width >= targetWidth) ?? sorted.at(-1) ?? null
		);
	}

	public async fetchImage(fileId: string): Promise<ImageFileBuffer> {
		const file = await this.api.getFile(fileId);
		assert(file.file_path, "No file_path returned from Telegram");

		const response = await fetch(buildTelegramFileUrl(file.file_path));
		assert(response.ok, `Failed to fetch image: ${response.statusText}`);

		return {
			buffer: Buffer.from(await response.arrayBuffer()),
			mimeType: resolveMimeType(file.file_path),
		};
	}

	public toDataUrl(buffer: Buffer, mimeType: string): string {
		return `data:${mimeType};base64,${buffer.toString("base64")}`;
	}
}

function buildTelegramFileUrl(filePath: string): string {
	return `https://api.telegram.org/file/bot${ENV.TELEGRAM_BOT_TOKEN}/${filePath}`;
}

function resolveMimeType(filePath: string): string {
	const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
	return MIME_TYPE_BY_EXTENSION[extension] ?? "image/jpeg";
}
