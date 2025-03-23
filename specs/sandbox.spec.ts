import { Playwright } from '../Playwright';
import { Base, Prescribe, Verify, Edit } from '../features';
import { getPath, getDirFiles, writeFile, getEnvVars } from '../utils';
import { HttpMethod, PrescriptionType, Role, Status } from '../enums';
import { verify } from 'crypto';

const { suite, it, beforeEach, getResponse } = new Playwright();

suite('@simple Обычный рецепт', async () => {
	const [ENV] = getEnvVars(['env']);

	const [patient] = getDirFiles(getPath('storage/.patient'));
	const { id: patientId, surname, name, patronymic } = patient;

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
		await prescribe.setFrequency();
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

		// *** Пишем рецепт в storage/.tmp/simple.{env}.json ***
		const prescriptionResponse = await getResponse(
			page,
			'/api/prescriptions/v1/prescriptions',
			HttpMethod.POST,
		);

		writeFile(
			getPath(`storage/.tmp/${prescriptionResponse.data[0].type}.${ENV}.json`),
			{ ...prescriptionResponse.data[0], ...setValues },
		);
	});

	it('Верификация корректности выписки', async ({ page }) => {
		const [prescription] = getDirFiles(getPath('storage/.tmp'));
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

	it.only('Редактирование', async ({ page }) => {
		const [prescription] = getDirFiles(getPath('storage/.tmp'));
		const { number } = prescription;

		const edit = new Edit(page);

		await edit.useRole(Role.Doctor);
		await edit.gotoPrescriptions();
		await edit.viewPrescription(number);
		await edit.clickEditBtn();
		await edit.addComment('QA Automation + Security Engineer');
		await edit.clickSaveBtn();
		await edit.viewPrescription(number);
		await edit.assertUpdatedVersion();
	});

	// it('Подписание', async ({ page }) => {});

	// it('Выдача', async ({ page }) => {});

	// it('Верификация корректности выдачи', async ({ page }) => {});

	// it('Выгрузка отчетности Excel', async ({ page }) => {});
});
