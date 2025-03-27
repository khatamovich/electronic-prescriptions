export enum HttpMethod {
	GET = 'get',
	POST = 'post',
	PUT = 'put',
	DELETE = 'delete',
	Patch = 'patch',
}

export enum HttpStatus {
	OK = 200,
	Created = 201,
	BadRequest = 400,
	UnprocessableContent = 422,
	NotFound = 404,
	ServerError = 500,
}
