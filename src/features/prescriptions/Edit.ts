import { expect, type Page, type Locator } from '@playwright/test';
import { PlaywrightManager } from '../../utils';
import { Verify } from '../';
import { HttpMethod, HttpStatus } from '../../enums';

const { getResponse } = PlaywrightManager;

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
		const editingResponse = await getResponse(
			this.page,
			`/api/prescriptions/v1/prescriptions/${prescriptionId}`,
			HttpMethod.PUT,
			false,
		);

		expect(editingResponse.status()).toEqual(HttpStatus.OK);
	}
}

export default Edit;
