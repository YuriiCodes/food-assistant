export const getDailyRange = () => {
	const from = new Date();
	from.setHours(0, 0, 0, 0);
	const to = new Date();
	to.setHours(23, 59, 59, 999);
	return { from, to };
};

export const getWeeklyRange = () => {
	const to = new Date();
	to.setHours(23, 59, 59, 999);
	const from = new Date();
	from.setDate(from.getDate() - 6);
	from.setHours(0, 0, 0, 0);
	return { from, to };
};
