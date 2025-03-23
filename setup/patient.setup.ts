import { Playwright } from '../Playwright';
import { getEnvVars, getPath, writeFile, getDirFiles, log } from '../utils';
import { HttpMethod, Role } from '../enums';

const { it: setup, getResponse, APIContext } = new Playwright();

setup('Поиск и сохранение пациента', async ({ page }) => {
	const [doctor] = getDirFiles(getPath('storage/.tmp'), 'doctor');
	const [patient] = getDirFiles(getPath('storage/.patient'));

	if (doctor && patient) {
		console.log(`Using cached doctor details =>`, doctor);
		console.log(`Using cached patient details =>`, patient);
		return;
	}

	await page.goto('/');

	const [ENV, loginAsRoleAPI, findByDocsAPI, patientPinfl] = getEnvVars([
		'env',
		'login_as_role_api_endpoint',
		'find_by_documents_api_endpoint',
		'patient_pinfl',
	]);

	const doctorCard = page.getByRole('heading', { name: Role.Doctor });
	await doctorCard.click();

	const doctorResponse = await getResponse(
		page,
		loginAsRoleAPI,
		HttpMethod.POST,
	);

	const { access_token, token_type, user } = doctorResponse;

	// *** Находим пациента по ПИНФЛ ***
	const request = await APIContext({
		Authorization: `${token_type} ${access_token}`,
	});

	const patientResponse = await request(findByDocsAPI, {
		method: HttpMethod.POST,
		data: { pinfl: patientPinfl },
	});

	// *** Пишем данные врача в storage/.tmp/role.{env}.json ***
	writeFile(getPath(`storage/.tmp/${user.role}.${ENV}.json`), doctorResponse);

	// *** Пишем данные пациента в storage/.patient/patient.{env}.json ***
	writeFile(
		getPath(`storage/.patient/${patientResponse.data.id}.${ENV}.json`),
		patientResponse.data,
	);
});
