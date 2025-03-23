import { readdirSync, readFileSync } from 'fs';
import { getEnvVars, log } from './';

export const getDirFiles = (dirPath: string, query: string = ''): any => {
	const [env] = getEnvVars(['env']);

	const files = readdirSync(dirPath)?.filter((file) =>
		!query ? file.includes(`.${env}.json`) : file.startsWith(query),
	);

	const result: any = [];

	files?.forEach((file) => {
		const item = JSON.parse(readFileSync(dirPath + '/' + file, 'utf-8'));
		result.push(item);
	});

	return result;
};
