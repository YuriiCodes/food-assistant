import { ok } from "node:assert/strict";

export function assert(
	condition: unknown,
	message?: string,
): asserts condition {
	ok(condition, message);
}
