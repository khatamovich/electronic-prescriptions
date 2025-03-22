import { readdirSync, readFileSync } from 'fs';
import { getEnvVars, log } from './';

export const getDirFiles = (dirPath: string): any => {
	const [env] = getEnvVars(['env']);

	const files = readdirSync(dirPath)?.filter((file) =>
		file.includes(`.${env}.json`),
	);

	const result: any = [];

	files?.forEach((file) => {
		const item = JSON.parse(readFileSync(dirPath + '/' + file, 'utf-8'));
		result.push(item);
	});

	if (result.length < 1) log('Directory is empty');

	return result;
};
