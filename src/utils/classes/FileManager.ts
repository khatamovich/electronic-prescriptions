import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'fs';
import getPath from '../functions/getPath';
import { dirname } from 'path';

class FileManager {
	json(path: string): any {
		try {
			path = getPath(path + '.json');

			const content = readFileSync(path, 'utf-8');

			return JSON.parse(content);
		} catch (exception) {
			console.error(exception);

			return null;
		}
	}

	store(path: string, data: any): void {
		try {
			path = getPath(path);
			const dir = dirname(path);

			mkdirSync(dir, { recursive: true });

			writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
		} catch (exception) {
			console.error(exception);
		}
	}

	remove(path: string) {
		try {
			path = getPath(path);

			if (this.exists(path)) {
				rmSync(path, { recursive: true });
				console.log(`Removed ${path}`);
			} else {
				console.warn(`Could not find ${path}`);
			}
		} catch (error) {
			console.error(`Could not remove ${path}`, error);
		}
	}

	exists(path: string): boolean {
		path = getPath(path);

		return existsSync(path);
	}
}

export default new FileManager();
