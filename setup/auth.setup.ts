import { Playwright } from '../classes';
import { getEnvVars, getPath, log } from '../utils';
import { TokenPurpose } from '../enums';
import { existsSync } from 'fs';

const { it: setup, setStorageItems } = new Playwright();

setup('Авторизация', async ({ page }) => {
	const [access_token, device_id] = getEnvVars(['access_token', 'device_id'], {
		useActiveEnv: true,
	});

	const authStoragePath = getPath(`storage/.auth/${process.env.ENV}.json`);

	if (!existsSync(authStoragePath)) {
		await page.goto('/');

		await setStorageItems(page, {
			access_token,
			device_id,
			access_token_purpose: TokenPurpose.RoleSelection,
		});

		const context = page.context();

		await context.storageState({ path: authStoragePath });

		return;
	}

	log(`Using old version of ${authStoragePath}`);
});
