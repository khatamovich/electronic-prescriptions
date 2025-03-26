import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.ENV}` });

class ConfigManager {
	get(key: string): string | null {
		key = key.toUpperCase();

		if (!process.env[key]) throw new Error(`VARIABLE ${key} NOT FOUND!`);

		return process.env[key] as string;
	}
}

export default new ConfigManager();
