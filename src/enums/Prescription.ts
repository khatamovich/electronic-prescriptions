export enum PrescriptionType {
	Reimbursement = 'Реимбурсация',
	Simple = 'Обычный',
}

export enum PrescriptionStatus {
	NotSigned = 'Не подписан',
	Approve = 'Подтвержден',
	Issued = 'Выдан',
	PartiallyIssued = 'Частично выдан',
	Canceled = 'Отменен',
	Rejected = 'Отклонен',
	Expired = 'Срок истек',
}
