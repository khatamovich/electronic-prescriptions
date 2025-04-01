const getRandomNumber = (int: number): number => {
	if (int <= 0) return 0; // Prevent invalid cases

	return Math.floor(Math.random() * int);
};

export default getRandomNumber;
