import { expect, type Page, type Locator } from '@playwright/test';
import { Verify } from './';

export class Edit extends Verify {
	editBtn: Locator;
	saveBtn: Locator;
	comment: Locator;

	commentValue: string;

	constructor(page: Page) {
		super(page);

		this.editBtn = page.getByRole('button', { name: 'Редактировать' });
		this.saveBtn = page.getByRole('button', { name: 'Сохранить' });
		this.comment = page.getByRole('textbox', { name: 'Примечание' });
	}

	async clickEditBtn() {
		await this.editBtn.click();
	}

	async addComment(comment: string) {
		await this.comment.fill(comment);
		this.commentValue = comment;
	}

	async clickSaveBtn() {
		await this.saveBtn.click();
	}

	async assertUpdatedVersion() {
		await expect(
			this.page.getByLabel('Примечания').getByText(this.commentValue),
		).toBeVisible();
	}
}
