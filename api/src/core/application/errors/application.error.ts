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
    super(`Email ${email} já está em uso`, 'EMAIL_ALREADY_IN_USE');
  }
}
