import { PlaywrightManager, FileManager } from '../utils/';
import {
	HttpMethod,
	Role,
	PrescriptionType,
	PrescriptionStatus,
} from '../enums';
import { Base, Prescribe, Verify, Edit, Sign, Find, Issue } from '../features';

const { suite, it, beforeEach, getResponse, APIContext } = PlaywrightManager;

suite('Обычный рецепт', async () => {
	// *** Данные врача и пациента ***
	const doctor = FileManager.json('storage/doctor');
	const patient = FileManager.json('storage/patient');

	// *** Если данные врача либо пациента не обнаружены, прекратить запуск кода и сообщить о дальнейших действиях ***
	if (!patient || !doctor) throw new Error('Execute "npm run setup" command');

	// *** Если данные врача либо пациента обнаружены, создать новый API контекст и продолжить запуск остального кода ***
	const { access_token, token_type } = doctor;
	const { id: patientId, surname, name, patronymic, pinfl } = patient;

	beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	it('Выписка', async ({ page }) => {
		const base = new Base(page);
		await base.useRole(Role.Doctor);
		await base.gotoMC(patientId);
		await base.assertPatient(surname, name, patronymic);
		await base.clickNewEpisode();
		await base.clickPlusRecipeBtn();

		const prescribe = new Prescribe(page);
		await prescribe.setPrescriptionType(PrescriptionType.Simple);
		await prescribe.clickPrescribeBtn();
		await prescribe.setINN();
		await prescribe.setDosageForm();
		await prescribe.setDose();
		await prescribe.setFrequency('1');
		await prescribe.setSingleDose();
		await prescribe.setRouteOfAdministration();
		await prescribe.setDuration('30');
		await prescribe.assertDrugCount();
		await prescribe.clickContinueBtn();

		const setValues = {
			inn: prescribe.INNValue,
			dosageForm: prescribe.dosageFormValue,
			dose: prescribe.doseValue,
			administrationRoute: prescribe.routeValue,
			duration: prescribe.durationValue,
		};

		await prescribe.clickSaveBtn();

		// *** Пишем выписанный рецепт в storage ***
		const prescriptionResponse = await getResponse(
			page,
			'/api/prescriptions/v1/prescriptions',
			HttpMethod.POST,
		);

		FileManager.store(
			`storage/prescription.${prescriptionResponse.data[0].type}.json`,
			{ ...prescriptionResponse.data[0], ...setValues },
		);
	});

	it('Верификация корректности выписки', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.simple');
		const { number, inn, safe_code, dosageForm, dose, administrationRoute } =
			prescription;

		const verify = new Verify(page);
		await verify.useRole(Role.Doctor);
		await verify.gotoPrescriptions();
		await verify.viewPrescription(number);
		await verify.assertPatient(surname, name, patronymic);
		await verify.assertINN(inn);
		await verify.assertSafeCode(safe_code);
		await verify.assertDosageForm(dosageForm);
		await verify.assertDose(dose);
		await verify.assertRouteOfAdministration(administrationRoute);
		await verify.assertStatus(PrescriptionStatus.NotSigned);
	});

	it('Редактирование', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.simple');
		const { id, number } = prescription;

		const edit = new Edit(page);
		await edit.useRole(Role.Doctor);
		await edit.gotoPrescriptions();
		await edit.viewPrescription(number);
		await edit.clickEditBtn();
		await edit.clickSaveBtn();
		await edit.assertResponse(id);
	});

	it('Подписание', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.simple');
		const { number } = prescription;

		const sign = new Sign(page);
		await sign.useRole(Role.Doctor);
		await sign.gotoPrescriptions();
		await sign.viewPrescription(number);
		await sign.clickSignBtn();
		await sign.assertSigningInterface();

		const request = await APIContext({
			Authorization: `${token_type} ${access_token}`,
		});

		const signingCode = (
			await request('/api/user/identification-token?type=only_integer')
		).token;

		await sign.enterSigningCode(signingCode);
		await sign.assertSigningCode(signingCode);
		await sign.submitSigning();
		await sign.assertResponse();
		await sign.viewPrescription(number);
		await sign.assertStatus(PrescriptionStatus.Approve);
	});

	it('Выдача', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.simple');
		const { number, safe_code } = prescription;

		const find = new Find(page);
		await find.useRole(Role.Pharmacist, '/recipes**');
		await find.clickIssueDrugsBtn();
		await find.assertSearchInterface();
		await find.enterPINFL(pinfl);
		await find.enterSafeCode(safe_code);
		await find.assertSubmitBtn();
		await find.submitSearch();

		const issue = new Issue(page);
		await issue.clickPrescriptionNumber(number);
		await issue.assertHeading();
		await issue.setDrugName();
		await issue.setExpirationDate();
		await issue.setSerial();
		await issue.setCount('29');
		await issue.setPrice('5000');
		await issue.clickIssueBtn();
		await issue.clickConfirmBtn();
		await issue.setIdentification();
		await issue.clickContinueBtn();
		await issue.assertResponse();
	});

	it('Верификация корректности выдачи', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.simple');
		const { number } = prescription;

		const issue = new Issue(page);
		await issue.useRole(Role.Pharmacist, '/recipes**');
		await issue.gotoPrescriptions();
		await issue.viewPrescription(number);
		await issue.assertStatus(PrescriptionStatus.PartiallyIssued);
	});

	// it('Выгрузка отчетности Excel', async ({ page }) => {});
});
