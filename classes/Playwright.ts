import { test, expect, request, type Page, APIResponse } from '@playwright/test';
import { Method } from '../enums/Method';
require('dotenv').config();

export class Playwright {
	it: typeof test;
	suite: typeof test.describe;
	expect: typeof expect;
	requestMethod: Method.GET | Method.POST | Method.PUT;

	constructor() {
		this.it = test;
		this.suite = test.describe;
		this.expect = expect;
		this.requestMethod = Method.GET;
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
			options: { method: typeof this.requestMethod; data: {} } = {
				method: Method.GET,
				data: {},
			},
		) => {
			const { method, data } = options;

			const response =
				method === Method.POST || method === Method.PUT
					? context[method](endpoint, { data })
					: context.get(endpoint);

			return (await response).json();
		};
	}

	async getResponse(
		page: Page,
		endpoint: string,
		method: typeof this.requestMethod = this.requestMethod,
	) {
		const response = page.waitForResponse(
			(response) =>
				response.request().method() === method && response.url().includes(endpoint),
		);

		return response;
	}
}
