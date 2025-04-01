import {
	PlaywrightManager,
	FileManager,
	ConfigManager,
	getRandomNumber,
} from '../utils/';
import {
	Role,
	PrescriptionType,
	PrescriptionStatus,
	Endpoint,
	HttpMethod,
} from '../enums';
import {
	Base,
	Prescribe,
	Verify,
	Edit,
	Sign,
	Review,
	Find,
	Issue,
} from '../features';
import dayjs from 'dayjs';

const { suite, it, beforeEach, getResponse, APIContext } = PlaywrightManager;

suite('Реимбурсационный рецепт', async () => {
	// *** Данные врача и пациента ***
	const doctor = FileManager.json('storage/doctor');
	const patient = FileManager.json('storage/patient');
	const prescriptions = FileManager.json('storage/prescriptions');

	// *** Если данные врача либо пациента не обнаружены, прекратить запуск кода и сообщить о дальнейших действиях ***
	if (!patient || !doctor) throw new Error('Execute "npm run setup" command');

	// *** Если данные врача либо пациента обнаружены продолжить запуск остального кода ***
	const { access_token, token_type } = doctor;
	const { id: patientId, surname, name, patronymic, pinfl } = patient;

	if (
		prescriptions.ignoredDrugIds.length >= 4 &&
		prescriptions.patientId === patient.id
	) {
		throw new Error(
			`Patient 5196829 has reached the maximum prescription limit for this month`,
		);
	}

	beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	it('Выписка', async ({ page }) => {
		// *** Создать API контексты для МИС и для ФГМС ***
		const request = await APIContext({
			Authorization: `${token_type} ${access_token}`,
		});

		const fundRequest = await APIContext({
			Authorization: `${token_type} ${ConfigManager.get('ACCESS_TOKEN_FUND')}`,
		});

		// *** Получить список выписанных рецептов ***
		const { data: prescriptions } = await request(
			`${Endpoint.PatientPrescriptions}?patient_id=${patientId}&type=reimbursement&statuses[0]=approve&statuses[1]=issued`,
		);

		const ignoredDrugIds = prescriptions
			.filter(
				({ drug_appointment }) =>
					dayjs(drug_appointment.created_at).format('MM') ===
					dayjs().format('MM'),
			)
			.map(({ drug_appointment }) => drug_appointment.medication.id);

		// Сохранить черный список id МНН в storage
		FileManager.store('storage/prescriptions.json', {
			patientId,
			ignoredDrugIds,
		});

		// *** Получить список болезней пациента ***
		const { data: diseases } = await request(
			`${Endpoint.PatientDispensaries}?patient_id=${patientId}&active=1`,
		);

		// *** Получить список кодов болезней пациента ***
		const diseaseCodes = diseases?.map(({ disease_code }) => disease_code.code);

		// *** Получить список категории из ФГМС ***
		const { data: categories } = await fundRequest(
			Endpoint.ReimbursementCategories,
		);

		// *** Отфильтровать категории по активированным ***
		const activeCategories = categories.filter(
			(cat: any) => cat.available_for_issue,
		);

		// *** Продублировать массив категории с новым параметром codes в котором содержатся коды доступных в ФГМС болезеней ***
		const mappedCategories = activeCategories.map((cat) => ({
			...cat,
			codes: cat.diagnosis.map((diagnose: any) => diagnose.code),
		}));

		// *** Найти подходящую под болезнь пациента категорию. В противном случае присвоить к переменной рандомную категорию ***
		let matchedCategory = mappedCategories.find((cat) =>
			diseaseCodes.some((code: string) => cat?.codes.includes(code)),
		) || {
			...mappedCategories[getRandomNumber(mappedCategories.length)],
			match: false,
		};

		// Если совпадении нет, добавить пациенту болезнь рандомной категории
		if (matchedCategory.match === false) {
			const diagnose = matchedCategory?.diagnosis[0];

			// prettier-ignore
			const payload = {
			    "pregnancies": [],
			    "dispensaries": [
			        {
			            "disease_code": diagnose.code,
			            "disease_code_obj": {
			                "code": diagnose.code,
			                "title": diagnose.title
			            },
			            "registration_date": dayjs().format('YYYY-MM-DD')
			        }
			    ],
			    "disabilities": [],
			    "beneficiaries": []
			}

			await request(
				`${Endpoint.PatientUpdate}/${patientId}/records/batch-update`,
				{
					method: HttpMethod.Patch,
					data: payload,
				},
				true,
			);
		}

		// *** Получить список доступных препаратов по id категории и***
		let { data: reimbursementDrugs } = await fundRequest(
			`${Endpoint.ReimbursementDrugs}?categories[0]=${matchedCategory.id}&per_page=12&page=1`,
		);

		const drugsAvailableForIssue = reimbursementDrugs.filter(
			(drug: any) =>
				drug.available_for_issue === true &&
				!ignoredDrugIds.includes(drug.inn.id),
		);

		if (drugsAvailableForIssue.length < 1) {
			throw new Error('Could not find any suitable drugs');
		}

		const randomDrug =
			drugsAvailableForIssue[getRandomNumber(drugsAvailableForIssue.length)];

		const drug: {
			id: number;
			price: {
				min: number;
				max: number;
			};
			TN: string;
			INN: {
				title: string;
				quantity: number;
			};
		} = {
			id: randomDrug.id,
			price: {
				min: randomDrug.min_price,
				max: randomDrug.max_price,
			},
			TN: randomDrug.trade_name.title,
			INN: {
				title: randomDrug.inn.title,
				quantity:
					randomDrug.inn.quantities[
						getRandomNumber(randomDrug.inn.quantities.length)
					],
			},
		};

		// *** Сохранить данные реимбурсационного препарата в storage ***
		FileManager.store('storage/drug.json', drug);
		// ============================================================

		const base = new Base(page);
		await base.useRole(Role.Doctor);
		await base.gotoMC(patientId);

		await base.assertPatient(surname, name, patronymic);

		await base.clickNewEpisode();
		await base.clickPlusRecipeBtn();

		const prescribe = new Prescribe(page);
		await prescribe.setPrescriptionType(PrescriptionType.Reimbursement);
		await prescribe.clickPrescribeBtn();
		await prescribe.setINN(String(drug.INN.title));
		await prescribe.setDosageForm();
		await prescribe.setDose();
		await prescribe.setFrequency('1');
		await prescribe.setSingleDose();
		await prescribe.setRouteOfAdministration();
		await prescribe.setDuration(String(drug.INN.quantity));
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
		const prescription = FileManager.json('storage/prescription.reimbursement');
		const { number, inn, safe_code, dosageForm, dose, administrationRoute } =
			prescription;

		const verify = new Verify(page);
		await verify.useRole(Role.Doctor);
		await verify.gotoPrescriptions('reimbursement');
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
		const prescription = FileManager.json('storage/prescription.reimbursement');
		const { id, number } = prescription;

		const edit = new Edit(page);
		await edit.useRole(Role.Doctor);
		await edit.gotoPrescriptions('reimbursement');
		await edit.viewPrescription(number);
		await edit.clickEditBtn();
		await edit.clickSaveBtn();
		await edit.assertResponse(id);
	});

	it('Подписание', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.reimbursement');
		const { number } = prescription;

		const sign = new Sign(page);
		await sign.useRole(Role.Doctor);
		await sign.gotoPrescriptions('reimbursement');
		await sign.viewPrescription(number);
		await sign.clickSignBtn('reimbursement');
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
		await sign.assertStatus(PrescriptionStatus.AwaitingConfirmation);
	});

	it('Подтверждение', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.reimbursement');
		const { number, inn, safe_code, dosageForm, dose, administrationRoute } =
			prescription;

		const review = new Review(page);
		await review.useRole(Role.PrescriptionReviewer, '/recipes**');
		await review.gotoPrescriptions('reimbursement');
		await review.viewPrescription(number);
		await review.assertPatient(surname, name, patronymic);
		await review.assertINN(inn);
		await review.assertSafeCode(safe_code);
		await review.assertDosageForm(dosageForm);
		await review.assertDose(dose);
		await review.assertRouteOfAdministration(administrationRoute);
		await review.assertStatus(PrescriptionStatus.AwaitingConfirmation);
		await review.clickApproveBtn();
		await review.viewPrescription(number);
		await review.assertStatus(PrescriptionStatus.Approve);
	});

	it('Выдача', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.reimbursement');
		let drug = FileManager.json('storage/drug');
		const { id: prescriptionId, number, safe_code, duration } = prescription;

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
		await issue.setDrugName(prescriptionId);
		await issue.setExpirationDate();
		await issue.setSerial();
		await issue.setCount(duration);
		drug = FileManager.json('storage/drug');
		await issue.setPrice(String(drug.price.max * duration));
		await issue.clickIssueBtn();
		await issue.setIdentification();
		await issue.clickContinueBtn();
		await issue.assertResponse();
	});

	it('Верификация корректности выдачи', async ({ page }) => {
		const prescription = FileManager.json('storage/prescription.reimbursement');
		const { number } = prescription;

		const issue = new Issue(page);
		await issue.useRole(Role.Pharmacist, '/recipes**');
		await issue.gotoPrescriptions('reimbursement');
		await issue.viewPrescription(number);
		await issue.assertStatus(PrescriptionStatus.Issued);
	});
});
