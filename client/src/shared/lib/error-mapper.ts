interface ApiError {
  statusCode: number
  code: string
  message: string
  details?: unknown[]
}

const codeMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  EMAIL_IN_USE: 'Este e-mail já está em uso.',
  NOT_FOUND: 'Recurso não encontrado.',
  APPOINTMENT_CONFLICT: 'Conflito de horário: médico ou paciente já tem consulta neste horário.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Acesso não autorizado.',
}

export function mapApiError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Erro inesperado. Tente novamente.'

  const axiosError = error as { response?: { data?: ApiError } }
  const data = axiosError.response?.data

  if (!data) return 'Erro de conexão. Verifique sua internet.'

  if (data.code && codeMessages[data.code]) {
    return codeMessages[data.code]
  }

  if (data.statusCode === 409) return codeMessages.APPOINTMENT_CONFLICT
  if (data.statusCode === 401) return codeMessages.UNAUTHORIZED
  if (data.statusCode === 403) return codeMessages.FORBIDDEN
  if (data.statusCode === 404) return codeMessages.NOT_FOUND
  if (data.statusCode === 400) return codeMessages.VALIDATION_ERROR

  return data.message ?? 'Erro inesperado. Tente novamente.'
}
