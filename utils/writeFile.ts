import { readFileSync, writeFileSync, existsSync } from 'fs';
import dayjs from 'dayjs';
import { log } from './log';

export const writeFile = (
	path: string,
	data: object,
	options = { forceUpdate: 'n' },
): void => {
	const today: string = dayjs().format('DD-MM-YYYY');

	let cachedData: any;

	if (existsSync(path)) cachedData = JSON.parse(readFileSync(path, 'utf-8'));

	if (
		cachedData &&
		cachedData?.lastUpdated === today &&
		options?.forceUpdate !== 'y'
	) {
		log(`Using old version of ${path}`);
		return;
	}

	log(`Updating ${path}`);

	const prettyData = JSON.stringify({ ...data, lastUpdated: today }, null, 2);

	writeFileSync(path, prettyData);
};
