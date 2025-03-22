import { relative } from 'path';

export const getPath = (path: string) => relative(process.cwd(), path);
