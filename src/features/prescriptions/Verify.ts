import { expect, type Page, type Locator } from '@playwright/test';
import { PrescriptionStatus, PrescriptionType } from '../../enums';
import { Base } from '../';

class Verify extends Base {
	constructor(page: Page) {
		super(page);
	}

	async gotoPrescriptions(type: string = 'simple') {
		await this.page.goto(`/recipes?type=${type}`);
	}

	async viewPrescription(prescriptionNumber: string) {
		await this.page.getByRole('button', { name: prescriptionNumber }).click();
	}

	async assertPatient(surname: string, name: string, patronymic: string) {
		await expect(
			this.page
				.getByLabel('ФИО пациента')
				.getByText(`${surname} ${name} ${patronymic || ''}`),
		).toBeVisible();
	}

	async assertINN(INN: string) {
		await expect(this.page.getByLabel('МНН').getByText(INN)).toBeVisible();
	}

	async assertSafeCode(safeCode: string) {
		await expect(
			this.page.getByLabel('Защитный код').getByText(safeCode),
		).toBeVisible();
	}

	async assertDosageForm(dosageForm: string) {
		await expect(
			this.page.getByLabel('Форма выпуска').getByText(dosageForm),
		).toBeVisible();
	}

	async assertDose(dose: string) {
		await expect(
			this.page.getByLabel('Доза', { exact: true }).getByText(dose),
		).toBeVisible();
	}

	async assertRouteOfAdministration(administrationRoute: string) {
		await expect(
			this.page.getByLabel('Способ применения').getByText(administrationRoute),
		).toBeVisible();
	}

	async assertStatus(status: PrescriptionStatus) {
		await expect(
			this.page.getByLabel('Просмотр').getByText(status, { exact: true }),
		).toBeVisible();
	}
}

export default Verify;
