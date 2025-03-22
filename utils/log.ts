import dotenv from 'dotenv';
dotenv.config();

export const log = (
	input: any,
	options: { type: string } = { type: 'log' },
): void => {
	if (process.env.ENV === 'production') return;

	console[options?.type](input);
};
