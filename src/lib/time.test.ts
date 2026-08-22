import { describe, expect, it } from "bun:test";
import { getDailyRange, getWeeklyRange } from "./time.ts";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
	return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

const isMidnight = (date: Date) =>
	date.getHours() === 0 &&
	date.getMinutes() === 0 &&
	date.getSeconds() === 0 &&
	date.getMilliseconds() === 0;

const isEndOfDay = (date: Date) =>
	date.getHours() === 23 &&
	date.getMinutes() === 59 &&
	date.getSeconds() === 59 &&
	date.getMilliseconds() === 999;

describe("getDailyRange", () => {
	it("spans today from midnight to end of day", () => {
		const before = new Date();
		const { from, to } = getDailyRange();
		const after = new Date();

		expect(isMidnight(from)).toBe(true);
		expect(isEndOfDay(to)).toBe(true);
		expect(daysBetween(from, to)).toBe(0);

		for (const now of [before, after]) {
			expect(from.getTime() <= now.getTime()).toBe(true);
			expect(now.getTime() <= to.getTime()).toBe(true);
		}
	});
});

describe("getWeeklyRange", () => {
	it("spans the last 7 days including today", () => {
		const { from, to } = getWeeklyRange();

		expect(isMidnight(from)).toBe(true);
		expect(isEndOfDay(to)).toBe(true);
		expect(daysBetween(from, to)).toBe(6);
	});

	it("covers the daily range of today", () => {
		const daily = getDailyRange();
		const weekly = getWeeklyRange();

		expect(weekly.from.getTime() <= daily.from.getTime()).toBe(true);
		expect(weekly.to.getTime() >= daily.to.getTime()).toBe(true);
	});
});
