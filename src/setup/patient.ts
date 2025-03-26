import { PlaywrightManager, ConfigManager, FileManager } from '../utils/';
import { HttpMethod, Role, Endpoint } from '../enums';

const { it: setup, getResponse, APIContext } = PlaywrightManager;

setup('Поиск и сохранение пациента', async ({ page }) => {
	const loginAsRoleAPI = Endpoint.LoginAsRole;
	const findByDocsAPI = Endpoint.FindByDocuments;

	await page.goto('/');

	const doctorCard = page.getByRole('heading', { name: Role.Doctor });
	await doctorCard.click();

	const doctorResponse = await getResponse(
		page,
		loginAsRoleAPI,
		HttpMethod.POST,
	);

	// *** Находим пациента по ПИНФЛ ***
	const { access_token, token_type } = doctorResponse;

	const request = await APIContext({
		Authorization: `${token_type} ${access_token}`,
	});

	const patientResponse = await request(findByDocsAPI, {
		method: HttpMethod.POST,
		data: { pinfl: ConfigManager.get('PATIENT_PINFL') },
	});

	// *** Пишем данные врача в storage/.tmp/role.{env}.json ***
	FileManager.store('storage/doctor.json', doctorResponse);

	// *** Пишем данные пациента в storage/.patient/patient.{env}.json ***
	FileManager.store('storage/patient.json', patientResponse.data);
});
