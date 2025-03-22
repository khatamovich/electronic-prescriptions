import dotenv from 'dotenv';

export const getEnvVars = (
	variables: string[],
	options: { useActiveEnv: boolean } = { useActiveEnv: false },
): string[] => {
	const env = process.env.ENV;

	if (!process.env.ENV) throw new Error('Could not find ENV');

	const { parsed } = !options?.useActiveEnv
		? dotenv.config()
		: dotenv.config({ path: `.env.${env}` });

	const result: string[] = [];

	parsed &&
		variables &&
		variables.forEach((variable) => {
			variable = variable.toUpperCase();
			result.push(parsed[variable]);
		});

	return result;
};
