export const getDailyRange = () => {
	const from = new Date();
	from.setUTCHours(0, 0, 0, 0);
	const to = new Date();
	to.setUTCHours(23, 59, 59, 999);
	return { from, to };
};

export const getWeeklyRange = () => {
	const to = new Date();
	to.setUTCHours(23, 59, 59, 999);
	const from = new Date();
	from.setUTCDate(from.getUTCDate() - 6);
	from.setUTCHours(0, 0, 0, 0);
	return { from, to };
};
