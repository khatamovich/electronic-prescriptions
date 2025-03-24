import { Playwright } from '../Playwright';
import { Base, Prescribe, Verify, Edit, Sign, Find, Issue } from '../features';
import { getPath, getDirFiles, writeFile } from '../utils';
import { HttpMethod, PrescriptionType, Role, Status } from '../enums';
import { isSea } from 'node:sea';

const { suite, it, beforeEach, getResponse, APIContext } = new Playwright();

suite('@smoke-simple Обычный рецепт', async () => {
	// *** Данные врача и пациента ***
	const [doctor] = getDirFiles(getPath('storage/.tmp'), 'doctor');
	const [patient] = getDirFiles(getPath('storage/.patient'), 'patient');

	// *** Если данные врача либо пациента не обнаружены, прекратить запуск кода и сообщить о дальнейших действиях ***
	if (!patient || !doctor)
		throw new Error('Execute <npm run setup> command and then try again');

	// *** Если данные врача либо пациента обнаружены, создать новый API контекст и продолжить запуск остального кода ***
	const { access_token, token_type } = doctor;
	const { id: patientId, surname, name, patronymic, pinfl } = patient;

	// *** Запускать для каждого теста ***
	beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	it('Выписка', async ({ page }) => {
		const base = new Base(page);
		const prescribe = new Prescribe(page);

		await base.useRole(Role.Doctor);
		await base.gotoMC(patientId);
		await base.assertPatient(surname, name, patronymic);
		await base.clickNewEpisode();
		await base.clickPlusRecipeBtn();

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

		const prescriptionResponse = await getResponse(
			page,
			'/api/prescriptions/v1/prescriptions',
			HttpMethod.POST,
		);

		// *** Пишем выписанный рецепт в storage/.tmp/simple.{env}.json ***
		writeFile(
			getPath(
				`storage/.tmp/prescription.${prescriptionResponse.data[0].type}.json`,
			),
			{ ...prescriptionResponse.data[0], ...setValues },
			{ forceUpdate: 'y' },
		);
	});

	it('Верификация корректности выписки', async ({ page }) => {
		const [prescription] = getDirFiles(
			getPath('storage/.tmp'),
			'prescription.simple',
		);
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
		await verify.assertStatus(Status.NotSigned);
	});

	it('Редактирование', async ({ page }) => {
		const [prescription] = getDirFiles(
			getPath('storage/.tmp'),
			'prescription.simple',
		);
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
		const request = await APIContext({
			Authorization: `${token_type} ${access_token}`,
		});

		const [prescription] = getDirFiles(
			getPath('storage/.tmp'),
			'prescription.simple',
		);
		const { number } = prescription;

		const sign = new Sign(page);

		await sign.useRole(Role.Doctor);
		await sign.gotoPrescriptions();
		await sign.viewPrescription(number);
		await sign.clickSignBtn();
		await sign.assertSigningInterface();

		const signingCode = (
			await request('/api/user/identification-token?type=only_integer')
		).token;

		await sign.enterSigningCode(signingCode);
		await sign.assertSigningCode(signingCode);
		await sign.submitSigning();
		await sign.assertSigningResult();
		await sign.viewPrescription(number);
		await sign.assertStatus(Status.Approve);
	});

	it('Выдача', async ({ page }) => {
		const [prescription] = getDirFiles(
			getPath('storage/.tmp'),
			'prescription.simple',
		);
		const { number, safe_code, duration: totalAmount } = prescription;

		const find = new Find(page);
		const issue = new Issue(page);

		await find.useRole(Role.Pharmacist, '/recipes**');
		await find.clickIssueDrugsBtn();
		await find.assertSearchInterface();
		await find.enterPINFL(pinfl);
		await find.enterSafeCode(safe_code);
		await find.assertSubmitBtn();
		await find.submitSearch();
		await issue.clickPrescriptionNumber(number);
		await issue.assertHeading();
		await issue.setDrugName();
		await issue.setExpirationDate();
		await issue.setSerial();
		await issue.setCount('1');
		await issue.setPrice('5000');
		await issue.clickIssueBtn();
		await issue.clickConfirmBtn();
		await issue.setIdentification();
		await issue.clickContinueBtn();
		await issue.gotoPrescriptions();
		await issue.viewPrescription(number);
		await issue.assertStatus(Status.PartiallyIssued);
	});

	// it('Верификация корректности выдачи', async ({ page }) => {});

	// it('Выгрузка отчетности Excel', async ({ page }) => {});
});
