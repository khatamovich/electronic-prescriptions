import { expect, type Page, type Locator } from '@playwright/test';
import { FileManager, PlaywrightManager } from '../../utils';
import { Verify } from '../';
import { Endpoint, HttpMethod, HttpStatus } from '../../enums';
import dayjs from 'dayjs';

const { getResponse } = PlaywrightManager;

class Issue extends Verify {
	heading: Locator;
	tradeNameOption: Locator;
	tradeName: Locator;
	startDate: Locator;
	endDate: Locator;
	serial: Locator;
	issueCount: Locator;
	issuePrice: Locator;
	issueBtn: Locator;
	confirmBtn: Locator;
	identificationOption: Locator;
	continueBtn: Locator;

	confirmationTxt: string;
	maxPrice: number;

	constructor(page: Page) {
		super(page);

		this.heading = page.getByRole('heading', { name: 'Выдать препараты' });
		this.tradeName = page.locator('.cell .el-select');
		this.tradeNameOption = page.getByRole('option').first();
		this.startDate = page
			.getByRole('cell', { name: '-' })
			.getByPlaceholder('Начало');
		this.endDate = page
			.getByRole('cell', { name: '-' })
			.getByPlaceholder('Конец');
		this.serial = page.locator('.el-table__row td .el-input__inner').nth(0);
		this.issueCount = page.locator('.el-table__row td .el-input__inner').nth(1);
		this.issuePrice = page.locator('.el-table__row td .el-input__inner').nth(2);
		this.issueBtn = page
			.getByRole('contentinfo')
			.getByRole('button', { name: 'Выдать препараты' });
		this.confirmBtn = page.getByRole('button', { name: 'Подтвердить' });
		this.identificationOption = page.getByText(
			'Нет возможности подтвердить личность',
			{ exact: true },
		);
		this.continueBtn = page.getByRole('button', { name: 'Продолжить' });
	}

	async clickPrescriptionNumber(number: string) {
		await this.page.getByRole('button', { name: number }).click();
	}

	async assertHeading() {
		await expect(this.heading).toBeVisible();
	}

	async setDrugName(prescriptionId: string = '') {
		await this.tradeName.click();
		await this.tradeNameOption.click();

		if (prescriptionId) {
			const releasedPrice = await getResponse(
				this.page,
				`api/prescriptions/v1/prescriptions/${prescriptionId}/release-price`,
			);

			const drug = FileManager.json('storage/drug');

			FileManager.store('storage/drug.json', {
				...drug,
				price: { ...drug.price, max: releasedPrice.max_price },
			});
		}
	}

	async setExpirationDate() {
		const startDate = dayjs().format('DD.MM.YYYY');
		const endDate = dayjs().add(30, 'day').format('DD.MM.YYYY');

		await this.startDate.fill(startDate);
		await this.endDate.fill(endDate);
	}

	async setSerial() {
		await this.serial.fill('Playwright');
	}

	async setCount(issueCount: string) {
		await this.issueCount.fill(issueCount);
	}

	async setPrice(issuePrice: string) {
		console.log(issuePrice);
		await this.issuePrice.fill(issuePrice);
	}

	async clickIssueBtn() {
		await this.issueBtn.click();
	}

	async clickConfirmBtn() {
		await this.confirmBtn.click();
	}

	async setIdentification() {
		await this.identificationOption.check();
	}

	async clickContinueBtn() {
		await this.continueBtn.click();
	}

	async assertResponse() {
		const issuingResponse = await getResponse(
			this.page,
			'/api/prescriptions/v1/prescriptions/issue',
			HttpMethod.POST,
			true,
		);

		expect(issuingResponse.status()).toEqual(HttpStatus.OK);
	}
}

export default Issue;
