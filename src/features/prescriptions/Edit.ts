import { expect, type Page, type Locator } from '@playwright/test';
import { Verify } from '../';

class Edit extends Verify {
	editBtn: Locator;
	saveBtn: Locator;
	frequency: Locator;

	constructor(page: Page) {
		super(page);

		this.editBtn = page.getByRole('button', { name: 'Редактировать' });
		this.saveBtn = page.getByRole('button', { name: 'Сохранить' });
	}

	async clickEditBtn() {
		await this.editBtn.click();
	}

	async clickSaveBtn() {
		await this.saveBtn.click();
	}

	async assertResponse(prescriptionId: string) {
		const response = await this.page.waitForResponse(
			(response) =>
				response.request().method() === 'PUT' &&
				response
					.url()
					.includes(`/api/prescriptions/v1/prescriptions/${prescriptionId}`),
		);

		expect(response.status()).toBe(200);
	}
}

export default Edit;
