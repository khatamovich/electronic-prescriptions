import { Playwright } from '../classes';
import { getEnvVars, getPath, useRole, writeFile, log } from '../utils';
import { HttpMethod, Role } from '../enums';

const { it: setup, getResponse, APIContext } = new Playwright();

setup('Поиск и сохранение пациента', async ({ page }) => {
	await page.goto('/auth/role-selection');
	const [ENV, loginAsRoleAPI, findByDocsAPI, patientPinfl] = getEnvVars([
		'env',
		'login_as_role_api_endpoint',
		'find_by_documents_api_endpoint',
		'patient_pinfl',
	]);

	await useRole(page, Role.Doctor);

	const { access_token, token_type } = await getResponse(
		page,
		loginAsRoleAPI,
		HttpMethod.POST,
	);

	// *** Находим пациента по ПИНФЛ ***
	const request = await APIContext({
		Authorization: `${token_type} ${access_token}`,
	});

	const patientResponse = await request(findByDocsAPI, {
		method: HttpMethod.POST,
		data: { pinfl: patientPinfl },
	});

	// *** Пишем данные в storage/.patient/patient.{env}.json ***
	writeFile(
		getPath(`storage/.patient/${patientResponse.data.id}.${ENV}.json`),
		patientResponse.data,
	);
});
