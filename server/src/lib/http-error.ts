export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = 'app_error',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (msg: string) => new AppError(400, msg, 'bad_request');
export const unauthorized = (msg = 'Não autenticado') => new AppError(401, msg, 'unauthorized');
export const forbidden = (msg = 'Acesso negado') => new AppError(403, msg, 'forbidden');
export const notFound = (msg = 'Recurso não encontrado') => new AppError(404, msg, 'not_found');
export const conflict = (msg: string) => new AppError(409, msg, 'conflict');
