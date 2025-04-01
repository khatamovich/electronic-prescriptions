import { expect, type Page, type Locator } from '@playwright/test';
import { PlaywrightManager } from '../../utils';
import { HttpMethod } from '../../enums';
import { Verify } from '../';

const { getResponse } = PlaywrightManager;

class Sign extends Verify {
	signBtn: Locator;
	signingTitle: Locator;
	enterCodeInput: Locator;
	signingInstructions: Locator;
	submitBtn: Locator;

	constructor(page: Page) {
		super(page);

		this.signBtn = page.getByRole('button', {
			name: 'Подписать рецепт',
		});
		this.signingTitle = page.getByRole('heading', { name: 'DMED Pro' });
		this.enterCodeInput = page.getByRole('textbox', { name: '* Введите код' });
		this.signingInstructions = page
			.getByRole('dialog', { name: 'DMED Pro' })
			.getByRole('list');
		this.submitBtn = page.getByRole('button', {
			name: 'Подписать',
			exact: true,
		});
	}

	async clickSignBtn(type: string = 'simple') {
		if (type === 'reimbursement') {
			await this.page
				.getByRole('button', {
					name: 'Отправить на утверждение',
				})
				.click();

			return;
		}

		await this.signBtn.click();
	}

	async assertSigningInterface() {
		await expect(this.signingTitle).toBeVisible();
		await expect(this.signingInstructions).toHaveText(
			'Для подписания рецепта перейдите в приложение DMED PRO Откройте раздел “Подписание рецепта“ в профиле Введите код, который отображается в Мобильном приложении',
		);
	}

	async enterSigningCode(code: string) {
		await this.enterCodeInput.fill(String(code));
	}

	async assertSigningCode(code: string) {
		await expect(this.enterCodeInput).toHaveValue(String(code));
	}

	async submitSigning() {
		await this.submitBtn.click();
	}

	async assertResponse() {
		const signingResponse = await getResponse(
			this.page,
			'/api/prescriptions/v1/prescriptions/signing',
			HttpMethod.POST,
		);

		expect(signingResponse.result).toBeTruthy();
	}
}

export default Sign;
