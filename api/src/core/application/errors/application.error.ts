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
