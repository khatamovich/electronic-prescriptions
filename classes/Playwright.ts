import { test, expect, request, type Page } from '@playwright/test';
import { HttpMethod } from '../enums/HttpMethod';
require('dotenv').config();

export class Playwright {
	it: typeof test;
	suite: typeof test.describe;
	expect: typeof expect;
	httpMethod: HttpMethod.GET | HttpMethod.POST | HttpMethod.PUT;

	constructor() {
		this.it = test;
		this.suite = test.describe;
		this.expect = expect;
		this.httpMethod = HttpMethod.GET;
	}

	async APIContext(headers: {}) {
		const context = await request.newContext({
			baseURL: process.env.API_BASE_URL as string,
			extraHTTPHeaders: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Device-Id': process.env.DEVICE_ID as string,
				...headers,
			},
		});

		return async (
			endpoint: string,
			options: { method: typeof this.httpMethod; data: {} } = {
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
	) {
		const response = page.waitForResponse(
			(response) =>
				response.request().method() === method && response.url().includes(endpoint),
		);

		return (await response).json();
	}
}
