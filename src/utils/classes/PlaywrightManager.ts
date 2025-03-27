import { test, expect, request, type Page } from '@playwright/test';
import { ConfigManager, getBaseURL } from '../../utils';
import { HttpMethod } from '../../enums';

class PlaywrightManager {
	it: typeof test;
	suite: typeof test.describe;
	expect: typeof expect;
	beforeEach: typeof test.beforeEach;
	httpMethod: HttpMethod.GET | HttpMethod.POST | HttpMethod.PUT;

	constructor() {
		this.it = test;
		this.suite = test.describe;
		this.expect = expect;
		this.beforeEach = test.beforeEach;
		this.httpMethod = HttpMethod.GET;
		this.APIContext = this.APIContext.bind(this);
		this.getResponse = this.getResponse.bind(this);
		this.setStorageItems = this.setStorageItems.bind(this);
	}

	async APIContext(headers: {}) {
		const context = await request.newContext({
			baseURL: getBaseURL(process.env.ENV!, true),
			extraHTTPHeaders: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Device-Id': ConfigManager.get('DEVICE_ID')!,
				...headers,
			},
		});

		return async (
			endpoint: string,
			options: { method: typeof this.httpMethod; data?: object } = {
				method: HttpMethod.GET,
				data: {},
			},
		) => {
			const { method, data } = options;

			const response =
				method === HttpMethod.POST || method === HttpMethod.PUT
					? context[method](endpoint, { data })
					: context.get(endpoint);

			return (await response).json();
		};
	}

	async getResponse(
		page: Page,
		endpoint: string,
		method: typeof this.httpMethod = this.httpMethod,
		isJSON: boolean = true,
	) {
		const response = page.waitForResponse(
			(response) =>
				response.request().method() === method.toUpperCase() &&
				response.url().includes(endpoint),
		);

		return isJSON ? (await response).json() : await response;
	}

	async setStorageItems(page: Page, storageItems: object): Promise<void> {
		await page.evaluate((storageItems) => {
			const keys = Object.keys(storageItems);

			keys.forEach((key) => {
				localStorage.setItem(key, storageItems[key]);
			});
		}, storageItems);
	}
}

export default new PlaywrightManager();
