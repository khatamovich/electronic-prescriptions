import { type Page, type Locator } from '@playwright/test';
import { Role } from '../enums';

export const useRole = async (page: Page, role: Role) => {
	const roleCard: Locator = page.getByRole('heading', { name: role });
	await roleCard.click();
};
