export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EmailAlreadyInUseError extends ApplicationError {
  constructor(email: string) {
    super(`Email ${email} already in use`, 'EMAIL_ALREADY_IN_USE');
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS');
  }
}

export class InvalidRefreshTokenError extends ApplicationError {
  constructor() {
    super('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'RESOURCE_NOT_FOUND');
  }
}

export class AppointmentConflictError extends ApplicationError {
  constructor() {
    super('Doctor or patient already has an appointment at this date and time', 'APPOINTMENT_CONFLICT');
  }
}

export class CodeAlreadyInUseError extends ApplicationError {
  constructor(resource: string, code: string) {
    super(`${resource} with code ${code} already in use`, 'CODE_ALREADY_IN_USE');
  }
}
