import { expect, type Page, type Locator } from '@playwright/test';
import { Verify } from '../';

class Find extends Verify {
	issueDrugsBtn: Locator;
	searchTitle: Locator;
	enterPINFLInput: Locator;
	enterSafeCodeInput: Locator;
	confidantCheckbox: Locator;
	scanBtn: Locator;
	submitBtn: Locator;

	constructor(page: Page) {
		super(page);

		this.issueDrugsBtn = page.getByRole('button', { name: 'Выдать препараты' });
		this.searchTitle = page.getByRole('heading', { name: 'Выдать препараты' });
		this.enterPINFLInput = page.getByPlaceholder('Введите ПИНФЛ');
		this.enterSafeCodeInput = page.getByPlaceholder('Введите защитный код');
		this.confidantCheckbox = page.getByLabel('Доверенное лицо');
		this.scanBtn = page.getByRole('button', { name: 'Сканировать QR-код' });
		this.submitBtn = page.getByRole('button', { name: 'Найти рецепт' });
	}

	async clickIssueDrugsBtn() {
		await this.issueDrugsBtn.click();
	}

	async assertSearchInterface() {
		await expect(this.searchTitle).toBeVisible();
		await expect(this.enterPINFLInput).toBeEnabled();
		await expect(this.enterSafeCodeInput).toBeEnabled();
		await expect(this.confidantCheckbox).not.toBeChecked();
		await expect(this.scanBtn).toBeVisible();
		await expect(this.submitBtn).toBeDisabled();
	}

	async enterPINFL(pinfl: string) {
		await this.enterPINFLInput.fill(pinfl);
	}

	async enterSafeCode(safeCode: string) {
		await this.enterSafeCodeInput.fill(safeCode);
	}

	async assertSubmitBtn() {
		await expect(this.submitBtn).toBeEnabled();
	}

	async submitSearch() {
		await this.submitBtn.click();
	}
}

export default Find;
