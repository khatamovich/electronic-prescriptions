import { type Page, type Locator } from '@playwright/test';
import { Playwright } from '../Playwright';
import { Base } from './base';
import { PrescriptionType } from '../enums';
import { getRandomNumber } from '../utils';

const { expect, getResponse } = new Playwright();

export class Prescribe extends Base {
	prescribeBtn: Locator;
	INN: Locator;
	dosageForm: Locator;
	substanceDosage: Locator;
	frequency: Locator;
	singleDose: Locator;
	route: Locator;
	duration: Locator;
	drugCount: Locator;
	continueBtn: Locator;
	saveBtn: Locator;

	durationValue: string;

	constructor(page: Page) {
		super(page);

		this.prescribeBtn = page.getByRole('button', { name: 'Выписать' });
		this.INN = page.getByRole('combobox', { name: '* МНН' });
		this.dosageForm = page.getByRole('combobox', { name: 'Форма выпуска' });
		this.substanceDosage = page.getByRole('combobox', {
			name: '* Доза',
			exact: true,
		});
		this.frequency = page.getByRole('combobox', {
			name: '* Частота приёма',
			exact: true,
		});
		this.singleDose = page.getByRole('combobox', {
			name: '* Разовая доза',
			exact: true,
		});
		this.route = page.getByRole('combobox', {
			name: '* Способ применения',
		});
		this.duration = page.getByRole('textbox', {
			name: '* Продолжительность приёма',
		});
		this.drugCount = page.getByRole('textbox', {
			name: 'Кол-во препарата за весь период',
		});
		this.continueBtn = page.getByRole('button', { name: 'Продолжить' });
		this.saveBtn = page.getByRole('button', { name: 'Сохранить' });
	}

	async setPrescriptionType(type: PrescriptionType) {
		await this.page.getByText(type, { exact: true }).check();
	}

	async clickPrescribeBtn() {
		await this.prescribeBtn.click();
	}

	async setINN() {
		await this.INN.click();

		const INNsResponse = await getResponse(
			this.page,
			'/api/prescriptions/v1/inn',
		);

		const randomIndex = getRandomNumber(INNsResponse.data.length);

		const { title } = INNsResponse.data[randomIndex];

		await this.page.getByRole('option', { name: title }).click();
	}

	async setDosageForm() {
		await this.dosageForm.click();

		const dosageFormsResponse = await getResponse(
			this.page,
			'/api/prescriptions/v1/dosage-forms',
		);

		const randomIndex = getRandomNumber(dosageFormsResponse.data.length);

		const { title } = dosageFormsResponse.data[randomIndex];

		await this.page.getByRole('option', { name: title }).click();
	}

	async setDose() {
		await this.substanceDosage.click();

		const substanceDosagesResponse = await getResponse(
			this.page,
			'/api/prescriptions/v1/substance-dosages',
		);

		const randomIndex = getRandomNumber(substanceDosagesResponse.data.length);

		const { dosage, measurement_unit } =
			substanceDosagesResponse.data[randomIndex];

		await this.page
			.getByRole('option', {
				name: `${dosage} ${measurement_unit.title}`,
				exact: true,
			})
			.click();
	}

	async setFrequency() {
		await this.frequency.click();

		await this.page.getByRole('option', { name: `1 раз в` }).click();
	}

	async setSingleDose() {
		await this.singleDose.click();

		await this.page.getByRole('option', { name: '1', exact: true }).click();
	}

	async setRouteOfAdministration() {
		await this.route.click();

		const routesResponse = await getResponse(
			this.page,
			'/api/prescriptions/v1/drug-administration-routes',
		);

		const randomIndex = getRandomNumber(routesResponse.data.length);

		const { title } = routesResponse.data[randomIndex];

		await this.page.getByRole('option', { name: title }).click();
	}

	async setDuration(duration: string) {
		this.durationValue = duration;
		await this.duration.fill(duration);
	}

	async assertDrugCount() {
		await expect(this.drugCount).toHaveValue(this.durationValue);
	}

	async clickContinueBtn() {
		await this.continueBtn.click();
	}

	async clickSaveBtn() {
		await this.saveBtn.click();
	}
}
