// AppError — a typed error class that carries an HTTP status code.
// Throw this anywhere in the service layer; the error middleware picks it up.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
