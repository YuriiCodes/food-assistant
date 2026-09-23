import { describe, expect, it } from "bun:test";
import {
	formatHoursLabel,
	formatInTimeZone,
	getEndDelayMs,
	getFastingWindow,
	getReminderDelayMs,
	MS_PER_HOUR,
} from "./time-utils.ts";

describe("getFastingWindow", () => {
	it("ends 8 hours after start by default", () => {
		const startAt = new Date("2026-09-23T08:00:00.000Z");
		const { endsAt } = getFastingWindow(startAt, 8);
		expect(endsAt.toISOString()).toBe("2026-09-23T16:00:00.000Z");
	});
});

describe("getReminderDelayMs", () => {
	it("schedules 3h and 1h reminders before end", () => {
		const now = new Date("2026-09-23T08:00:00.000Z");
		const { endsAt } = getFastingWindow(now, 8);
		expect(getReminderDelayMs(endsAt, now, 3)).toBe(5 * MS_PER_HOUR);
		expect(getReminderDelayMs(endsAt, now, 1)).toBe(7 * MS_PER_HOUR);
	});

	it("clamps negative delays to zero", () => {
		const now = new Date("2026-09-23T08:00:00.000Z");
		const { endsAt } = getFastingWindow(now, 8);
		const late = new Date(endsAt.getTime() - 30 * 60 * 1000);
		expect(getReminderDelayMs(endsAt, late, 3)).toBe(0);
	});
});

describe("getEndDelayMs", () => {
	it("equals the full window when scheduled at start", () => {
		const now = new Date("2026-09-23T08:00:00.000Z");
		const { endsAt } = getFastingWindow(now, 8);
		expect(getEndDelayMs(endsAt, now)).toBe(8 * MS_PER_HOUR);
	});
});

describe("formatInTimeZone", () => {
	it("formats in Europe/Berlin with CET/CEST suffix", () => {
		// Late September: Berlin is on CEST (UTC+2)
		const endsAt = new Date("2026-09-23T16:00:00.000Z");
		const formatted = formatInTimeZone(endsAt, "Europe/Berlin");
		expect(formatted).toContain("18:00");
		expect(formatted).toContain("23 Sep");
	});
});

describe("formatHoursLabel", () => {
	it("handles singular, plural and fractional hours", () => {
		expect(formatHoursLabel(3)).toBe("3 hours");
		expect(formatHoursLabel(1)).toBe("1 hour");
		expect(formatHoursLabel(0.5)).toBe("30 minutes");
	});
});
