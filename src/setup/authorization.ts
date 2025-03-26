import {
	PlaywrightManager,
	ConfigManager,
	FileManager,
	getPath,
} from '../utils';
import { Purpose } from '../enums';
import { mkdirSync } from 'fs';

const { it: setup, setStorageItems } = PlaywrightManager;

setup('Авторизация', async ({ page }) => {
	const authStoragePath = getPath(`storage/authorization.json`);

	if (process.env.ENV && !FileManager.exists(authStoragePath)) {
		mkdirSync(getPath('storage/'), { recursive: true });
	}

	if (FileManager.exists(authStoragePath)) {
		console.log(`Using cached version of ${authStoragePath}`);
		return;
	}

	await page.goto('/');

	await setStorageItems(page, {
		access_token: ConfigManager.get('ACCESS_TOKEN'),
		device_id: ConfigManager.get('DEVICE_ID'),
		access_token_purpose: Purpose.RoleSelection,
	});

	const context = page.context();
	await context.storageState({ path: authStoragePath });
});
