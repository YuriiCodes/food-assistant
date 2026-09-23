export const MS_PER_HOUR = 60 * 60 * 1000;

export function getFastingWindow(
	startAt: Date,
	eatingWindowHours: number,
): { startAt: Date; endsAt: Date } {
	return {
		startAt,
		endsAt: new Date(startAt.getTime() + eatingWindowHours * MS_PER_HOUR),
	};
}

export function getReminderDelayMs(
	endsAt: Date,
	now: Date,
	hoursBeforeEnd: number,
): number {
	return Math.max(
		0,
		endsAt.getTime() - now.getTime() - hoursBeforeEnd * MS_PER_HOUR,
	);
}

export function getEndDelayMs(endsAt: Date, now: Date): number {
	return Math.max(0, endsAt.getTime() - now.getTime());
}

export function formatInTimeZone(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone,
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	}).format(date);
}

export function formatHoursLabel(hours: number): string {
	if (hours === 1) return "1 hour";
	if (Number.isInteger(hours)) return `${hours} hours`;
	const minutes = Math.round(hours * 60);
	return `${minutes} minutes`;
}
