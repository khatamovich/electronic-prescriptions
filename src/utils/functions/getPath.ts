import { relative, resolve } from 'path';

const getPath = (path: string): string => {
	path = relative(process.cwd(), resolve(path));
	return path === '' ? '.' : path;
};

export default getPath;
