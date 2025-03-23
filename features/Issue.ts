import { expect, type Page, type Locator } from '@playwright/test';
import { Playwright } from '../Playwright';
import { Verify } from './';
import { HttpMethod } from '../enums';

const { getResponse } = new Playwright();

export class Issue extends Verify {
	constructor(page: Page) {
		super(page);
	}
}
