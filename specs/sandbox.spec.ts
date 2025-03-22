import { Playwright } from '../Playwright';
import { Base, Prescribe } from '../features';
import { getPath, getDirFiles } from '../utils';
import { PrescriptionType, Role } from '../enums';

const { suite, it, beforeEach } = new Playwright();

suite('@simple Обычный рецепт', async () => {
	beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	it('Выписка', async ({ page }) => {
		const [patient] = getDirFiles(getPath('storage/.patient'));
		const { id: patientId, surname, name, patronymic } = patient;

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
		await prescribe.clickSaveBtn();

		await page.waitForTimeout(1000);
	});

	// it('Верификация корректности выписки', async ({ page }) => {

	// });

	// it('Редактирование', async ({ page }) => {});

	// it('Подписание', async ({ page }) => {});

	// it('Выдача', async ({ page }) => {});

	// it('Верификация корректности выдачи', async ({ page }) => {});

	// it('Выгрузка отчетности Excel', async ({ page }) => {});
});
