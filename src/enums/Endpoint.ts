export enum Endpoint {
	LoginAsRole = '/api/mis/v2/auth/login-as-role',
	FindByDocuments = '/api/mis/v2/patients/find-by-documents',
	PatientDispensaries = '/api/mis/v2/dispensaries',
	PatientUpdate = '/api/mis/v2/patients',
	ReimbursementCategories = '/api/prescriptions/v1/reimbursements/categories',
	ReimbursementDrugs = '/api/prescriptions/v1/reimbursements/drugs',
	ReimbursementTNs = '/api/prescriptions/v1/drug-trade-names',
}
