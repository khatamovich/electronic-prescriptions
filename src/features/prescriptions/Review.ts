import { expect, type Page, type Locator } from '@playwright/test';
import { Verify } from '../';

class Review extends Verify {
	approveBtn: Locator;

	constructor(page: Page) {
		super(page);

		this.approveBtn = page.getByRole('button', { name: 'Подтвердить' });
	}

	async clickApproveBtn() {
		await this.approveBtn.click();
	}
}

export default Review;
