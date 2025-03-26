import { expect, type Page, type Locator } from '@playwright/test';
import { Role } from '../enums';

class Base {
	page: Page;
	newEpisodeBtn: Locator;
	plusRecipeBtn: Locator;

	constructor(page: Page) {
		this.page = page;

		this.newEpisodeBtn = page.getByRole('button', { name: '+ Новый эпизод' });
		this.plusRecipeBtn = page.getByRole('button', { name: '+ Рецепт' });
	}

	async useRole(role: Role, waitURL: string = '/patients**') {
		await this.page.getByRole('heading', { name: role }).first().click();
		await this.page.waitForURL(waitURL);
	}

	async gotoMC(patientId: string) {
		await this.page.goto(`/patients/${patientId}/medical-card`);
	}

	async assertPatient(surname: string, name: string, patronymic: string) {
		await expect(
			this.page.getByText(`${surname} ${name} ${patronymic || ''}`),
		).toBeVisible();
	}

	async clickNewEpisode() {
		await this.newEpisodeBtn.click();
	}

	async clickPlusRecipeBtn() {
		await this.plusRecipeBtn.click();
	}
}

export default Base;
